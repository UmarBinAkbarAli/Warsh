CREATE TABLE "AnalyticsOutbox" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    CONSTRAINT "AnalyticsOutbox_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AnalyticsOutbox_deliveredAt_occurredAt_idx" ON "AnalyticsOutbox"("deliveredAt", "occurredAt");
