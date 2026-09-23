import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const job = await db.generationJob.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true, jobType: true, status: true, provider: true, model: true,
      outputDurationSeconds: true, outputUrl: true, error: true,
      createdAt: true, startedAt: true, completedAt: true,
      book: { select: { title: true, slug: true } },
      voiceProfile: { select: { displayName: true, status: true } }
    }
  });

  if (!job) return NextResponse.json({ error: "Generation job not found." }, { status: 404 });
  return NextResponse.json(job);
}
