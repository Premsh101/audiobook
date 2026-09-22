import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForDb = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? 10),
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS ?? 5000),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS ?? 10000)
  });
  return new PrismaClient({ adapter });
}

export const db = globalForDb.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.prisma = db;
}
