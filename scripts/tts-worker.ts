"import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
const ttsServiceUrl = process.env.TTS_SERVICE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
if (!ttsServiceUrl) throw new Error("TTS_SERVICE_URL is required");

const adapter = new PrismaPg({ connectionString: databaseUrl });
const db = new PrismaClient({ adapter });
const outputDir = process.env.VOICE_OUTPUT_DIR ?? path.join(process.cwd(), ".data", "voice-output");
const pollMs = Number(process.env.TTS_WORKER_POLL_MS ?? 5000);

function hashSettings(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

async function claimJob() {
  const queued = await db.generationJob.findFirst({
    where: { status: "QUEUED", jobType: { in: ["PREVIEW", "CHAPTER"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true }
  });
  if (!queued) return null;

  const claimed = await db.generationJob.updateMany({
    where: { id: queued.id, status: "QUEUED" },
    data: { status: "PROCESSING", startedAt: new Date() }
  });
  return claimed.count === 1 ? queued.id : null;
}

async function processJob(jobId: string) {
  const job = await db.generationJob.findUnique({
    where: { id: jobId },
    include: {
      voiceProfile: { select: { sourceSampleUrl: true, language: true, version: true } },
      book: { select: { language: true } },
      chapter: { select: { sourceTextUrl: true, durationSeconds: true } }
    }
  });
  if (!job) return;

  try {
    const sourceUrl = job.chapter?.sourceTextUrl;
    if (!sourceUrl) throw new Error("No source text is configured for this job.");

    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error("Source text fetch failed: " + response.status);

    let text = await response.text();
    const start = text.indexOf("*** START OF");
    const end = text.indexOf("*** END OF");
    if (start >= 0) text = text.slice(text.indexOf("\n", start) + 1);
    if (end > 0) text = text.slice(0, end);
    text = text.replace(/\s+/g, " ").trim();

    if (job.jobType === "PREVIEW") {
      text = text.slice(0, Number(process.env.TTS_PREVIEW_MAX_CHARACTERS ?? 6000));
    }

    await mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, job.id + ".mp3");
    const model = job.model ?? process.env.TTS_MODEL ?? "self-hosted";
    const provider = job.provider ?? process.env.TTS_PROVIDER ?? "self-hosted";

    const synth = await fetch(ttsServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: job.id,
        text,
        language: job.voiceProfile.language || job.book.language || "en",
        voiceSamplePath: job.voiceProfile.sourceSampleUrl,
        outputPath,
        requestedDurationSeconds: job.jobType === "PREVIEW" ? 300 : (job.chapter?.durationSeconds ?? null)
      })
    });

    const result = await synth.json().catch(() => ({}));
    if (!synth.ok) throw new Error(result.error || "TTS service failed: " + synth.status);

    const durationSeconds = Number(result.durationSeconds || job.chapter?.durationSeconds || 300);
    const settingsHash = hashSettings(JSON.stringify({
      provider, model, language: job.voiceProfile.language,
      voiceVersion: job.voiceProfile.version, jobType: job.jobType
    }));
    const cacheKey = "voice:" + job.voiceProfileId + ":book:" + job.bookId +
      ":chapter:" + (job.chapterId ?? "preview") + ":settings:" + settingsHash;

    await db.generatedAudio.upsert({
      where: { cacheKey },
      update: {
        audioUrl: "/api/voice/jobs/" + job.id + "/audio",
        durationSeconds, provider, model
      },
      create: {
        voiceProfileId: job.voiceProfileId,
        bookId: job.bookId,
        chapterId: job.chapterId,
        settingsHash,
        cacheKey,
        provider,
        model,
        audioUrl: "/api/voice/jobs/" + job.id + "/audio",
        durationSeconds
      }
    });

    await db.$transaction([
      db.generationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          outputDurationSeconds: durationSeconds,
          outputUrl: "/api/voice/jobs/" + job.id + "/audio",
          completedAt: new Date(),
          error: null
        }
      }),
      db.tTSProviderUsage.create({
        data: { provider, model, jobId: job.id, characters: text.length, durationSeconds }
      }),
      db.voiceProfile.update({
        where: { id: job.voiceProfileId },
        data: { status: "READY" }
      })
    ]);

    console.log("[tts] completed " + job.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "TTS generation failed";
    await db.generationJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: message, completedAt: new Date() }
    });
    await db.voiceProfile.update({
      where: { id: job.voiceProfileId },
      data: { status: "FAILED" }
    });
    console.error("[tts] failed " + job.id + ": " + message);
  }
}

async function main() {
  console.log("[tts] worker ready; polling " + pollMs + "ms");
  while (true) {
    const jobId = await claimJob();
    if (jobId) await processJob(jobId);
    else await new Promise(resolve => setTimeout(resolve, pollMs));
  }
}

main().catch(async error => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
