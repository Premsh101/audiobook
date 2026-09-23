import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const job = await db.generationJob.findFirst({
    where: { id, userId: user.id },
    select: { id: true, status: true }
  });

  if (!job || job.status !== "COMPLETED") {
    return NextResponse.json({ error: "Audio is not ready." }, { status: 404 });
  }

  const outputDir = process.env.VOICE_OUTPUT_DIR ?? path.join(process.cwd(), ".data", "voice-output");
  const filePath = path.join(outputDir, job.id + ".mp3");

  try {
    await stat(filePath);
    const bytes = await readFile(filePath);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch {
    return NextResponse.json({ error: "Generated audio is unavailable." }, { status: 404 });
  }
}
