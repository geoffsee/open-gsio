import { OpenAI } from "openai";
import {
  _NotCustomized,
  castToSnapshot,
  getSnapshot,
  ISimpleType,
  ModelPropertiesDeclarationToProperties,
  ModelSnapshotType2,
  UnionStringArray,
} from "mobx-state-tree";
import Message from "../../models/Message";
import { MarkdownSdk } from "../markdown-sdk";
import ChatSdk from "../chat-sdk";

export class FireworksAiChatSdk {
  private static async streamFireworksResponse(
    messages: any[],
    opts: {
      model: string;
      maxTokens: number | unknown | undefined;
      openai: OpenAI;
    },
    dataCallback: (data: any) => void,
  ) {
    let modelPrefix = "accounts/fireworks/models/";
    if (opts.model.toLowerCase().includes("yi-")) {
      modelPrefix = "accounts/yi-01-ai/models/";
    }

    const fireworksStream = await opts.openai.chat.completions.create({
      model: `${modelPrefix}${opts.model}`,
      messages: messages,
      stream: true,
    });

    for await (const chunk of fireworksStream) {
      dataCallback({ type: "chat", data: chunk });
    }
  }

  static async handleFireworksStream(
    param: {
      openai: OpenAI;
      systemPrompt: any;
      disableWebhookGeneration: boolean;
      preprocessedContext: ModelSnapshotType2<
        ModelPropertiesDeclarationToProperties<{
          role: ISimpleType<UnionStringArray<string[]>>;
          content: ISimpleType<unknown>;
        }>,
        _NotCustomized
      >;
      attachments: any;
      maxTokens: number;
      messages: any;
      model: any;
      env: Env;
      tools: any;
    },
    dataCallback: (data) => void,
  ) {
    const {
      preprocessedContext,
      messages,
      env,
      maxTokens,
      tools,
      systemPrompt,
      model,
      attachments,
    } = param;

    const assistantPrompt = ChatSdk.buildAssistantPrompt({
      maxTokens: maxTokens,
      tools: tools,
    });

    const safeMessages = ChatSdk.buildMessageChain(messages, {
      systemPrompt: systemPrompt,
      model,
      assistantPrompt,
      toolResults: preprocessedContext,
      attachments: attachments,
    });

    const fireworksOpenAIClient = new OpenAI({
      apiKey: param.env.FIREWORKS_API_KEY,
      baseURL: "https://api.fireworks.ai/inference/v1",
    });
    return FireworksAiChatSdk.streamFireworksResponse(
      safeMessages,
      {
        model: param.model,
        maxTokens: param.maxTokens,
        openai: fireworksOpenAIClient,
      },
      dataCallback,
    );
  }
}
