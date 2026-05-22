import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { generateTtsMp3 } from "../../../../lib/tts";

const MAX_TTS_TEXT_LENGTH = 160;

function getTextFromRequest(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("text")?.trim() ?? "";
}

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const text = getTextFromRequest(request);
  if (!text) {
    return NextResponse.json({ error: "Missing text", code: "bad_request" }, { status: 400 });
  }

  if (text.length > MAX_TTS_TEXT_LENGTH) {
    return NextResponse.json({ error: "Text is too long for TTS", code: "bad_request" }, { status: 400 });
  }

  try {
    const audio = await generateTtsMp3(text);
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Cache-Control": "private, max-age=2592000",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "TTS generation failed.";
    return NextResponse.json({ error: message, code: "tts_unavailable" }, { status: 503 });
  }
}
