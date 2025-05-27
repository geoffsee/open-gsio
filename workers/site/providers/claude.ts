import Anthropic from "@anthropic-ai/sdk";
import { OpenAI } from "openai";
import {
  _NotCustomized,
  ISimpleType,
  ModelPropertiesDeclarationToProperties,
  ModelSnapshotType2,
  UnionStringArray,
} from "mobx-state-tree";
import ChatSdk from "../sdk/chat-sdk";

export class ClaudeChatSdk {
  private static async streamClaudeResponse(
    messages: any[],
    param: {
      model: string;
      maxTokens: number | unknown | undefined;
      anthropic: Anthropic;
    },
    dataCallback: (data: any) => void,
  ) {
    const claudeStream = await param.anthropic.messages.create({
      stream: true,
      model: param.model,
      max_tokens: param.maxTokens,
      messages: messages,
    });

    for await (const chunk of claudeStream) {
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
        break;
      }
      dataCallback({ type: "chat", data: chunk });
    }
  }
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
    const {
      preprocessedContext,
      messages,
      env,
      maxTokens,
      systemPrompt,
      model,
    } = param;

    const assistantPrompt = ChatSdk.buildAssistantPrompt({
      maxTokens: maxTokens,
    });

    const safeMessages = ChatSdk.buildMessageChain(messages, {
      systemPrompt: systemPrompt,
      model,
      assistantPrompt,
      toolResults: preprocessedContext,
    });

    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });

    return ClaudeChatSdk.streamClaudeResponse(
      safeMessages,
      {
        model: param.model,
        maxTokens: param.maxTokens,
        anthropic: anthropic,
      },
      dataCallback,
    );
  }
}
