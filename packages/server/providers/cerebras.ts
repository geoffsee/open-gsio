import { OpenAI } from 'openai';

import { ProviderRepository } from './_ProviderRepository';
import { BaseChatProvider, CommonProviderParams } from './chat-stream-provider.ts';

export class CerebrasChatProvider extends BaseChatProvider {
  getOpenAIClient(param: CommonProviderParams): OpenAI {
    return new OpenAI({
      baseURL: ProviderRepository.OPENAI_COMPAT_ENDPOINTS.cerebras,
      apiKey: param.env.CEREBRAS_API_KEY,
    });
  }

  getStreamParams(param: CommonProviderParams, safeMessages: any[]): any {
    // models provided by cerebras do not follow standard tune params
    // they must be individually configured
    // const tuningParams = {
    //   temperature: 0.86,
    //   top_p: 0.98,
    //   presence_penalty: 0.1,
    //   frequency_penalty: 0.3,
    //   max_tokens: param.maxTokens as number,
    // };

    return {
      model: param.model,
      messages: safeMessages,
      stream: true,
      // ...tuningParams
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

export class CerebrasSdk {
  private static provider = new CerebrasChatProvider();

  static async handleCerebrasStream(
    param: {
      openai: OpenAI;
      systemPrompt: any;
      disableWebhookGeneration: boolean;
      preprocessedContext: any;
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
        disableWebhookGeneration: param.disableWebhookGeneration,
      },
      dataCallback,
    );
  }
}
