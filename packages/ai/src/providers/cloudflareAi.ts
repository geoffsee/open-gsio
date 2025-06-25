import { OpenAI } from 'openai';

import { ProviderRepository } from './_ProviderRepository.ts';
import { BaseChatProvider, type CommonProviderParams } from './chat-stream-provider.ts';

export class CloudflareAiChatProvider extends BaseChatProvider {
  getOpenAIClient(param: CommonProviderParams): OpenAI {
    return new OpenAI({
      apiKey: param.env.CLOUDFLARE_API_KEY,
      baseURL: ProviderRepository.OPENAI_COMPAT_ENDPOINTS.cloudflare.replace(
        '{CLOUDFLARE_ACCOUNT_ID}',
        param.env.CLOUDFLARE_ACCOUNT_ID,
      ),
    });
  }

  getStreamParams(param: CommonProviderParams, safeMessages: any[]): any {
    const generationParams: Record<string, any> = {
      model: this.getModelWithPrefix(param.model),
      messages: safeMessages,
      stream: true,
    };

    // Set max_tokens based on model
    if (this.getModelPrefix(param.model) === '@cf/meta') {
      generationParams['max_tokens'] = 4096;
    }

    if (this.getModelPrefix(param.model) === '@hf/mistral') {
      generationParams['max_tokens'] = 4096;
    }

    if (param.model.toLowerCase().includes('hermes-2-pro-mistral-7b')) {
      generationParams['max_tokens'] = 1000;
    }

    if (param.model.toLowerCase().includes('openhermes-2.5-mistral-7b-awq')) {
      generationParams['max_tokens'] = 1000;
    }

    if (param.model.toLowerCase().includes('deepseek-coder-6.7b-instruct-awq')) {
      generationParams['max_tokens'] = 590;
    }

    if (param.model.toLowerCase().includes('deepseek-math-7b-instruct')) {
      generationParams['max_tokens'] = 512;
    }

    if (param.model.toLowerCase().includes('neural-chat-7b-v3-1-awq')) {
      generationParams['max_tokens'] = 590;
    }

    if (param.model.toLowerCase().includes('openchat-3.5-0106')) {
      generationParams['max_tokens'] = 2000;
    }

    return generationParams;
  }

  private getModelPrefix(model: string): string {
    let modelPrefix = `@cf/meta`;

    if (model.toLowerCase().includes('llama')) {
      modelPrefix = `@cf/meta`;
    }

    if (model.toLowerCase().includes('hermes-2-pro-mistral-7b')) {
      modelPrefix = `@hf/nousresearch`;
    }

    if (model.toLowerCase().includes('mistral-7b-instruct')) {
      modelPrefix = `@hf/mistral`;
    }

    if (model.toLowerCase().includes('gemma')) {
      modelPrefix = `@cf/google`;
    }

    if (model.toLowerCase().includes('deepseek')) {
      modelPrefix = `@cf/deepseek-ai`;
    }

    if (model.toLowerCase().includes('openchat-3.5-0106')) {
      modelPrefix = `@cf/openchat`;
    }

    const isNueralChat = model.toLowerCase().includes('neural-chat-7b-v3-1-awq');
    if (
      isNueralChat ||
      model.toLowerCase().includes('openhermes-2.5-mistral-7b-awq') ||
      model.toLowerCase().includes('zephyr-7b-beta-awq') ||
      model.toLowerCase().includes('deepseek-coder-6.7b-instruct-awq')
    ) {
      modelPrefix = `@hf/thebloke`;
    }

    return modelPrefix;
  }

  private getModelWithPrefix(model: string): string {
    return `${this.getModelPrefix(model)}/${model}`;
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

export class CloudflareAISdk {
  private static provider = new CloudflareAiChatProvider();

  static async handleCloudflareAIStream(
    param: {
      openai: OpenAI;
      systemPrompt: any;
      preprocessedContext: any;
      maxTokens: unknown | number | undefined;
      messages: any;
      model: string;
      env: Env;
    },
    dataCallback: (data: any) => void,
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
