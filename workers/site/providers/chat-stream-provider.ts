import { OpenAI } from "openai";
import ChatSdk from "../lib/chat-sdk";

export interface CommonProviderParams {
  openai?: OpenAI; // Optional for providers that use a custom client.
  systemPrompt: any;
  preprocessedContext: any;
  maxTokens: number | unknown | undefined;
  messages: any;
  model: string;
  env: Env;
  disableWebhookGeneration?: boolean;
  // Additional fields can be added as needed
}

export interface ChatStreamProvider {
  handleStream(
    param: CommonProviderParams,
    dataCallback: (data: any) => void,
  ): Promise<any>;
}

export abstract class BaseChatProvider implements ChatStreamProvider {
  abstract getOpenAIClient(param: CommonProviderParams): OpenAI;
  abstract getStreamParams(param: CommonProviderParams, safeMessages: any[]): any;
  abstract async processChunk(chunk: any, dataCallback: (data: any) => void): Promise<boolean>;

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

    const client = this.getOpenAIClient(param);
    const streamParams = this.getStreamParams(param, safeMessages);
    const stream = await client.chat.completions.create(streamParams);

    for await (const chunk of stream) {
      const shouldBreak = await this.processChunk(chunk, dataCallback);
      if (shouldBreak) break;
    }
  }
}