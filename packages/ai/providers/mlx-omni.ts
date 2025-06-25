import { Utils } from '@open-gsio/server/src/lib/utils.ts';
import { OpenAI } from 'openai';
import { ChatCompletionCreateParamsStreaming } from 'openai/resources/chat/completions/completions';

import { BaseChatProvider, CommonProviderParams } from './chat-stream-provider.ts';

export class MlxOmniChatProvider extends BaseChatProvider {
  getOpenAIClient(param: CommonProviderParams): OpenAI {
    return new OpenAI({
      baseURL: 'http://localhost:10240',
      apiKey: param.env.MLX_API_KEY,
    });
  }

  getStreamParams(
    param: CommonProviderParams,
    safeMessages: any[],
  ): ChatCompletionCreateParamsStreaming {
    const baseTuningParams = {
      temperature: 0.86,
      top_p: 0.98,
      presence_penalty: 0.1,
      frequency_penalty: 0.3,
      max_tokens: param.maxTokens as number,
    };

    const getTuningParams = () => {
      return baseTuningParams;
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

export class MlxOmniChatSdk {
  private static provider = new MlxOmniChatProvider();

  static async handleMlxOmniStream(ctx: any, dataCallback: (data: any) => any) {
    if (!ctx.messages?.length) {
      return new Response('No messages provided', { status: 400 });
    }

    return this.provider.handleStream(
      {
        systemPrompt: ctx.systemPrompt,
        preprocessedContext: ctx.preprocessedContext,
        maxTokens: ctx.maxTokens,
        messages: Utils.normalizeWithBlanks(ctx.messages),
        model: ctx.model,
        env: ctx.env,
      },
      dataCallback,
    );
  }
}
