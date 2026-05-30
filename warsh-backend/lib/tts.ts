import OpenAI from "openai";

const DEFAULT_TTS_MODEL = "tts-1";
const DEFAULT_TTS_VOICE = "onyx";

export async function generateTtsMp3(text: string) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for TTS generation.");
  }

  const model = process.env.OPENAI_TTS_MODEL?.trim() || DEFAULT_TTS_MODEL;
  const voice = process.env.OPENAI_TTS_VOICE?.trim() || DEFAULT_TTS_VOICE;
  const client = new OpenAI({ apiKey });

  const speech = await client.audio.speech.create({
    model,
    voice,
    input: text,
    response_format: "mp3",
    speed: model === "tts-1" || model === "tts-1-hd" ? 0.9 : undefined,
    instructions: model.includes("gpt-4o")
      ? "Read in clear, slow Classical Arabic suitable for a beginner learner."
      : undefined,
  });

  return Buffer.from(await speech.arrayBuffer());
}
