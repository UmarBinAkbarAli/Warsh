-- CreateTable
CREATE TABLE "TadabburSurah" (
    "id" TEXT NOT NULL,
    "orderInProg" INTEGER NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "meaningEn" TEXT NOT NULL,
    "totalAyat" INTEGER NOT NULL,
    "ayatData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TadabburSurah_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TadabburSurah_orderInProg_key" ON "TadabburSurah"("orderInProg");
CREATE UNIQUE INDEX "TadabburSurah_surahNumber_key" ON "TadabburSurah"("surahNumber");

-- CreateTable
CREATE TABLE "UserSurahProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "surahId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSurahProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserSurahProgress_userId_surahId_key" ON "UserSurahProgress"("userId", "surahId");

-- AddForeignKey
ALTER TABLE "UserSurahProgress" ADD CONSTRAINT "UserSurahProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserSurahProgress" ADD CONSTRAINT "UserSurahProgress_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "TadabburSurah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
