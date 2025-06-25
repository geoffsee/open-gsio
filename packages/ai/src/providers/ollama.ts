import { OpenAI } from 'openai';

import type { GenericEnv } from '../types';

import { ProviderRepository } from './_ProviderRepository.ts';
import { BaseChatProvider, type CommonProviderParams } from './chat-stream-provider.ts';

export class OllamaChatProvider extends BaseChatProvider {
  getOpenAIClient(param: CommonProviderParams): OpenAI {
    return new OpenAI({
      baseURL: param.env.OLLAMA_API_ENDPOINT ?? ProviderRepository.OPENAI_COMPAT_ENDPOINTS.ollama,
      apiKey: param.env.OLLAMA_API_KEY,
    });
  }

  getStreamParams(param: CommonProviderParams, safeMessages: any[]): any {
    const tuningParams = {
      temperature: 0.75,
    };

    const getTuningParams = () => {
      return tuningParams;
    };

    return {
      model: param.model,
      messages: safeMessages,
      stream: true,
      ...getTuningParams(),
    };
  }

  async processChunk(chunk: any, dataCallback: (data: any) => void): Promise<boolean> {
    if (chunk.choices && chunk.choices[0]?.finish_reason === 'stop') {
      dataCallback({ type: 'chat', data: chunk });
      return true;
    }

    dataCallback({ type: 'chat', data: chunk });
    return false;
  }
}

export class OllamaChatSdk {
  private static provider = new OllamaChatProvider();

  static async handleOllamaStream(
    ctx: {
      openai: OpenAI;
      systemPrompt: any;
      preprocessedContext: any;
      maxTokens: unknown | number | undefined;
      messages: any;
      model: any;
      env: GenericEnv;
    },
    dataCallback: (data: any) => any,
  ) {
    if (!ctx.messages?.length) {
      return new Response('No messages provided', { status: 400 });
    }

    return this.provider.handleStream(
      {
        systemPrompt: ctx.systemPrompt,
        preprocessedContext: ctx.preprocessedContext,
        maxTokens: ctx.maxTokens,
        messages: ctx.messages,
        model: ctx.model,
        env: ctx.env,
      },
      dataCallback,
    );
  }
}
