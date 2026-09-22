# Technical Architecture

## Target stack

Next.js + TypeScript, PostgreSQL/Neon, Cloudflare R2, async job queue, FFmpeg, payment abstraction, and pluggable TTS providers. Keep GPU TTS separate from the web application.

## Flow

Web/Mobile → Next.js/API → PostgreSQL

- Catalog/content metadata in PostgreSQL
- Source books, covers, voice samples, and generated audio in private R2 objects
- Generation requests go to a queue
- TTS worker selects a provider/model
- FFmpeg post-processes audio
- Worker writes audio to R2 and usage/cost records to PostgreSQL
- Player streams authorized audio

## Core entities

User: id, email, locale, country, createdAt

Book: id, title, author, description, coverUrl, language, rightsType, status

Chapter: id, bookId, title, sequence, sourceTextUrl, durationSeconds, status

VoiceProfile: id, userId, displayName, relationship, language, provider, providerVoiceId, consentStatus, status, sourceSampleUrl, createdAt

VoiceConsent: id, voiceProfileId, userId, method, statementVersion, grantedAt, revokedAt

GenerationJob: id, userId, voiceProfileId, bookId, chapterId, jobType, provider, status, requestedCharacters, outputDurationSeconds, estimatedCost, actualCost, outputUrl, error

GeneratedAudio: id, voiceProfileId, bookId, chapterId, settingsHash, provider, audioUrl, durationSeconds, createdAt

Wallet: id, userId, balanceSeconds, currency, updatedAt

WalletTransaction: id, userId, type, seconds, amount, currency, provider, reference, createdAt

ProductPrice: id, productType, country, currency, amount, durationSeconds, externalProductId, active

Subscription: id, userId, productId, provider, providerSubscriptionId, status, currentPeriodStart, currentPeriodEnd

TtsProviderUsage: id, provider, model, jobId, characters, durationSeconds, cost, metadata, createdAt

## Generation rules

1. Validate entitlement and voice consent.
2. Validate content rights.
3. Compute a deterministic cache key.
4. Return existing audio on cache hit.
5. On miss, enqueue a job.
6. Select self-hosted standard TTS or paid fallback based on language, quality, health, and cost policy.
7. Generate in chunks.
8. Post-process with FFmpeg.
9. Store private audio in R2.
10. Persist GeneratedAudio and TtsProviderUsage.
11. Deduct billable credits only after successful generation.

## Cache key

voiceProfileId + voiceVersion + book/chapter + sourceTextVersion + provider + model + voiceSettings + format.

## TTS adapter

```ts
export interface TTSProvider {
  createVoice(input: CreateVoiceInput): Promise<CreateVoiceResult>;
  generate(input: GenerateSpeechInput): Promise<GenerateSpeechResult>;
  deleteVoice(voiceId: string): Promise<void>;
  estimateCost(input: GenerateSpeechInput): Promise<number>;
}
```

Implementations should include a self-hosted provider and at least one external provider. Product code must not import provider SDKs directly.

## Cost controls

- Generate generic catalog audio once.
- Generate personalized previews first.
- Generate personalized chapters lazily.
- Cache successful personalized audio.
- Do not concatenate isolated word recordings as the main synthesis strategy; preserve sentence/phrase context.
- Keep a pronunciation dictionary for difficult names/words.
- Rate-limit free preview generation.
- Never expose TTS secrets to clients.

## Trust and safety

Require explicit consent/authorization for voice cloning. Store the consent record and allow revocation/deletion. Add upload validation, abuse reporting, rate limits, audit events, and private audio URLs.
