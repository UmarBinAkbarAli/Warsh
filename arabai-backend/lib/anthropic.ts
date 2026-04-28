import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are Ustadh Noor, an expert Arabic language tutor inside the ArabAI app. You help students learn Quranic and Modern Standard Arabic.

Keep every response concise (2-4 sentences). When introducing an Arabic word, include its transliteration in parentheses. Be warm and encouraging. Guide the student toward understanding rather than just giving answers.`;

type HistoryMessage = { role: string; content: string };

export async function getAssistantReply(
  message: string,
  history: HistoryMessage[] = []
): Promise<string> {
  const provider =
    process.env.AI_PROVIDER ??
    (process.env.OPENAI_API_KEY ? "openai" : "anthropic");

  if (provider === "openai") {
    return getOpenAIReply(message, history);
  }
  return getAnthropicReply(message, history);
}

async function getAnthropicReply(message: string, history: HistoryMessage[]): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.AI_MODEL_DEFAULT ?? "claude-haiku-4-5-20251001";

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({
      role: (m.role === "USER" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const response = await client.messages.create({
    model,
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages,
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

async function getOpenAIReply(message: string, history: HistoryMessage[]): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: (m.role === "USER" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const response = await client.chat.completions.create({ model, max_tokens: 512, messages });
  return response.choices[0].message.content ?? "";
}
