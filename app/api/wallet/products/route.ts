import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const country = (new URL(request.url).searchParams.get("country") || "US").toUpperCase();

  try {
    const products = await db.productPrice.findMany({
      where: { active: true, productType: "VOICE_CREDITS", country },
      orderBy: { amount: "asc" }
    });

    return NextResponse.json(products.map((product) => ({
      id: product.id,
      code: product.externalProductId,
      amount: Number(product.amount),
      currency: product.currency,
      durationSeconds: product.durationSeconds ?? 0
    })));
  } catch (error) {
    console.error("Wallet products query failed", error);
    return NextResponse.json({ error: "Credit packages are temporarily unavailable." }, { status: 503 });
  }
}
