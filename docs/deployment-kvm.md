# KVM Deployment Runbook

This project is designed for a self-hosted PostgreSQL database on the same KVM as the application.

## 1. Create application environment

Copy .env.example to the server's application environment and set a strong database password.

Example:

```env
POSTGRES_DB=hush
POSTGRES_USER=hush
POSTGRES_PASSWORD=<strong-random-password>
POSTGRES_PORT=5433
DATABASE_URL=postgresql://hush:<strong-random-password>@127.0.0.1:5433/hush
```

Do not commit the real .env.

## 2. Start PostgreSQL

```bash
docker compose -f docker-compose.postgres.yml up -d
docker compose -f docker-compose.postgres.yml ps
```

The container exposes PostgreSQL only on 127.0.0.1:5433 by default. This keeps the database off the public network.

## 3. Deploy schema

From the application container/server:

```bash
npm install
npm run db:deploy
```

For a first/demo environment:

```bash
npm run db:seed
```

Do not run the seed command on every production deployment once real catalog/content data exists.

## 4. Verify

```bash
curl http://127.0.0.1:3000/api/health/db
```

Expected shape:

```json
{"ok":true,"database":"postgresql","books":10,"users":0}
```

## 5. Coolify

Create the application in Coolify from this repository branch.

Set DATABASE_URL to point to the PostgreSQL service through the private Docker network if the app and DB are deployed in the same Compose/network. Otherwise use a private KVM address; do not expose PostgreSQL publicly.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm run start
```

Migration command before/alongside release:

```bash
npm run db:deploy
```

## 6. Backups

Back up the PostgreSQL volume/database independently of the app container. Keep at least one copy outside the KVM.

A simple logical backup is:

```bash
docker exec hush-postgres pg_dump -U hush -d hush > hush-$(date +%Y-%m-%d).sql
```

For real production use, schedule backups and test restores.

## 7. Scaling later

When traffic grows:
- keep the app stateless
- use PostgreSQL connection pooling
- move heavy TTS work to separate workers
- keep large audio in object storage
- add a PostgreSQL read replica only when metrics justify it
