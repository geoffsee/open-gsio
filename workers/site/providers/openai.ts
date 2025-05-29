import { OpenAI } from "openai";
import ChatSdk from "../lib/chat-sdk";
import { Utils } from "../lib/utils";
import {ChatCompletionCreateParamsStreaming} from "openai/resources/chat/completions/completions";

export class OpenAiChatSdk {
  static async handleOpenAiStream(
    ctx: {
      openai: OpenAI;
      systemPrompt: any;
      preprocessedContext: any;
      maxTokens: unknown | number | undefined;
      messages: any;
      model: any;
    },
    dataCallback: (data: any) => any,
  ) {
    const {
      openai,
      systemPrompt,
      maxTokens,
      messages,
      model,
      preprocessedContext,
    } = ctx;

    if (!messages?.length) {
      return new Response("No messages provided", { status: 400 });
    }

    const assistantPrompt = ChatSdk.buildAssistantPrompt({
      maxTokens: maxTokens,
    });
    const safeMessages = ChatSdk.buildMessageChain(messages, {
      systemPrompt: systemPrompt,
      model,
      assistantPrompt,
      toolResults: preprocessedContext,
    });

    return OpenAiChatSdk.streamOpenAiResponse(
      safeMessages,
      {
        model,
        maxTokens: maxTokens as number,
        openai: openai,
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
      temperature: 0.86,
      top_p: 0.98,
      presence_penalty: 0.1,
      frequency_penalty: 0.3,
      max_tokens: opts.maxTokens,
    };

    const getTuningParams = () => {
      if (isO1()) {
        tuningParams["temperature"] = 1;
        tuningParams["max_completion_tokens"] = opts.maxTokens + 10000;
        return tuningParams;
      }
      return gpt4oTuningParams;
    };

    let completionRequest: ChatCompletionCreateParamsStreaming = {
      model: opts.model,
      stream: true,
      messages: messages
    };

    const isLocal = opts.openai.baseURL.includes("localhost");


    if(isLocal) {
      completionRequest["messages"] = Utils.normalizeWithBlanks(messages)
      completionRequest["stream_options"] =  {
        include_usage: true
      }
    } else {
      completionRequest = {...completionRequest, ...getTuningParams()}
    }

    const openAIStream = await opts.openai.chat.completions.create(completionRequest);

    for await (const chunk of openAIStream) {
      if (isLocal && chunk.usage) {
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
}
