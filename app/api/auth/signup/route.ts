import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword, normalizeIdentifier } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === "string" ? body.identifier : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : null;

    if (!identifier.trim() || !password.trim()) {
      return NextResponse.json({ error: "Enter your email/mobile and password." }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: "Use a password with at least 4 characters." }, { status: 400 });
    }

    const normalized = normalizeIdentifier(identifier);
    const existing = normalized.kind === "email"
      ? await db.user.findUnique({ where: { email: normalized.value } })
      : await db.user.findUnique({ where: { mobile: normalized.value } });

    if (existing) return NextResponse.json({ error: "An account already exists. Please sign in." }, { status: 409 });

    const user = await db.user.create({
      data: {
        email: normalized.kind === "email" ? normalized.value : null,
        mobile: normalized.kind === "mobile" ? normalized.value : null,
        name: name || null,
        passwordHash: await hashPassword(password),
        wallet: { create: {} }
      }
    });

    await createSession(user.id);
    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile }
    });
  } catch (error) {
    console.error("Signup failed", error);
    return NextResponse.json({ error: "Could not create your account." }, { status: 500 });
  }
}
