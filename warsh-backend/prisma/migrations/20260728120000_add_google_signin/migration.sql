ALTER TABLE "User"
ADD COLUMN "hasPassword" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "googleSubject" TEXT,
ADD COLUMN "googleEmail" TEXT,
ADD COLUMN "googleLinkedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_googleSubject_key" ON "User"("googleSubject");
