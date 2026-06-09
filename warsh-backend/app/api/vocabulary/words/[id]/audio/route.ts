import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../../lib/auth";
import { generateTtsMp3 } from "../../../../../../lib/tts";
import { uploadAudioToR2, vocabWordAudioKey } from "../../../../../../lib/r2";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const word = await prisma.vocabularyWord.findUnique({
    where: { id: params.id },
    select: { id: true, arabic: true, audioUrl: true },
  });

  if (!word) {
    return NextResponse.json({ error: "Word not found", code: "not_found" }, { status: 404 });
  }

  // Already in R2 — return immediately
  if (word.audioUrl) {
    return NextResponse.json({ data: { audioUrl: word.audioUrl } });
  }

  // First request: generate TTS, upload to R2, persist URL
  try {
    const audioBuffer = await generateTtsMp3(word.arabic);
    const key = vocabWordAudioKey(word.id);
    const audioUrl = await uploadAudioToR2(key, audioBuffer);

    await prisma.vocabularyWord.update({
      where: { id: word.id },
      data: { audioUrl },
    });

    return NextResponse.json({ data: { audioUrl } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audio generation failed.";
    return NextResponse.json({ error: message, code: "audio_unavailable" }, { status: 503 });
  }
}
