import { Utils } from '@open-gsio/server/src/lib/utils.ts';
import { OpenAI } from 'openai';
import { ChatCompletionCreateParamsStreaming } from 'openai/resources/chat/completions/completions';

import { BaseChatProvider, CommonProviderParams } from './chat-stream-provider.ts';

export class OpenAiChatProvider extends BaseChatProvider {
  getOpenAIClient(param: CommonProviderParams): OpenAI {
    return param.openai as OpenAI;
  }

  getStreamParams(
    param: CommonProviderParams,
    safeMessages: any[],
  ): ChatCompletionCreateParamsStreaming {
    const isO1 = () => {
      if (param.model === 'o1-preview' || param.model === 'o1-mini') {
        return true;
      }
    };

    const tuningParams: Record<string, any> = {};

    const gpt4oTuningParams = {
      temperature: 0.86,
      top_p: 0.98,
      presence_penalty: 0.1,
      frequency_penalty: 0.3,
      max_tokens: param.maxTokens as number,
    };

    const getTuningParams = () => {
      if (isO1()) {
        tuningParams['temperature'] = 1;
        tuningParams['max_completion_tokens'] = (param.maxTokens as number) + 10000;
        return tuningParams;
      }
      return gpt4oTuningParams;
    };

    let completionRequest: ChatCompletionCreateParamsStreaming = {
      model: param.model,
      stream: true,
      messages: safeMessages,
    };

    const client = this.getOpenAIClient(param);
    const isLocal = client.baseURL.includes('localhost');

    if (isLocal) {
      completionRequest['messages'] = Utils.normalizeWithBlanks(safeMessages);
      completionRequest['stream_options'] = {
        include_usage: true,
      };
    } else {
      completionRequest = { ...completionRequest, ...getTuningParams() };
    }

    return completionRequest;
  }

  async processChunk(chunk: any, dataCallback: (data: any) => void): Promise<boolean> {
    const isLocal = chunk.usage !== undefined;

    if (isLocal && chunk.usage) {
      dataCallback({
        type: 'chat',
        data: {
          choices: [
            {
              delta: { content: '' },
              logprobs: null,
              finish_reason: 'stop',
            },
          ],
        },
      });
      return true; // Break the stream
    }

    dataCallback({ type: 'chat', data: chunk });
    return false; // Continue the stream
  }
}

// Legacy class for backward compatibility
export class OpenAiChatSdk {
  private static provider = new OpenAiChatProvider();

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
    if (!ctx.messages?.length) {
      return new Response('No messages provided', { status: 400 });
    }

    return this.provider.handleStream(
      {
        openai: ctx.openai,
        systemPrompt: ctx.systemPrompt,
        preprocessedContext: ctx.preprocessedContext,
        maxTokens: ctx.maxTokens,
        messages: ctx.messages,
        model: ctx.model,
        env: {} as Env, // This is not used in OpenAI provider
      },
      dataCallback,
    );
  }
}
