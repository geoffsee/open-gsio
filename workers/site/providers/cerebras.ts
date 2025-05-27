import { OpenAI } from "openai";
import {
  _NotCustomized,
  ISimpleType,
  ModelPropertiesDeclarationToProperties,
  ModelSnapshotType2,
  UnionStringArray,
} from "mobx-state-tree";
import ChatSdk from "../sdk/chat-sdk";

export class CerebrasSdk {
  static async handleCerebrasStream(
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

    const openai = new OpenAI({
      baseURL: "https://api.cerebras.ai/v1",
      apiKey: param.env.CEREBRAS_API_KEY,
    });

    return CerebrasSdk.streamCerebrasResponse(
      safeMessages,
      {
        model: param.model,
        maxTokens: param.maxTokens,
        openai: openai,
      },
      dataCallback,
    );
  }
  private static async streamCerebrasResponse(
    messages: any[],
    opts: {
      model: string;
      maxTokens: number | unknown | undefined;
      openai: OpenAI;
    },
    dataCallback: (data: any) => void,
  ) {
    const tuningParams: Record<string, any> = {};

    const llamaTuningParams = {
      temperature: 0.86,
      top_p: 0.98,
      presence_penalty: 0.1,
      frequency_penalty: 0.3,
      max_tokens: opts.maxTokens,
    };

    const getLlamaTuningParams = () => {
      return llamaTuningParams;
    };

    const groqStream = await opts.openai.chat.completions.create({
      model: opts.model,
      messages: messages,

      stream: true,
    });

    for await (const chunk of groqStream) {
      dataCallback({ type: "chat", data: chunk });
    }
  }
}
