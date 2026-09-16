-- CreateTable
CREATE TABLE "RestoreCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "transports" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cloudBackup" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "RestoreCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestoreChallenge" (
    "id" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestoreChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestoreCredential_credentialId_key" ON "RestoreCredential"("credentialId");

-- CreateIndex
CREATE INDEX "RestoreCredential_userId_idx" ON "RestoreCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RestoreChallenge_challenge_key" ON "RestoreChallenge"("challenge");

-- CreateIndex
CREATE INDEX "RestoreChallenge_expiresAt_idx" ON "RestoreChallenge"("expiresAt");

-- AddForeignKey
ALTER TABLE "RestoreCredential" ADD CONSTRAINT "RestoreCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
