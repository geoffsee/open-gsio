import { OpenAI } from "openai";
import ChatSdk from "../sdk/chat-sdk";

export class XaiChatSdk {
  static async handleXaiStream(
    ctx: {
      openai: OpenAI;
      systemPrompt: any;
      preprocessedContext: any;
      maxTokens: unknown | number | undefined;
      messages: any;
      disableWebhookGeneration: boolean;
      model: any;
      env: Env;
    },
    dataCallback: (data: any) => any,
  ) {
    const {
      openai,
      systemPrompt,
      maxTokens,
      messages,
      env,
      model,
      preprocessedContext,
    } = ctx;

    if (!messages?.length) {
      return new Response("No messages provided", { status: 400 });
    }

    const getMaxTokens = async (mt) => {
      if (mt) {
        return await ChatSdk.calculateMaxTokens(
          JSON.parse(JSON.stringify(messages)),
          {
            env,
            maxTokens: mt,
          },
        );
      } else {
        return undefined;
      }
    };

    const assistantPrompt = ChatSdk.buildAssistantPrompt({
      maxTokens: maxTokens,
    });

    const safeMessages = ChatSdk.buildMessageChain(messages, {
      systemPrompt: systemPrompt,
      model,
      assistantPrompt,
      toolResults: preprocessedContext,
    });

    const xAiClient = new OpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: env.XAI_API_KEY,
    });

    return XaiChatSdk.streamOpenAiResponse(
      safeMessages,
      {
        model,
        maxTokens: maxTokens as number,
        openai: xAiClient,
      },
      dataCallback,
    );
  }

  private static async streamOpenAiResponse(
    messages: any[],
    opts: {
      model: string;
      maxTokens: number | undefined;
      openai: OpenAI;
    },
    dataCallback: (data: any) => any,
  ) {
    const isO1 = () => {
      if (opts.model === "o1-preview" || opts.model === "o1-mini") {
        return true;
      }
    };

    const tuningParams: Record<string, any> = {};

    const gpt4oTuningParams = {
      temperature: 0.75,
    };

    const getTuningParams = () => {
      if (isO1()) {
        tuningParams["temperature"] = 1;
        tuningParams["max_completion_tokens"] = opts.maxTokens + 10000;
        return tuningParams;
      }
      return gpt4oTuningParams;
    };

    const xAIStream = await opts.openai.chat.completions.create({
      model: opts.model,
      messages: messages,
      stream: true,
      ...getTuningParams(),
    });

    for await (const chunk of xAIStream) {
      dataCallback({ type: "chat", data: chunk });
    }
  }
}
