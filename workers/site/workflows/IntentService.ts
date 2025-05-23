import type { MessageType } from "../models/Message";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const IntentSchema = z.object({
  action: z.enum(["web-search", "news-search", "web-scrape", ""]),
  confidence: z.number(),
});

export class SimpleSearchIntentService {
  constructor(
    private client: OpenAI,
    private messages: MessageType[],
  ) {}

  async query(prompt: string, confidenceThreshold = 0.9) {
    console.log({ confidenceThreshold });

    const systemMessage = {
      role: "system",
      content: `Model intent as JSON:
{
  "action": "",
  "confidence": ""
}

- Context from another conversation.
- confidence is a decimal between 0 and 1 representing similarity of the context to the identified action
- Intent reflects user's or required action.
- Use "" for unknown/ambiguous intent.

Analyze context and output JSON.`.trim(),
    };

    const conversation = this.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    conversation.push({ role: "user", content: prompt });

    const completion = await this.client.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: JSON.parse(JSON.stringify([systemMessage, ...conversation])),
      temperature: 0,
      response_format: zodResponseFormat(IntentSchema, "intent"),
    });

    const { action, confidence } = completion.choices[0].message.parsed;

    console.log({ action, confidence });

    return confidence >= confidenceThreshold
      ? { action, confidence }
      : { action: "unknown", confidence };
  }
}

export function createIntentService(chat: {
  messages: MessageType[];
  openai: OpenAI;
}) {
  return new SimpleSearchIntentService(chat.openai, chat.messages);
}
