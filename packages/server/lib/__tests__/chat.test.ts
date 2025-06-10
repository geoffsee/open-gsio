import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Chat } from '../chat.ts';
import Message from '../../models/Message.ts';
import ProviderRepository from "@open-gsio/ai/providers/_ProviderRepository";


const mockEnv = {
  OPENAI_API_KEY: 'test-api-key',
  OPENAI_API_ENDPOINT: 'https://api.openai.com/v1',
  SERVER_COORDINATOR: {
    idFromName: vi.fn().mockReturnValue('test-id'),
    get: vi.fn().mockReturnValue({
      getStreamData: vi.fn().mockResolvedValue(JSON.stringify([]))
    })
  },
  KV_STORAGE: {
    get: vi.fn().mockResolvedValue(JSON.stringify({
      maxTokens: 1000,
      systemPrompt: 'some System prompt',
      assistantPrompt: 'some Assistant prompt'
    }))
  }
}
// Mock dependencies
vi.mock('@open-gsio/ai/prompting/assistant-prompt', () => ({
  AssistantPrompt: {
    getAssistantPrompt: vi.fn()
  }
}));

vi.mock('../../models/Message', () => ({
  default: {
    create: vi.fn((message) => message)
  }
}));

vi.mock('@open-gsio/ai/prompting/providers/_ProviderRepository', () => ({
  default: {
    getModelFamily: vi.fn()
  },
}));


describe('Chat', () => {
  // beforeEach(() => {
  //   // Reset mocks
  //   vi.resetAllMocks();
  // });

  describe('preprocess', () => {
    it('should return an assistant message with empty content', async () => {
      const messages = [{ role: 'user', content: 'Hello' }];
      
      const result = await Chat.preprocess({ messages });
      
      expect(Message.create).toHaveBeenCalledWith({
        role: 'assistant',
        content: ''
      });
      expect(result).toEqual({
        role: 'assistant',
        content: ''
      });
    });
  });

  describe('handleChatRequest', () => {
    it('should return a 400 response if no messages are provided', async () => {
      const request = {
        json: vi.fn().mockResolvedValue({ messages: [] })
      };
      const ctx = {
        openai: {},
        systemPrompt: 'System prompt',
        maxTokens: 1000,
        env: {
          SERVER_COORDINATOR: {
            idFromName: vi.fn(),
            get: vi.fn()
          }
        }
      };

      const response = await Chat.handleChatRequest(request as any, ctx as any);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('No messages provided');
    });

    it('should save stream data and return a response with streamUrl', async () => {
      const streamId = 'test-uuid';
      vi.stubGlobal('crypto', {
        randomUUID: vi.fn().mockReturnValue(streamId)
      });

      const messages = [{ role: 'user', content: 'Hello' }];
      const model = 'gpt-4';
      const conversationId = 'conv-123';
      
      const request = {
        json: vi.fn().mockResolvedValue({ messages, model, conversationId })
      };
      
      const saveStreamData = vi.fn();
      const durableObject = {
        saveStreamData
      };
      
      const ctx = {
        openai: {},
        systemPrompt: 'System prompt',
        maxTokens: 1000,
        env: {
          SERVER_COORDINATOR: {
            idFromName: vi.fn().mockReturnValue('object-id'),
            get: vi.fn().mockReturnValue(durableObject)
          }
        }
      };

      const response = await Chat.handleChatRequest(request as any, ctx as any);
      const responseBody = await response.json();
      
      expect(ctx.env.SERVER_COORDINATOR.idFromName).toHaveBeenCalledWith('stream-index');
      expect(ctx.env.SERVER_COORDINATOR.get).toHaveBeenCalledWith('object-id');
      expect(saveStreamData).toHaveBeenCalledWith(
        streamId,
        expect.stringContaining(model)
      );
      expect(responseBody).toEqual({
        streamUrl: `/api/streams/${streamId}`
      });
    });
  });


  describe('buildMessageChain', () => {
    it('should build a message chain with system role for most models', async () => {
      // vi.mocked(ProviderRepository.getModelFamily).mockReturnValue('openai');
      vi.spyOn(ProviderRepository, 'getModelFamily').mockResolvedValue('openai');


      const messages = [
        { role: 'user', content: 'Hello' }
      ];
      
      const opts = {
        systemPrompt: 'System prompt',
        assistantPrompt: 'Assistant prompt',
        toolResults: { role: 'tool', content: 'Tool result' },
        model: 'gpt-4'
      };
      
      const result = await Chat.buildMessageChain(messages, opts as any);


      expect(ProviderRepository.getModelFamily).toHaveBeenCalledWith('gpt-4', undefined);
      expect(Message.create).toHaveBeenCalledTimes(3);
      expect(Message.create).toHaveBeenNthCalledWith(1, {
        role: 'system',
        content: 'System prompt'
      });
      expect(Message.create).toHaveBeenNthCalledWith(2, {
        role: 'assistant',
        content: 'Assistant prompt'
      });
      expect(Message.create).toHaveBeenNthCalledWith(3, {
        role: 'user',
        content: 'Hello'
      });
    });

    it('should build a message chain with assistant role for o1, gemma, claude, or google models', async () => {
      vi.mocked(ProviderRepository.getModelFamily).mockReturnValue('claude');
      
      const messages = [
        { role: 'user', content: 'Hello' }
      ];
      
      const opts = {
        systemPrompt: 'System prompt',
        assistantPrompt: 'Assistant prompt',
        toolResults: { role: 'tool', content: 'Tool result' },
        model: 'claude-3'
      };
      
      const result = await Chat.buildMessageChain(messages, opts as any);

      expect(ProviderRepository.getModelFamily).toHaveBeenCalledWith('claude-3', undefined);
      expect(Message.create).toHaveBeenCalledTimes(3);
      expect(Message.create).toHaveBeenNthCalledWith(1, {
        role: 'assistant',
        content: 'System prompt'
      });
      expect(Message.create).toHaveBeenNthCalledWith(2, {
        role: 'assistant',
        content: 'Assistant prompt'
      });
      expect(Message.create).toHaveBeenNthCalledWith(3, {
        role: 'user',
        content: 'Hello'
      });
    });

    it('should filter out messages with empty content', async () => {
      vi.mocked(ProviderRepository.getModelFamily).mockReturnValue('openai');
      
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'user', content: '' },
        { role: 'user', content: '  ' },
        { role: 'user', content: 'World' }
      ];
      
      const opts = {
        systemPrompt: 'System prompt',
        assistantPrompt: 'Assistant prompt',
        toolResults: { role: 'tool', content: 'Tool result' },
        model: 'gpt-4'
      };
      
      const result = await Chat.buildMessageChain(messages, opts as any);
      
      // 2 system/assistant messages + 2 user messages (Hello and World)
      expect(Message.create).toHaveBeenCalledTimes(4);
    });
  });
});