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
import Message from "../models/Message.ts";
import ChatSdk from "../lib/chat-sdk.ts";
import { BaseChatProvider, CommonProviderParams } from "./chat-stream-provider.ts";

export class FireworksAiChatProvider extends BaseChatProvider {
  getOpenAIClient(param: CommonProviderParams): OpenAI {
    return new OpenAI({
      apiKey: param.env.FIREWORKS_API_KEY,
      baseURL: "https://api.fireworks.ai/inference/v1",
    });
  }

  getStreamParams(param: CommonProviderParams, safeMessages: any[]): any {
    let modelPrefix = "accounts/fireworks/models/";
    if (param.model.toLowerCase().includes("yi-")) {
      modelPrefix = "accounts/yi-01-ai/models/";
    }

    return {
      model: `${modelPrefix}${param.model}`,
      messages: safeMessages,
      stream: true,
    };
  }

  async processChunk(chunk: any, dataCallback: (data: any) => void): Promise<boolean> {
    if (chunk.choices && chunk.choices[0]?.finish_reason === "stop") {
      dataCallback({ type: "chat", data: chunk });
      return true;
    }

    dataCallback({ type: "chat", data: chunk });
    return false;
  }
}

export class FireworksAiChatSdk {
  private static provider = new FireworksAiChatProvider();

  static async handleFireworksStream(
    param: {
      openai: OpenAI;
      systemPrompt: any;
      preprocessedContext: any;
      maxTokens: number;
      messages: any;
      model: any;
      env: Env;
    },
    dataCallback: (data) => void,
  ) {
    return this.provider.handleStream(
      {
        systemPrompt: param.systemPrompt,
        preprocessedContext: param.preprocessedContext,
        maxTokens: param.maxTokens,
        messages: param.messages,
        model: param.model,
        env: param.env,
      },
      dataCallback,
    );
  }
}
