import { type StreamParams } from '@open-gsio/server/src/services/ChatService';
import { OpenAI } from 'openai';

import { ProviderRepository } from './_ProviderRepository.ts';
import { BaseChatProvider, type CommonProviderParams } from './chat-stream-provider.ts';

export class GoogleChatProvider extends BaseChatProvider {
  getOpenAIClient(param: CommonProviderParams): OpenAI {
    return new OpenAI({
      baseURL: ProviderRepository.OPENAI_COMPAT_ENDPOINTS.google,
      apiKey: param.env.GEMINI_API_KEY,
    });
  }

  getStreamParams(param: CommonProviderParams, safeMessages: any[]): any {
    return {
      model: param.model,
      messages: safeMessages,
      stream: true,
    };
  }

  async processChunk(chunk: any, dataCallback: (data: any) => void): Promise<boolean> {
    if (chunk.choices?.[0]?.finish_reason === 'stop') {
      dataCallback({
        type: 'chat',
        data: {
          choices: [
            {
              delta: { content: chunk.choices[0].delta.content || '' },
              finish_reason: 'stop',
              index: chunk.choices[0].index,
            },
          ],
        },
      });
      return true;
    } else {
      dataCallback({
        type: 'chat',
        data: {
          choices: [
            {
              delta: { content: chunk.choices?.[0]?.delta?.content || '' },
              finish_reason: null,
              index: chunk.choices?.[0]?.index || 0,
            },
          ],
        },
      });
      return false;
    }
  }
}

export class GoogleChatSdk {
  private static provider = new GoogleChatProvider();

  static async handleGoogleStream(param: StreamParams, dataCallback: (data: any) => void) {
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
