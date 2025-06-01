import { OpenAI } from "openai";
import {
  _NotCustomized,
  ISimpleType,
  ModelPropertiesDeclarationToProperties,
  ModelSnapshotType2,
  UnionStringArray,
} from "mobx-state-tree";
import { BaseChatProvider, CommonProviderParams } from "./chat-stream-provider";

export class GroqChatProvider extends BaseChatProvider {
  getOpenAIClient(param: CommonProviderParams): OpenAI {
    return new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: param.env.GROQ_API_KEY,
    });
  }

  getStreamParams(param: CommonProviderParams, safeMessages: any[]): any {
    const llamaTuningParams = {
      temperature: 0.86,
      top_p: 0.98,
      presence_penalty: 0.1,
      frequency_penalty: 0.3,
      max_tokens: param.maxTokens as number,
    };

    return {
      model: param.model,
      messages: safeMessages,
      stream: true,
      ...llamaTuningParams
    };
  }

  async processChunk(chunk: any, dataCallback: (data: any) => void): Promise<boolean> {
    // Check if this is the final chunk
    if (chunk.choices && chunk.choices[0]?.finish_reason === "stop") {
      dataCallback({ type: "chat", data: chunk });
      return true; // Break the stream
    }

    dataCallback({ type: "chat", data: chunk });
    return false; // Continue the stream
  }
}

// Legacy class for backward compatibility
export class GroqChatSdk {
  private static provider = new GroqChatProvider();

  static async handleGroqStream(
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
