import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 30 * 1024 * 1024;
const allowedTypes = new Set(["audio/mpeg","audio/mp3","audio/wav","audio/x-wav","audio/mp4","audio/x-m4a","audio/m4a"]);

function extension(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".wav")) return "wav";
  if (name.endsWith(".m4a")) return "m4a";
  return "mp3";
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to use Favourite Voice." }, { status: 401 });

  const [profiles, wallet] = await Promise.all([
    db.voiceProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        consents: { orderBy: { createdAt: "desc" }, take: 1 },
        generationJobs: { orderBy: { createdAt: "desc" }, take: 5, include: { book: true } }
      }
    }),
    db.wallet.findUnique({ where: { userId: user.id }, select: { balanceSeconds: true, currency: true } })
  ]);

  return NextResponse.json({
    wallet: wallet ?? { balanceSeconds: 0, currency: "USD" },
    profiles: profiles.map((profile) => ({
      id: profile.id,
      displayName: profile.displayName,
      relationship: profile.relationship,
      language: profile.language,
      consentStatus: profile.consentStatus,
      status: profile.status,
      createdAt: profile.createdAt,
      jobs: profile.generationJobs.map((job) => ({
        id: job.id,
        type: job.jobType,
        status: job.status,
        book: { slug: job.book.slug, title: job.book.title },
        outputUrl: job.outputUrl,
        createdAt: job.createdAt
      }))
    }))
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to use Favourite Voice." }, { status: 401 });

  const form = await request.formData();
  const displayName = typeof form.get("displayName") === "string" ? String(form.get("displayName")).trim() : "";
  const relationship = typeof form.get("relationship") === "string" ? String(form.get("relationship")).trim() : "";
  const language = typeof form.get("language") === "string" ? String(form.get("language")).trim() : "en";
  const bookId = typeof form.get("bookId") === "string" ? String(form.get("bookId")) : "";
  const consent = form.get("consent") === "true";
  const file = form.get("file");

  if (!displayName || !bookId || !consent || !(file instanceof File)) {
    return NextResponse.json({ error: "Choose a voice recording, story and confirm permission." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Please upload an audio file up to 30 MB." }, { status: 400 });
  }
  if (file.type && !allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Please use MP3, M4A or WAV audio." }, { status: 400 });
  }

  const book = await db.book.findFirst({ where: { id: bookId, status: "PUBLISHED" }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Choose a published story." }, { status: 404 });

  const profileId = randomUUID();
  const baseDir = process.env.VOICE_UPLOAD_DIR ?? path.join(process.cwd(), ".data", "voices");
  await mkdir(baseDir, { recursive: true });
  const filePath = path.join(baseDir, `${profileId}.${extension(file)}`);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  const profile = await db.voiceProfile.create({
    data: {
      id: profileId,
      userId: user.id,
      displayName,
      relationship: relationship || null,
      language,
      sourceSampleUrl: filePath,
      consentStatus: "GRANTED",
      status: "PROCESSING",
      consents: {
        create: {
          userId: user.id,
          method: "checkbox",
          statementVersion: "v1",
          grantedAt: new Date()
        }
      },
      generationJobs: {
        create: {
          userId: user.id,
          bookId,
          jobType: "PREVIEW",
          provider: process.env.TTS_PROVIDER ?? "pending",
          model: process.env.TTS_MODEL ?? null,
          status: "QUEUED"
        }
      }
    },
    include: { generationJobs: { orderBy: { createdAt: "desc" }, take: 1 } }
  });

  return NextResponse.json({
    ok: true,
    profile: {
      id: profile.id,
      displayName: profile.displayName,
      status: profile.status,
      job: profile.generationJobs[0] ? {
        id: profile.generationJobs[0].id,
        status: profile.generationJobs[0].status
      } : null
    }
  }, { status: 201 });
}
