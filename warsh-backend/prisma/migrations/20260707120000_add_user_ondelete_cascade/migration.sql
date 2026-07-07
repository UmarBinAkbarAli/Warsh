-- Cascade deletes from User to its child records so account deletion cannot be
-- broken by a future child table, and so no orphaned rows remain.
-- The application still deletes children explicitly in a transaction; this is a
-- database-level safety net.

ALTER TABLE "Streak" DROP CONSTRAINT "Streak_userId_fkey",
  ADD CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Progress" DROP CONSTRAINT "Progress_userId_fkey",
  ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_userId_fkey",
  ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_userId_fkey",
  ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserSurahProgress" DROP CONSTRAINT "UserSurahProgress_userId_fkey",
  ADD CONSTRAINT "UserSurahProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserVocabularyWord" DROP CONSTRAINT "UserVocabularyWord_userId_fkey",
  ADD CONSTRAINT "UserVocabularyWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
