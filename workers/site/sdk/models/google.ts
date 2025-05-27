import { OpenAI } from "openai";
import ChatSdk from "../chat-sdk";
import { StreamParams } from "../../services/ChatService";

export class GoogleChatSdk {
  static async handleGoogleStream(
    param: StreamParams,
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
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey: param.env.GEMINI_API_KEY,
    });

    return GoogleChatSdk.streamGoogleResponse(
      safeMessages,
      {
        model: param.model,
        maxTokens: param.maxTokens,
        openai: openai,
      },
      dataCallback,
    );
  }
  private static async streamGoogleResponse(
    messages: any[],
    opts: {
      model: string;
      maxTokens: number | unknown | undefined;
      openai: OpenAI;
    },
    dataCallback: (data: any) => void,
  ) {
    const chatReq = JSON.stringify({
      model: opts.model,
      messages: messages,
      stream: true,
    });

    const googleStream = await opts.openai.chat.completions.create(
      JSON.parse(chatReq),
    );

    for await (const chunk of googleStream) {
      console.log(JSON.stringify(chunk));

      if (chunk.choices?.[0]?.finishReason === "stop") {
        dataCallback({
          type: "chat",
          data: {
            choices: [
              {
                delta: { content: chunk.choices[0].delta.content || "" },
                finish_reason: "stop",
                index: chunk.choices[0].index,
              },
            ],
          },
        });
        break;
      } else {
        dataCallback({
          type: "chat",
          data: {
            choices: [
              {
                delta: { content: chunk.choices?.[0]?.delta?.content || "" },
                finish_reason: null,
                index: chunk.choices?.[0]?.index || 0,
              },
            ],
          },
        });
      }
    }
  }
}
