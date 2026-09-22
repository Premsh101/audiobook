# Technical Architecture

## Database decision

PostgreSQL runs on the KVM. No managed Neon database is required.

The app connects to PostgreSQL through DATABASE_URL. Prisma ORM 7 uses prisma.config.ts for CLI datasource configuration and @prisma/adapter-pg for runtime connectivity.

## Infrastructure

Internet -> Next.js app -> PostgreSQL on KVM

The app also uses a job queue and a separate TTS worker. Large source files, voice samples, covers and generated audio belong in private object storage such as Cloudflare R2.

## KVM PostgreSQL

Use the committed docker-compose.postgres.yml for a dedicated Postgres container with a persistent named volume and healthcheck.

Recommended deployment:
1. Create a strong database password in the KVM environment.
2. Start PostgreSQL.
3. Set DATABASE_URL in the application.
4. Run prisma migrate deploy.
5. Run prisma db seed only for an initial/demo catalog.
6. Back up PostgreSQL separately from the application.

## Data model

The Prisma schema includes users, books, chapters, voice profiles, consent records, generation jobs, generated audio, wallets, wallet transactions, country-specific prices, subscriptions, playback progress, and TTS usage/cost.

## Generation

1. Validate user entitlement.
2. Validate voice consent.
3. Validate title rights.
4. Calculate deterministic cache key.
5. Reuse cached audio when available.
6. Otherwise queue a generation job.
7. Select TTS provider using language/quality/health/cost policy.
8. Generate speech in context-aware chunks.
9. Post-process with FFmpeg.
10. Store private output in R2.
11. Record output and actual TTS cost.
12. Deduct credits only after successful generation.

Do not synthesize books by concatenating isolated word recordings.

## Payments

Keep a payment abstraction. Store country, currency and external product identifiers in the database.

Planned providers:
- India: Razorpay
- International: selected payment provider based on supported countries and product type

## Security

Never expose provider secrets to browser clients. Validate audio uploads. Keep voice/audio storage private. Use signed or authorized playback URLs. Keep consent and audit records. Support delete/revoke. Rate-limit free previews.
