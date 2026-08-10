const EVERYAYAH_ALAFASY_BASE = "https://everyayah.com/data/Alafasy_128kbps";

export function getEveryAyahAudioUrl(surahNumber: number, ayahNumber: number): string {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new Error("Invalid Quran surah number.");
  }
  if (!Number.isInteger(ayahNumber) || ayahNumber < 1 || ayahNumber > 999) {
    throw new Error("Invalid Quran ayah number.");
  }

  const surah = String(surahNumber).padStart(3, "0");
  const ayah = String(ayahNumber).padStart(3, "0");
  return `${EVERYAYAH_ALAFASY_BASE}/${surah}${ayah}.mp3`;
}
