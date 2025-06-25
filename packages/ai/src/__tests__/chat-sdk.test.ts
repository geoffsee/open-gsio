import { Message } from '@open-gsio/schema';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AssistantSdk } from '../assistant-sdk';
import { ChatSdk } from '../chat-sdk';

// Mock dependencies
vi.mock('../assistant-sdk', () => ({
  AssistantSdk: {
    getAssistantPrompt: vi.fn(),
  },
}));

vi.mock('../../models/Message', () => ({
  default: {
    create: vi.fn(message => message),
  },
}));

vi.mock('../../providers/_ProviderRepository', () => ({
  ProviderRepository: {
    getModelFamily: vi.fn(),
  },
}));

describe('ChatSdk', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
  });

  describe('preprocess', () => {
    it('should return an assistant message with empty content', async () => {
      const messages = [{ role: 'user', content: 'Hello' }];

      const result = await ChatSdk.preprocess({ messages });

      expect(Message.create).toHaveBeenCalledWith({
        role: 'assistant',
        content: '',
      });
      expect(result).toEqual({
        role: 'assistant',
        content: '',
      });
    });
  });

  describe('handleChatRequest', () => {
    it('should return a 400 response if no messages are provided', async () => {
      const request = {
        json: vi.fn().mockResolvedValue({ messages: [] }),
      };
      const ctx = {
        openai: {},
        systemPrompt: 'System prompt',
        maxTokens: 1000,
        env: {
          SERVER_COORDINATOR: {
            idFromName: vi.fn(),
            get: vi.fn(),
          },
        },
      };

      const response = await ChatSdk.handleChatRequest(request as any, ctx as any);

      expect(response.status).toBe(400);
      expect(await response.text()).toBe('No messages provided');
    });

    it('should save stream data and return a response with streamUrl', async () => {
      const streamId = 'test-uuid';
      vi.stubGlobal('crypto', {
        randomUUID: vi.fn().mockReturnValue(streamId),
      });

      const messages = [{ role: 'user', content: 'Hello' }];
      const model = 'gpt-4';
      const conversationId = 'conv-123';

      const request = {
        json: vi.fn().mockResolvedValue({ messages, model, conversationId }),
      };

      const saveStreamData = vi.fn();
      const durableObject = {
        saveStreamData,
      };

      const ctx = {
        openai: {},
        systemPrompt: 'System prompt',
        maxTokens: 1000,
        env: {
          SERVER_COORDINATOR: {
            idFromName: vi.fn().mockReturnValue('object-id'),
            get: vi.fn().mockReturnValue(durableObject),
          },
        },
      };

      const response = await ChatSdk.handleChatRequest(request as any, ctx as any);
      const responseBody = await response.json();

      expect(ctx.env.SERVER_COORDINATOR.idFromName).toHaveBeenCalledWith('stream-index');
      expect(ctx.env.SERVER_COORDINATOR.get).toHaveBeenCalledWith('object-id');
      expect(saveStreamData).toHaveBeenCalledWith(streamId, expect.stringContaining(model));
      expect(responseBody).toEqual({
        streamUrl: `/api/streams/${streamId}`,
      });
    });
  });

  describe('calculateMaxTokens', () => {
    it('should call the durable object to calculate max tokens', async () => {
      const messages = [{ role: 'user', content: 'Hello' }];
      const dynamicMaxTokens = vi.fn().mockResolvedValue(500);
      const durableObject = {
        dynamicMaxTokens,
      };

      const ctx = {
        maxTokens: 1000,
        env: {
          SERVER_COORDINATOR: {
            idFromName: vi.fn().mockReturnValue('object-id'),
            get: vi.fn().mockReturnValue(durableObject),
          },
        },
      };

      await ChatSdk.calculateMaxTokens(messages, ctx as any);

      expect(ctx.env.SERVER_COORDINATOR.idFromName).toHaveBeenCalledWith('dynamic-token-counter');
      expect(ctx.env.SERVER_COORDINATOR.get).toHaveBeenCalledWith('object-id');
      expect(dynamicMaxTokens).toHaveBeenCalledWith(messages, 1000);
    });
  });

  describe('buildAssistantPrompt', () => {
    it('should call AssistantSdk.getAssistantPrompt with the correct parameters', () => {
      vi.mocked(AssistantSdk.getAssistantPrompt).mockReturnValue('Assistant prompt');

      const result = ChatSdk.buildAssistantPrompt({ maxTokens: 1000 });

      expect(AssistantSdk.getAssistantPrompt).toHaveBeenCalledWith({
        maxTokens: 1000,
        userTimezone: 'UTC',
        userLocation: 'USA/unknown',
      });
      expect(result).toBe('Assistant prompt');
    });
  });

  describe('buildMessageChain', () => {
    // TODO: Fix this test
    // it('should build a message chain with system role for most models', async () => {
    //   vi.mocked(ProviderRepository.getModelFamily).mockResolvedValue('openai');
    //
    //   const messages = [{ role: 'user', content: 'Hello' }];
    //
    //   const opts = {
    //     systemPrompt: 'System prompt',
    //     assistantPrompt: 'Assistant prompt',
    //     toolResults: { role: 'tool', content: 'Tool result' },
    //     model: 'gpt-4',
    //   };
    //
    //   const result = await ChatSdk.buildMessageChain(messages, opts as any);
    //
    //   expect(ProviderRepository.getModelFamily).toHaveBeenCalledWith('gpt-4', undefined);
    //   expect(Message.create).toHaveBeenCalledTimes(3);
    //   expect(Message.create).toHaveBeenNthCalledWith(1, {
    //     role: 'system',
    //     content: 'System prompt',
    //   });
    //   expect(Message.create).toHaveBeenNthCalledWith(2, {
    //     role: 'assistant',
    //     content: 'Assistant prompt',
    //   });
    //   expect(Message.create).toHaveBeenNthCalledWith(3, {
    //     role: 'user',
    //     content: 'Hello',
    //   });
    // });
    // TODO: Fix this test
    // it('should build a message chain with assistant role for o1, gemma, claude, or google models', async () => {
    //   vi.mocked(ProviderRepository.getModelFamily).mockResolvedValue('claude');
    //
    //   const messages = [{ role: 'user', content: 'Hello' }];
    //
    //   const opts = {
    //     systemPrompt: 'System prompt',
    //     assistantPrompt: 'Assistant prompt',
    //     toolResults: { role: 'tool', content: 'Tool result' },
    //     model: 'claude-3',
    //   };
    //
    //   const result = await ChatSdk.buildMessageChain(messages, opts as any);
    //
    //   expect(ProviderRepository.getModelFamily).toHaveBeenCalledWith('claude-3', undefined);
    //   expect(Message.create).toHaveBeenCalledTimes(3);
    //   expect(Message.create).toHaveBeenNthCalledWith(1, {
    //     role: 'assistant',
    //     content: 'System prompt',
    //   });
    // });
    // TODO: Fix this test
    // it('should filter out messages with empty content', async () => {
    //   //
    //   vi.mocked(ProviderRepository.getModelFamily).mockResolvedValue('openai');
    //
    //   const messages = [
    //     { role: 'user', content: 'Hello' },
    //     { role: 'user', content: '' },
    //     { role: 'user', content: '  ' },
    //     { role: 'user', content: 'World' },
    //   ];
    //
    //   const opts = {
    //     systemPrompt: 'System prompt',
    //     assistantPrompt: 'Assistant prompt',
    //     toolResults: { role: 'tool', content: 'Tool result' },
    //     model: 'gpt-4',
    //   };
    //
    //   const result = await ChatSdk.buildMessageChain(messages, opts as any);
    //
    //   // 2 system/assistant messages + 2 user messages (Hello and World)
    //   expect(Message.create).toHaveBeenCalledTimes(4);
    // });
  });
});
