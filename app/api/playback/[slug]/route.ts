import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ authenticated: false, progress: null }, { status: 401 });

  const { slug } = await params;
  const chapterId = new URL(request.url).searchParams.get("chapterId");
  const book = await db.book.findUnique({ where: { slug }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const progress = await db.playbackProgress.findFirst({
    where: { userId: user.id, bookId: book.id, chapterId: chapterId || null }
  });

  return NextResponse.json({
    authenticated: true,
    progress: progress
      ? { positionSeconds: progress.positionSeconds, completed: progress.completed, chapterId: progress.chapterId }
      : null
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to save playback." }, { status: 401 });

  const { slug } = await params;
  const body = await request.json();
  const chapterId = typeof body.chapterId === "string" && body.chapterId ? body.chapterId : null;
  const positionSeconds = Math.max(0, Math.floor(Number(body.positionSeconds) || 0));
  const completed = Boolean(body.completed);

  const book = await db.book.findUnique({ where: { slug }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  if (chapterId) {
    const chapter = await db.chapter.findFirst({ where: { id: chapterId, bookId: book.id, status: "PUBLISHED" } });
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const existing = await db.playbackProgress.findFirst({ where: { userId: user.id, bookId: book.id, chapterId } });
  const progress = existing
    ? await db.playbackProgress.update({ where: { id: existing.id }, data: { positionSeconds, completed } })
    : await db.playbackProgress.create({ data: { userId: user.id, bookId: book.id, chapterId, positionSeconds, completed } });

  return NextResponse.json({
    ok: true,
    progress: { positionSeconds: progress.positionSeconds, completed: progress.completed, chapterId: progress.chapterId }
  });
}
