import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    const [books, users] = await Promise.all([
      db.book.count(),
      db.user.count()
    ]);
    return NextResponse.json({
      ok: true,
      database: "postgresql",
      books,
      users
    });
  } catch (error) {
    console.error("DB health check failed", error);
    return NextResponse.json(
      { ok: false, database: "postgresql", error: "Database unavailable" },
      { status: 503 }
    );
  }
}
