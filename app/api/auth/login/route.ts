import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, normalizeIdentifier, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === "string" ? body.identifier : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!identifier.trim() || !password) {
      return NextResponse.json({ error: "Enter your email/mobile and password." }, { status: 400 });
    }

    const normalized = normalizeIdentifier(identifier);
    const user = normalized.kind === "email"
      ? await db.user.findUnique({ where: { email: normalized.value } })
      : await db.user.findUnique({ where: { mobile: normalized.value } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Those details do not match an account." }, { status: 401 });
    }

    await db.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    });
    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile }
    });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Could not sign you in." }, { status: 500 });
  }
}
