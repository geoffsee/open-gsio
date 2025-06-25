import { Schema } from '@open-gsio/schema';
import type { Instance } from 'mobx-state-tree';
import { OpenAI } from 'openai';

import { AssistantSdk } from '../assistant-sdk';
import { ProviderRepository } from '../providers/_ProviderRepository.ts';
import type {
  BuildAssistantPromptParams,
  ChatRequestBody,
  GenericEnv,
  PreprocessParams,
} from '../types';

export class ChatSdk {
  static async preprocess(params: PreprocessParams) {
    //   a slot for to provide additional context
    return Schema.Message.create({
      role: 'assistant',
      content: '',
    });
  }

  static async handleChatRequest(
    request: Request,
    ctx: {
      openai: OpenAI;
      systemPrompt: any;
      maxTokens: any;
      env: GenericEnv;
    },
  ) {
    const streamId = crypto.randomUUID();
    const { messages, model, conversationId } = (await request.json()) as ChatRequestBody;

    if (!messages?.length) {
      return new Response('No messages provided', { status: 400 });
    }

    const preprocessedContext = await ChatSdk.preprocess({
      messages,
    });
    // console.log(ctx.env)
    // console.log(ctx.env.SERVER_COORDINATOR);

    const objectId = ctx.env.SERVER_COORDINATOR.idFromName('stream-index');
    const durableObject = ctx.env.SERVER_COORDINATOR.get(objectId);

    await durableObject.saveStreamData(
      streamId,
      JSON.stringify({
        messages,
        model,
        conversationId,
        timestamp: Date.now(),
        systemPrompt: ctx.systemPrompt,
        preprocessedContext,
      }),
    );

    return new Response(
      JSON.stringify({
        streamUrl: `/api/streams/${streamId}`,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  static async calculateMaxTokens(
    messages: any[],
    ctx: Record<string, any> & {
      env: GenericEnv;
      maxTokens: number;
    },
  ) {
    const objectId = ctx.env.SERVER_COORDINATOR.idFromName('dynamic-token-counter');
    const durableObject = ctx.env.SERVER_COORDINATOR.get(objectId);
    return durableObject.dynamicMaxTokens(messages, ctx.maxTokens);
  }

  static buildAssistantPrompt(params: BuildAssistantPromptParams) {
    const { maxTokens } = params;
    return AssistantSdk.getAssistantPrompt({
      maxTokens,
      userTimezone: 'UTC',
      userLocation: 'USA/unknown',
    });
  }

  static async buildMessageChain(
    messages: any[],
    opts: {
      systemPrompt: any;
      assistantPrompt: string;
      toolResults: Instance<typeof Message>;
      model: any;
      env: GenericEnv;
    },
  ) {
    const modelFamily = await ProviderRepository.getModelFamily(opts.model, opts.env);

    const messagesToSend = [];

    messagesToSend.push(
      Schema.Message.create({
        role:
          opts.model.includes('o1') ||
          opts.model.includes('gemma') ||
          modelFamily === 'claude' ||
          modelFamily === 'google'
            ? 'assistant'
            : 'system',
        content: opts.systemPrompt.trim(),
      }),
    );

    messagesToSend.push(
      Schema.Message.create({
        role: 'assistant',
        content: opts.assistantPrompt.trim(),
      }),
    );

    messagesToSend.push(
      ...messages
        .filter((message: any) => message.content?.trim())
        .map((message: any) => Schema.Message.create(message)),
    );

    return messagesToSend;
  }
}

export default ChatSdk;
