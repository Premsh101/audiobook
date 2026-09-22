import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ user: null });

    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
      select: { balanceSeconds: true, currency: true }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        country: user.country,
        locale: user.locale,
        balanceSeconds: wallet?.balanceSeconds ?? 0,
        currency: wallet?.currency ?? "USD"
      }
    });
  } catch (error) {
    console.error("Session lookup failed", error);
    return NextResponse.json({ user: null });
  }
}
