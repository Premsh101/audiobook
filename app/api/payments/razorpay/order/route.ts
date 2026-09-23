import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in before buying credits." }, { status: 401 });

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Razorpay is not configured on this environment yet." }, { status: 503 });
  }

  try {
    const { productId } = await request.json();
    if (typeof productId !== "string") {
      return NextResponse.json({ error: "Choose a credit package." }, { status: 400 });
    }

    const product = await db.productPrice.findFirst({
      where: { id: productId, productType: "VOICE_CREDITS", active: true }
    });

    if (!product) return NextResponse.json({ error: "Credit package not found." }, { status: 404 });
    if (product.currency !== "INR") {
      return NextResponse.json({ error: "International checkout will be enabled separately." }, { status: 400 });
    }

    const receipt = `hush-${user.id.slice(-10)}-${Date.now().toString(36)}`;
    const amount = Math.round(Number(product.amount) * 100);

    const basic = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        currency: product.currency,
        receipt,
        notes: {
          userId: user.id,
          productId: product.id,
          creditsSeconds: String(product.durationSeconds ?? 0)
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Razorpay order creation failed", data);
      return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
    }

    return NextResponse.json({
      key: process.env.RAZORPAY_KEY_ID,
      order: {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        productId: product.id,
        durationSeconds: product.durationSeconds ?? 0
      }
    });
  } catch (error) {
    console.error("Razorpay order route failed", error);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
