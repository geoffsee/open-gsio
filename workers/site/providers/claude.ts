import Anthropic from "@anthropic-ai/sdk";
import {OpenAI} from "openai";
import {
  _NotCustomized,
  ISimpleType,
  ModelPropertiesDeclarationToProperties,
  ModelSnapshotType2,
  UnionStringArray,
} from "mobx-state-tree";
import ChatSdk from "../lib/chat-sdk";
import {BaseChatProvider, CommonProviderParams} from "./chat-stream-provider";

export class ClaudeChatProvider extends BaseChatProvider {
  private anthropic: Anthropic | null = null;

  getOpenAIClient(param: CommonProviderParams): OpenAI {
    // Claude doesn't use OpenAI client directly, but we need to return something
    // to satisfy the interface. The actual Anthropic client is created in getStreamParams.
    return param.openai as OpenAI;
  }

  getStreamParams(param: CommonProviderParams, safeMessages: any[]): any {
    this.anthropic = new Anthropic({
      apiKey: param.env.ANTHROPIC_API_KEY,
    });

    const claudeTuningParams = {
      temperature: 0.7,
      max_tokens: param.maxTokens as number,
    };

    return {
      stream: true,
      model: param.model,
      messages: safeMessages,
      ...claudeTuningParams
    };
  }

  async processChunk(chunk: any, dataCallback: (data: any) => void): Promise<boolean> {
    if (chunk.type === "message_stop") {
      dataCallback({
        type: "chat",
        data: {
          choices: [
            {
              delta: { content: "" },
              logprobs: null,
              finish_reason: "stop",
            },
          ],
        },
      });
      return true;
    }

    dataCallback({ type: "chat", data: chunk });
    return false;
  }

  // Override the base handleStream method to use Anthropic client instead of OpenAI
  async handleStream(
    param: CommonProviderParams,
    dataCallback: (data: any) => void,
  ) {
    const assistantPrompt = ChatSdk.buildAssistantPrompt({ maxTokens: param.maxTokens });
    const safeMessages = ChatSdk.buildMessageChain(param.messages, {
      systemPrompt: param.systemPrompt,
      model: param.model,
      assistantPrompt,
      toolResults: param.preprocessedContext,
    });

    const streamParams = this.getStreamParams(param, safeMessages);

    if (!this.anthropic) {
      throw new Error("Anthropic client not initialized");
    }

    const stream = await this.anthropic.messages.create(streamParams);

    for await (const chunk of stream) {
      const shouldBreak = await this.processChunk(chunk, dataCallback);
      if (shouldBreak) break;
    }
  }
}

// Legacy class for backward compatibility
export class ClaudeChatSdk {
  private static provider = new ClaudeChatProvider();

  static async handleClaudeStream(
    param: {
      openai: OpenAI;
      systemPrompt: any;
      preprocessedContext: ModelSnapshotType2<
        ModelPropertiesDeclarationToProperties<{
          role: ISimpleType<UnionStringArray<string[]>>;
          content: ISimpleType<unknown>;
        }>,
        _NotCustomized
      >;
      maxTokens: unknown | number | undefined;
      messages: any;
      model: string;
      env: Env;
    },
    dataCallback: (data) => void,
  ) {
    return this.provider.handleStream(
      {
        openai: param.openai,
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
