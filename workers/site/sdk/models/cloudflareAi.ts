import { OpenAI } from "openai";
import {
  _NotCustomized,
  ISimpleType,
  ModelPropertiesDeclarationToProperties,
  ModelSnapshotType2,
  UnionStringArray,
} from "mobx-state-tree";
import ChatSdk from "../chat-sdk";

export class CloudflareAISdk {
  static async handleCloudflareAIStream(
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

    const cfAiURL = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`;

    console.log({ cfAiURL });
    const openai = new OpenAI({
      apiKey: env.CLOUDFLARE_API_KEY,
      baseURL: cfAiURL,
    });

    return CloudflareAISdk.streamCloudflareAIResponse(
      safeMessages,
      {
        model: param.model,
        maxTokens: param.maxTokens,
        openai: openai,
      },
      dataCallback,
    );
  }
  private static async streamCloudflareAIResponse(
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

    let modelPrefix = `@cf/meta`;

    if (opts.model.toLowerCase().includes("llama")) {
      modelPrefix = `@cf/meta`;
    }

    if (opts.model.toLowerCase().includes("hermes-2-pro-mistral-7b")) {
      modelPrefix = `@hf/nousresearch`;
    }

    if (opts.model.toLowerCase().includes("mistral-7b-instruct")) {
      modelPrefix = `@hf/mistral`;
    }

    if (opts.model.toLowerCase().includes("gemma")) {
      modelPrefix = `@cf/google`;
    }

    if (opts.model.toLowerCase().includes("deepseek")) {
      modelPrefix = `@cf/deepseek-ai`;
    }

    if (opts.model.toLowerCase().includes("openchat-3.5-0106")) {
      modelPrefix = `@cf/openchat`;
    }

    const isNueralChat = opts.model
      .toLowerCase()
      .includes("neural-chat-7b-v3-1-awq");
    if (
      isNueralChat ||
      opts.model.toLowerCase().includes("openhermes-2.5-mistral-7b-awq") ||
      opts.model.toLowerCase().includes("zephyr-7b-beta-awq") ||
      opts.model.toLowerCase().includes("deepseek-coder-6.7b-instruct-awq")
    ) {
      modelPrefix = `@hf/thebloke`;
    }

    const generationParams: Record<string, any> = {
      model: `${modelPrefix}/${opts.model}`,
      messages: messages,
      stream: true,
    };

    if (modelPrefix === "@cf/meta") {
      generationParams["max_tokens"] = 4096;
    }

    if (modelPrefix === "@hf/mistral") {
      generationParams["max_tokens"] = 4096;
    }

    if (opts.model.toLowerCase().includes("hermes-2-pro-mistral-7b")) {
      generationParams["max_tokens"] = 1000;
    }

    if (opts.model.toLowerCase().includes("openhermes-2.5-mistral-7b-awq")) {
      generationParams["max_tokens"] = 1000;
    }

    if (opts.model.toLowerCase().includes("deepseek-coder-6.7b-instruct-awq")) {
      generationParams["max_tokens"] = 590;
    }

    if (opts.model.toLowerCase().includes("deepseek-math-7b-instruct")) {
      generationParams["max_tokens"] = 512;
    }

    if (opts.model.toLowerCase().includes("neural-chat-7b-v3-1-awq")) {
      generationParams["max_tokens"] = 590;
    }

    if (opts.model.toLowerCase().includes("openchat-3.5-0106")) {
      generationParams["max_tokens"] = 2000;
    }

    const cloudflareAiStream = await opts.openai.chat.completions.create({
      ...generationParams,
    });

    for await (const chunk of cloudflareAiStream) {
      dataCallback({ type: "chat", data: chunk });
    }
  }
}
