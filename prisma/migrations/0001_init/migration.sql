CREATE TYPE "UserRole" AS ENUM ('USER','ADMIN');
CREATE TYPE "BookAccess" AS ENUM ('FREE','SUBSCRIPTION','PREMIUM');
CREATE TYPE "RightsType" AS ENUM ('PUBLIC_DOMAIN','LICENSED','ORIGINAL');
CREATE TYPE "BookStatus" AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');
CREATE TYPE "VoiceStatus" AS ENUM ('DRAFT','PROCESSING','READY','REVOKED','FAILED');
CREATE TYPE "ConsentStatus" AS ENUM ('PENDING','GRANTED','REVOKED');
CREATE TYPE "GenerationJobType" AS ENUM ('PREVIEW','CHAPTER','RETRY');
CREATE TYPE "GenerationStatus" AS ENUM ('QUEUED','PROCESSING','COMPLETED','FAILED','CANCELLED');
CREATE TYPE "WalletTransactionType" AS ENUM ('PURCHASE','DEBIT','REFUND','BONUS','EXPIRY','ADJUSTMENT');
CREATE TYPE "ProductType" AS ENUM ('LIBRARY_SUBSCRIPTION','VOICE_CREDITS');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE','PAUSED','CANCELLED','EXPIRED','PENDING');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "country" TEXT,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Book" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "year" TEXT,
  "genre" TEXT NOT NULL,
  "durationLabel" TEXT NOT NULL,
  "previewSeconds" INTEGER NOT NULL DEFAULT 300,
  "description" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'en',
  "coverUrl" TEXT,
  "cover" TEXT NOT NULL,
  "coverInk" TEXT NOT NULL,
  "mark" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL,
  "previewUrl" TEXT,
  "sourceUrl" TEXT,
  "access" "BookAccess" NOT NULL DEFAULT 'FREE',
  "rightsType" "RightsType" NOT NULL DEFAULT 'PUBLIC_DOMAIN',
  "status" "BookStatus" NOT NULL DEFAULT 'DRAFT',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");
CREATE INDEX "Book_status_featured_idx" ON "Book"("status","featured");
CREATE INDEX "Book_genre_idx" ON "Book"("genre");
CREATE INDEX "Book_language_idx" ON "Book"("language");

CREATE TABLE "Chapter" (
  "id" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "sourceTextUrl" TEXT,
  "durationSeconds" INTEGER,
  "status" "BookStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Chapter_bookId_sequence_key" ON "Chapter"("bookId","sequence");
CREATE INDEX "Chapter_bookId_idx" ON "Chapter"("bookId");

CREATE TABLE "VoiceProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "relationship" TEXT,
  "language" TEXT NOT NULL DEFAULT 'en',
  "provider" TEXT,
  "providerVoiceId" TEXT,
  "consentStatus" "ConsentStatus" NOT NULL DEFAULT 'PENDING',
  "status" "VoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "sourceSampleUrl" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VoiceProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "VoiceProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "VoiceProfile_userId_status_idx" ON "VoiceProfile"("userId","status");

CREATE TABLE "VoiceConsent" (
  "id" TEXT NOT NULL,
  "voiceProfileId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "statementVersion" TEXT NOT NULL,
  "grantedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VoiceConsent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "VoiceConsent_voiceProfileId_fkey" FOREIGN KEY ("voiceProfileId") REFERENCES "VoiceProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "VoiceConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "VoiceConsent_voiceProfileId_idx" ON "VoiceConsent"("voiceProfileId");
CREATE INDEX "VoiceConsent_userId_idx" ON "VoiceConsent"("userId");

CREATE TABLE "GenerationJob" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "voiceProfileId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "chapterId" TEXT,
  "jobType" "GenerationJobType" NOT NULL,
  "provider" TEXT,
  "model" TEXT,
  "status" "GenerationStatus" NOT NULL DEFAULT 'QUEUED',
  "requestedCharacters" INTEGER NOT NULL DEFAULT 0,
  "outputDurationSeconds" INTEGER,
  "estimatedCost" DECIMAL(12,6),
  "actualCost" DECIMAL(12,6),
  "outputUrl" TEXT,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "GenerationJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GenerationJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GenerationJob_voiceProfileId_fkey" FOREIGN KEY ("voiceProfileId") REFERENCES "VoiceProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GenerationJob_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GenerationJob_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "GenerationJob_userId_status_idx" ON "GenerationJob"("userId","status");
CREATE INDEX "GenerationJob_status_createdAt_idx" ON "GenerationJob"("status","createdAt");
CREATE INDEX "GenerationJob_voiceProfileId_bookId_chapterId_idx" ON "GenerationJob"("voiceProfileId","bookId","chapterId");

CREATE TABLE "GeneratedAudio" (
  "id" TEXT NOT NULL,
  "voiceProfileId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "chapterId" TEXT,
  "settingsHash" TEXT NOT NULL,
  "cacheKey" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT,
  "audioUrl" TEXT NOT NULL,
  "durationSeconds" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GeneratedAudio_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GeneratedAudio_voiceProfileId_fkey" FOREIGN KEY ("voiceProfileId") REFERENCES "VoiceProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GeneratedAudio_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GeneratedAudio_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "GeneratedAudio_cacheKey_key" ON "GeneratedAudio"("cacheKey");
CREATE UNIQUE INDEX "GeneratedAudio_voiceProfileId_bookId_chapterId_settingsHash_key" ON "GeneratedAudio"("voiceProfileId","bookId","chapterId","settingsHash");
CREATE INDEX "GeneratedAudio_bookId_chapterId_idx" ON "GeneratedAudio"("bookId","chapterId");

CREATE TABLE "Wallet" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "balanceSeconds" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

CREATE TABLE "WalletTransaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "WalletTransactionType" NOT NULL,
  "seconds" INTEGER NOT NULL,
  "amount" DECIMAL(12,2),
  "currency" TEXT,
  "provider" TEXT,
  "reference" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "WalletTransaction_userId_createdAt_idx" ON "WalletTransaction"("userId","createdAt");

CREATE TABLE "ProductPrice" (
  "id" TEXT NOT NULL,
  "productType" "ProductType" NOT NULL,
  "country" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "durationSeconds" INTEGER,
  "externalProductId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductPrice_externalProductId_key" ON "ProductPrice"("externalProductId");
CREATE INDEX "ProductPrice_productType_country_active_idx" ON "ProductPrice"("productType","country","active");

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerSubscriptionId" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_providerSubscriptionId_key" UNIQUE ("providerSubscriptionId"),
  CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId","status");

CREATE TABLE "PlaybackProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "chapterId" TEXT,
  "positionSeconds" INTEGER NOT NULL DEFAULT 0,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlaybackProgress_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PlaybackProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PlaybackProgress_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PlaybackProgress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PlaybackProgress_userId_bookId_chapterId_key" ON "PlaybackProgress"("userId","bookId","chapterId");
CREATE INDEX "PlaybackProgress_userId_updatedAt_idx" ON "PlaybackProgress"("userId","updatedAt");

CREATE TABLE "TtsProviderUsage" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT,
  "jobId" TEXT,
  "characters" INTEGER NOT NULL DEFAULT 0,
  "durationSeconds" INTEGER NOT NULL DEFAULT 0,
  "cost" DECIMAL(12,6),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TtsProviderUsage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TtsProviderUsage_jobId_key" ON "TtsProviderUsage"("jobId");

ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
