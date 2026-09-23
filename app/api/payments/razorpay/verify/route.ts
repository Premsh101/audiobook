import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in before verifying payment." }, { status: 401 });

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const paymentId = typeof body.paymentId === "string" ? body.paymentId : "";
    const signature = typeof body.signature === "string" ? body.signature : "";
    const productId = typeof body.productId === "string" ? body.productId : "";

    if (!orderId || !paymentId || !signature || !productId) {
      return NextResponse.json({ error: "Payment verification details are incomplete." }, { status: 400 });
    }

    const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "utf8");
    const actualBuffer = Buffer.from(signature, "utf8");
    if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    const basic = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Basic ${basic}` },
      cache: "no-store"
    });
    const razorOrder = await orderResponse.json();
    if (!orderResponse.ok || razorOrder.status !== "paid") {
      return NextResponse.json({ error: "Payment is not confirmed yet." }, { status: 400 });
    }

    const product = await db.productPrice.findFirst({
      where: { id: productId, productType: "VOICE_CREDITS", active: true }
    });
    if (!product || !product.durationSeconds || product.durationSeconds <= 0) {
      return NextResponse.json({ error: "Credit package is no longer available." }, { status: 404 });
    }

    if (
      String(razorOrder.notes?.userId ?? "") !== user.id ||
      String(razorOrder.notes?.productId ?? "") !== product.id ||
      Number(razorOrder.amount ?? -1) !== Math.round(Number(product.amount) * 100) ||
      String(razorOrder.currency ?? "") !== product.currency
    ) {
      return NextResponse.json({ error: "Payment does not match this credit package." }, { status: 400 });
    }

    const existing = await db.walletTransaction.findUnique({ where: { reference: orderId } });
    if (existing) {
      const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
      return NextResponse.json({ ok: true, alreadyProcessed: true, balanceSeconds: wallet?.balanceSeconds ?? 0 });
    }

    const wallet = await db.$transaction(async (tx) => {
      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: "PURCHASE",
          seconds: product.durationSeconds!,
          amount: product.amount,
          currency: product.currency,
          provider: "razorpay",
          reference: orderId,
          metadata: { paymentId, productId }
        }
      });

      return tx.wallet.upsert({
        where: { userId: user.id },
        update: { balanceSeconds: { increment: product.durationSeconds! }, currency: product.currency },
        create: { userId: user.id, balanceSeconds: product.durationSeconds!, currency: product.currency }
      });
    });

    return NextResponse.json({ ok: true, balanceSeconds: wallet.balanceSeconds, currency: wallet.currency });
  } catch (error) {
    console.error("Razorpay verification failed", error);
    return NextResponse.json({ error: "Could not verify payment." }, { status: 500 });
  }
}
