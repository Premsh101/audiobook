# Hush Audiobook

Global-first audiobook platform with two simple products:

- Audiobook Library — pre-generated books with very low marginal playback cost.
- Favourite Voice — a consented voice profile used to generate selected stories with prepaid listening-minute credits.

Core experience: Discover -> Listen -> Personalize.

India is a pricing/localization market; the architecture is global.

## Current MVP

- Polished responsive audiobook storefront/player
- Free public-domain/LibriVox seed catalog for prototype use
- Search and genre filters
- Favourite Voice upload/consent UI
- Self-hosted PostgreSQL option for the KVM
- Prisma ORM 7 data model and production migration
- Book catalog API and database health endpoint
- Provider-agnostic TTS architecture
- Credit wallet and subscription models

## KVM database

The application is designed to run PostgreSQL on the same KVM rather than using a managed database.

```bash
cp .env.example .env
# set a strong POSTGRES_PASSWORD and DATABASE_URL
docker compose -f docker-compose.postgres.yml up -d
npm install
npm run db:deploy
npm run db:seed
npm run dev
```

For production, keep PostgreSQL private and take regular database backups.

## Production commands

```bash
npm run build
npm run start
npm run db:deploy
```

Prisma ORM 7 is intentionally used rather than Prisma 8 RC. Prisma 7 uses a root config file plus the PostgreSQL driver adapter.

## Product boundaries

The MVP does not include calling, chat, RAG, agents, avatars, or a social feed.

## Content rights

The prototype references free LibriVox recordings for selected public-domain works. Commercial distribution must verify audiobook and text rights for each territory before launch.
