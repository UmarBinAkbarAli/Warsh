-- Owner decision 2026-11-03: new accounts get a 30-day trial (was 7).
-- Existing trials keep their current end date.
ALTER TABLE "User" ALTER COLUMN "trialExpiresAt" SET DEFAULT now() + interval '30 days';
