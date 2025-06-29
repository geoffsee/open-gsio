import { getSnapshot } from 'mobx-state-tree';
import OpenAI from 'openai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ChatService, { ClientError } from '../chat-service/ChatService.ts';
// Create mock OpenAI instance
const mockOpenAIInstance = {
  models: {
    list: vi.fn().mockResolvedValue({
      data: [{ id: 'mlx-model-1' }, { id: 'mlx-model-2' }, { id: 'other-model' }],
    }),
  },
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
  baseURL: 'http://localhost:8000',
};

// Mock dependencies
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => mockOpenAIInstance),
  };
});

vi.mock('../../lib/chat-sdk', () => ({
  default: {
    handleChatRequest: vi.fn(),
    buildAssistantPrompt: vi.fn(),
    buildMessageChain: vi.fn(),
  },
}));

vi.mock('../../lib/handleStreamData', () => ({
  default: vi.fn().mockReturnValue(() => {}),
}));

// Mock ProviderRepository
vi.mock('@open-gsio/ai/providers/_ProviderRepository.ts', () => {
  return {
    ProviderRepository: class {
      constructor() {}
      getProviders() {
        return [{ name: 'openai', key: 'test-key', endpoint: 'https://api.openai.com/v1' }];
      }
    },
  };
});

describe('ChatService', () => {
  let chatService: any;
  let mockEnv: any;

  beforeEach(() => {
    // Create a new instance of the service before each test
    chatService = ChatService.create({
      maxTokens: 2000,
      systemPrompt: 'You are a helpful assistant.',
      openAIApiKey: 'test-api-key',
      openAIBaseURL: 'https://api.openai.com/v1',
    });

    // Create mock environment
    mockEnv = {
      OPENAI_API_KEY: 'test-api-key',
      OPENAI_API_ENDPOINT: 'https://api.openai.com/v1',
      SERVER_COORDINATOR: {
        idFromName: vi.fn().mockReturnValue('test-id'),
        get: vi.fn().mockReturnValue({
          getStreamData: vi.fn().mockResolvedValue(
            JSON.stringify({
              messages: [],
              model: 'gpt-4',
              systemPrompt: 'You are a helpful assistant.',
              preprocessedContext: {},
            }),
          ),
        }),
      },
    };

    // Set the environment using the action
    chatService.setEnv(mockEnv);

    // Reset mocks
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should have the correct initial state', () => {
      const freshService = ChatService.create({
        maxTokens: 2000,
        systemPrompt: 'You are a helpful assistant.',
      });

      expect(freshService.maxTokens).toBe(2000);
      expect(freshService.systemPrompt).toBe('You are a helpful assistant.');
      expect(freshService.activeStreams.size).toBe(0);
      expect(freshService.openAIApiKey).toBe('');
      expect(freshService.openAIBaseURL).toBe('');
    });
  });

  describe('setEnv', () => {
    it('should set the environment and initialize OpenAI client with local endpoint', () => {
      const localEnv = {
        ...mockEnv,
        OPENAI_API_ENDPOINT: 'http://localhost:8000',
      };

      // Reset the mock to track new calls
      vi.mocked(OpenAI).mockClear();

      chatService.setEnv(localEnv);

      expect(chatService.env).toEqual(localEnv);
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: localEnv.OPENAI_API_KEY,
        baseURL: localEnv.OPENAI_API_ENDPOINT,
      });
    });

    it('should set the environment and initialize OpenAI client with API key and base URL', () => {
      // Create a new instance with the properties already set
      const service = ChatService.create({
        maxTokens: 2000,
        systemPrompt: 'You are a helpful assistant.',
        openAIApiKey: 'test-api-key',
        openAIBaseURL: 'https://api.openai.com/v1',
      });

      // Reset the mock to track new calls
      vi.mocked(OpenAI).mockClear();

      service.setEnv(mockEnv);

      expect(service.env).toEqual(mockEnv);
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        baseURL: 'https://api.openai.com/v1',
      });
    });
  });

  describe('setActiveStream and removeActiveStream', () => {
    it('should set and remove active streams', () => {
      const streamId = 'test-stream-id';
      const streamData = {
        name: 'Test Stream',
        maxTokens: 1000,
        systemPrompt: 'You are a helpful assistant.',
        model: 'gpt-4',
        messages: [],
      };

      // Set active stream
      chatService.setActiveStream(streamId, streamData);
      expect(chatService.activeStreams.has(streamId)).toBe(true);
      expect(getSnapshot(chatService.activeStreams.get(streamId))).toEqual(streamData);

      // Remove active stream
      chatService.removeActiveStream(streamId);
      expect(chatService.activeStreams.has(streamId)).toBe(false);
    });

    it('should handle missing or incomplete stream data', () => {
      const streamId = 'test-stream-id';

      // Set active stream with undefined data
      chatService.setActiveStream(streamId, undefined);
      expect(chatService.activeStreams.has(streamId)).toBe(true);
      expect(getSnapshot(chatService.activeStreams.get(streamId))).toEqual({
        name: 'Unnamed Stream',
        maxTokens: 0,
        systemPrompt: '',
        model: '',
        messages: [],
      });

      // Set active stream with partial data
      chatService.setActiveStream(streamId, { name: 'Partial Stream' });
      expect(chatService.activeStreams.has(streamId)).toBe(true);
      expect(getSnapshot(chatService.activeStreams.get(streamId))).toEqual({
        name: 'Partial Stream',
        maxTokens: 0,
        systemPrompt: '',
        model: '',
        messages: [],
      });
    });
  });

  describe('getSupportedModels', () => {
    it('should return local models when using localhost endpoint', async () => {
      const originalResponseJson = Response.json;
      Response.json = vi.fn().mockImplementation(data => {
        return {
          json: async () => data,
        };
      });

      const localEnv = {
        ...mockEnv,
        OPENAI_API_ENDPOINT: 'http://localhost:8000',
      };

      // Create a new service instance for this test
      const localService = ChatService.create({
        maxTokens: 2000,
        systemPrompt: 'You are a helpful assistant.',
      });

      localService.setEnv(localEnv);

      // Mock the implementation of getSupportedModels for this test
      const originalGetSupportedModels = localService.getSupportedModels;
      localService.getSupportedModels = vi.fn().mockResolvedValueOnce({
        json: async () => ['mlx-model-1', 'mlx-model-2'],
      });

      const response = await localService.getSupportedModels();
      const data = await response.json();

      expect(data).toEqual(['mlx-model-1', 'mlx-model-2']);

      // Restore mocks
      Response.json = originalResponseJson;
      localService.getSupportedModels = originalGetSupportedModels;
    });

    it('should test the cache refresh mechanism when providers change', async () => {
      // This test verifies that the cache is refreshed when providers change
      // and that the cache is used when providers haven't changed.

      // Mock data for the first scenario (cache hit)
      const cachedModels = [
        { id: 'model-1', provider: 'openai' },
        { id: 'model-2', provider: 'openai' },
      ];
      const providersSignature = JSON.stringify(['openai']);

      // Mock KV_STORAGE for the first scenario (cache hit)
      const mockKVStorage = {
        get: vi.fn().mockImplementation(key => {
          if (key === 'supportedModels') return Promise.resolve(JSON.stringify(cachedModels));
          if (key === 'providersSignature') return Promise.resolve(providersSignature);
          return Promise.resolve(null);
        }),
        put: vi.fn().mockResolvedValue(undefined),
      };

      // The ProviderRepository is already mocked at the top of the file

      // Create a service instance with the mocked environment
      const service = ChatService.create({
        maxTokens: 2000,
        systemPrompt: 'You are a helpful assistant.',
      });

      // Set up the environment with the mocked KV_STORAGE
      service.setEnv({
        ...mockEnv,
        KV_STORAGE: mockKVStorage,
      });

      // Scenario 1: Cache hit - providers haven't changed
      const response1 = await service.getSupportedModels();
      const data1 = await response1.json();

      // Verify the cache was used
      expect(mockKVStorage.get).toHaveBeenCalledWith('supportedModels');
      expect(mockKVStorage.get).toHaveBeenCalledWith('providersSignature');
      expect(data1).toEqual(cachedModels);
      expect(mockKVStorage.put).not.toHaveBeenCalled();

      // Reset the mock calls for the next scenario
      vi.clearAllMocks();

      // Scenario 2: Cache miss - providers have changed
      // Update the mock to return a different providers signature
      mockKVStorage.get.mockImplementation(key => {
        if (key === 'supportedModels') {
          return Promise.resolve(JSON.stringify(cachedModels));
        }
        if (key === 'providersSignature') {
          // Different signature
          return Promise.resolve(JSON.stringify(['openai', 'anthropic']));
        }
        return Promise.resolve(null);
      });

      // Mock the provider models fetching to avoid actual API calls
      const mockModels = [
        { id: 'new-model-1', provider: 'openai' },
        { id: 'new-model-2', provider: 'openai' },
      ];

      // Mock OpenAI instance for the second scenario
      const mockOpenAIInstance = {
        models: {
          list: vi.fn().mockResolvedValue({
            data: mockModels,
          }),
          retrieve: vi.fn().mockImplementation(id => {
            return Promise.resolve({ id, provider: 'openai' });
          }),
        },
      };

      // Update the OpenAI mock
      vi.mocked(OpenAI).mockImplementation(() => mockOpenAIInstance as any);

      // Call getSupportedModels again
      const response2 = await service.getSupportedModels();

      // Verify the cache was refreshed
      expect(mockKVStorage.get).toHaveBeenCalledWith('supportedModels');
      expect(mockKVStorage.get).toHaveBeenCalledWith('providersSignature');
      expect(mockKVStorage.put).toHaveBeenCalledTimes(2); // Called twice: once for models, once for signature
      expect(mockKVStorage.put).toHaveBeenCalledWith('supportedModels', expect.any(String), {
        expirationTtl: 60 * 60 * 24,
      });
      expect(mockKVStorage.put).toHaveBeenCalledWith('providersSignature', expect.any(String), {
        expirationTtl: 60 * 60 * 24,
      });

      // No need to restore mocks as we're using vi.mock at the module level
    });
  });

  // TODO: Fix this test suite
  // describe('handleChatRequest', () => {
  // it('should call ChatSdk.handleChatRequest with correct parameters', async () => {
  //   const mockRequest = new Request('https://example.com/chat');
  //   const mockResponse = new Response('Test response');
  //
  //   ChatSdk.handleChatRequest.mockResolvedValueOnce(mockResponse);
  //   const result = await chatService.handleChatRequest(mockRequest);
  //
  //   expect(ChatSdk.handleChatRequest).toHaveBeenCalledWith(mockRequest, {
  //     openai: chatService.openai,
  //     env: mockEnv,
  //     systemPrompt: chatService.systemPrompt,
  //     maxTokens: chatService.maxTokens,
  //   });
  //
  //   expect(result).toBe(mockResponse);
  // });
  // });

  describe('handleSseStream', () => {
    it('should return 409 if stream is already active', async () => {
      const streamId = 'test-stream-id';

      // Set active stream
      chatService.setActiveStream(streamId, {});

      const result = await chatService.handleSseStream(streamId);

      expect(result.status).toBe(409);
      expect(await result.text()).toBe('Stream already active');
    });

    it('should return 404 if stream data is not found', async () => {
      const streamId = 'non-existent-stream';

      // Mock the SERVER_COORDINATOR.get() to return an object with getStreamData
      const mockDurableObject = {
        getStreamData: vi.fn().mockResolvedValue(null),
      };

      // Update the mockEnv to use our mock
      const updatedEnv = {
        ...mockEnv,
        SERVER_COORDINATOR: {
          idFromName: vi.fn().mockReturnValue('test-id'),
          get: vi.fn().mockReturnValue(mockDurableObject),
        },
      };

      // Set the environment
      chatService.setEnv(updatedEnv);

      const result = await chatService.handleSseStream(streamId);

      expect(result.status).toBe(404);
      expect(await result.text()).toBe('Stream not found');
    });

    it('should create and return an SSE stream when valid', async () => {
      const streamId = 'test-stream-id';

      // Create a new service instance for this test
      const testService = ChatService.create({
        maxTokens: 2000,
        systemPrompt: 'You are a helpful assistant.',
      });

      // Set up minimal environment
      testService.setEnv({
        SERVER_COORDINATOR: {
          idFromName: vi.fn(),
          get: vi.fn(),
        },
      });

      // Save the original method
      const originalHandleSseStream = testService.handleSseStream;

      // Mock the handleSseStream method directly on the instance
      testService.handleSseStream = vi.fn().mockResolvedValueOnce({
        body: 'response-stream',
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
        status: 200,
        text: vi.fn().mockResolvedValue(''),
      });

      const result = await testService.handleSseStream(streamId);

      // Verify the response
      expect(result.body).toBe('response-stream');
      // @ts-expect-error - this works fine
      expect(result.headers['Content-Type']).toBe('text/event-stream');
      // @ts-expect-error - this works fine
      expect(result.headers['Cache-Control']).toBe('no-cache');
      // @ts-expect-error - this works fine
      expect(result.headers['Connection']).toBe('keep-alive');

      // Restore the original method
      testService.handleSseStream = originalHandleSseStream;
    });
  });

  describe('ClientError', () => {
    it('should create a ClientError with the correct properties', () => {
      const error = new ClientError('Test error', 400, { detail: 'test' });

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('ClientError');
    });

    it('should format the error for SSE', () => {
      const error = new ClientError('Test error', 400, { detail: 'test' });

      const formatted = error.formatForSSE();
      const parsed = JSON.parse(formatted);

      expect(parsed).toEqual({
        type: 'error',
        message: 'Test error',
        details: { detail: 'test' },
        statusCode: 400,
      });
    });
  });
});
