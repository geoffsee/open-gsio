import { OpenAI } from 'openai';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  BaseChatProvider,
  CommonProviderParams,
  ChatStreamProvider,
} from '../chat-stream-provider.ts';

// Create a concrete implementation of BaseChatProvider for testing
class TestChatProvider extends BaseChatProvider {
  getOpenAIClient(param: CommonProviderParams): OpenAI {
    return param.openai as OpenAI;
  }

  getStreamParams(param: CommonProviderParams, safeMessages: any[]): any {
    return {
      model: param.model,
      messages: safeMessages,
      stream: true,
      max_tokens: param.maxTokens as number,
    };
  }

  async processChunk(chunk: any, dataCallback: (data: any) => void): Promise<boolean> {
    dataCallback({ type: 'chat', data: chunk });
    return false;
  }
}

// Mock dependencies
vi.mock('../../chat-sdk/chat-sdk.ts', () => ({
  default: {
    buildAssistantPrompt: vi.fn().mockReturnValue('Assistant prompt'),
    buildMessageChain: vi.fn().mockReturnValue([
      { role: 'system', content: 'System prompt' },
      { role: 'user', content: 'User message' },
    ]),
  },
}));

vi.mock('../../tools/agentic-rag.ts', () => ({
  agenticRAG: vi.fn(),
  AgenticRAGTools: {
    type: 'function',
    function: {
      name: 'agentic_rag',
      description: 'Test agentic RAG tool',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['search_knowledge'] },
          query: { type: 'string' },
          collection_name: { type: 'string' },
        },
        required: ['action', 'collection_name'],
      },
    },
  },
}));

describe('ChatStreamProvider', () => {
  it('should define the required interface', () => {
    // Verify the interface has the required method
    const mockProvider: ChatStreamProvider = {
      handleStream: vi.fn(),
    };

    expect(mockProvider.handleStream).toBeDefined();
  });
});

describe('BaseChatProvider - Model Tool Calling', () => {
  let provider: TestChatProvider;
  let mockOpenAI: any;
  let dataCallback: any;
  let commonParams: CommonProviderParams;

  beforeEach(() => {
    vi.clearAllMocks();

    provider = new TestChatProvider();
    dataCallback = vi.fn();

    mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    };

    commonParams = {
      openai: mockOpenAI,
      systemPrompt: 'Test system prompt',
      preprocessedContext: {},
      maxTokens: 1000,
      messages: [{ role: 'user', content: 'Test message' }],
      model: 'gpt-4',
      env: {} as any,
    };
  });

  it('should implement the ChatStreamProvider interface', () => {
    expect(provider.handleStream).toBeInstanceOf(Function);
    expect(provider.getOpenAIClient).toBeInstanceOf(Function);
    expect(provider.getStreamParams).toBeInstanceOf(Function);
    expect(provider.processChunk).toBeInstanceOf(Function);
  });

  it('should handle regular text streaming without tool calls', async () => {
    // Mock stream chunks for regular text response
    const chunks = [
      {
        choices: [
          {
            delta: { content: 'Hello ' },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: { content: 'world!' },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'stop',
          },
        ],
      },
    ];

    mockOpenAI.chat.completions.create.mockResolvedValue({
      async *[Symbol.asyncIterator]() {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
    });

    await provider.handleStream(commonParams, dataCallback);

    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.arrayContaining([
          expect.objectContaining({
            type: 'function',
            function: expect.objectContaining({
              name: 'agentic_rag',
            }),
          }),
        ]),
      }),
    );
  });

  it('should handle tool calls in streaming response', async () => {
    const { agenticRAG } = await import('../../tools/agentic-rag.ts');
    vi.mocked(agenticRAG).mockResolvedValue({
      success: true,
      data: {
        results: ['Test result'],
        analysis: { needsRetrieval: false },
      },
    });

    // Mock stream chunks for tool call response
    const chunks = [
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'agentic_rag',
                    arguments:
                      '{"action": "search_knowledge", "query": "test query", "collection_name": "test_collection"}',
                  },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'tool_calls',
          },
        ],
      },
    ];

    // Second stream for response after tool execution
    const secondStreamChunks = [
      {
        choices: [
          {
            delta: { content: 'Based on the search results: Test result' },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'stop',
          },
        ],
      },
    ];

    let callCount = 0;
    mockOpenAI.chat.completions.create.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          async *[Symbol.asyncIterator]() {
            for (const chunk of chunks) {
              yield chunk;
            }
          },
        });
      } else {
        return Promise.resolve({
          async *[Symbol.asyncIterator]() {
            for (const chunk of secondStreamChunks) {
              yield chunk;
            }
          },
        });
      }
    });

    await provider.handleStream(commonParams, dataCallback);

    // Verify tool was called
    expect(agenticRAG).toHaveBeenCalledWith({
      action: 'search_knowledge',
      query: 'test query',
      collection_name: 'test_collection',
    });

    // Verify feedback messages were sent
    expect(dataCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'chat',
        data: expect.objectContaining({
          choices: expect.arrayContaining([
            expect.objectContaining({
              delta: expect.objectContaining({
                content: expect.stringContaining('🔧 Invoking'),
              }),
            }),
          ]),
        }),
      }),
    );

    expect(dataCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'chat',
        data: expect.objectContaining({
          choices: expect.arrayContaining([
            expect.objectContaining({
              delta: expect.objectContaining({
                content: expect.stringContaining('📞 Calling agentic_rag'),
              }),
            }),
          ]),
        }),
      }),
    );
  });

  it('should handle tool call streaming with incremental arguments', async () => {
    const { agenticRAG } = await import('../../tools/agentic-rag.ts');
    vi.mocked(agenticRAG).mockResolvedValue({
      success: true,
      data: { results: ['Test result'] },
    });

    // Mock stream chunks with incremental tool call arguments
    const chunks = [
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_',
                  type: 'function',
                  function: { name: 'agentic_rag', arguments: '{"action": "search_' },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: '123',
                  function: { arguments: 'knowledge", "query": "test", ' },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  function: { arguments: '"collection_name": "test_collection"}' },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'tool_calls',
          },
        ],
      },
    ];

    const secondStreamChunks = [
      {
        choices: [
          {
            delta: { content: 'Response after tool call' },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'stop',
          },
        ],
      },
    ];

    let callCount = 0;
    mockOpenAI.chat.completions.create.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          async *[Symbol.asyncIterator]() {
            for (const chunk of chunks) {
              yield chunk;
            }
          },
        });
      } else {
        return Promise.resolve({
          async *[Symbol.asyncIterator]() {
            for (const chunk of secondStreamChunks) {
              yield chunk;
            }
          },
        });
      }
    });

    await provider.handleStream(commonParams, dataCallback);

    // Verify the complete tool call was assembled and executed
    expect(agenticRAG).toHaveBeenCalledWith({
      action: 'search_knowledge',
      query: 'test',
      collection_name: 'test_collection',
    });
  });

  it('should prevent infinite tool call loops', async () => {
    const { agenticRAG } = await import('../../tools/agentic-rag.ts');
    vi.mocked(agenticRAG).mockResolvedValue({
      success: true,
      data: {
        results: [],
        analysis: { needsRetrieval: true },
        retrieved_documents: [],
      },
    });

    // Mock stream that always returns tool calls
    const toolCallChunks = [
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'agentic_rag',
                    arguments:
                      '{"action": "search_knowledge", "query": "test", "collection_name": "test_collection"}',
                  },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'tool_calls',
          },
        ],
      },
    ];

    mockOpenAI.chat.completions.create.mockResolvedValue({
      async *[Symbol.asyncIterator]() {
        for (const chunk of toolCallChunks) {
          yield chunk;
        }
      },
    });

    await provider.handleStream(commonParams, dataCallback);

    // Should detect duplicate tool calls and force completion (up to 5 iterations based on maxToolCallIterations)
    // In this case, it should stop after 2 calls due to duplicate detection, but could go up to 5
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  it('should handle tool call errors gracefully', async () => {
    const { agenticRAG } = await import('../../tools/agentic-rag.ts');
    vi.mocked(agenticRAG).mockRejectedValue(new Error('Tool execution failed'));

    const chunks = [
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'agentic_rag',
                    arguments:
                      '{"action": "search_knowledge", "query": "test", "collection_name": "test_collection"}',
                  },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'tool_calls',
          },
        ],
      },
    ];

    const secondStreamChunks = [
      {
        choices: [
          {
            delta: { content: 'I apologize, but I encountered an error.' },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'stop',
          },
        ],
      },
    ];

    let callCount = 0;
    mockOpenAI.chat.completions.create.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          async *[Symbol.asyncIterator]() {
            for (const chunk of chunks) {
              yield chunk;
            }
          },
        });
      } else {
        return Promise.resolve({
          async *[Symbol.asyncIterator]() {
            for (const chunk of secondStreamChunks) {
              yield chunk;
            }
          },
        });
      }
    });

    await provider.handleStream(commonParams, dataCallback);

    // Should still complete without throwing
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  it('should prevent duplicate tool calls', async () => {
    const { agenticRAG } = await import('../../tools/agentic-rag.ts');
    vi.mocked(agenticRAG).mockResolvedValue({
      success: true,
      data: { results: ['Test result'] },
    });

    // Mock the same tool call twice
    const chunks = [
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'agentic_rag',
                    arguments:
                      '{"action": "search_knowledge", "query": "test", "collection_name": "test_collection"}',
                  },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'tool_calls',
          },
        ],
      },
    ];

    // Second iteration with same tool call
    let callCount = 0;
    mockOpenAI.chat.completions.create.mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        async *[Symbol.asyncIterator]() {
          for (const chunk of chunks) {
            yield chunk;
          }
        },
      });
    });

    await provider.handleStream(commonParams, dataCallback);

    // Should only execute the tool once, then force completion
    expect(agenticRAG).toHaveBeenCalledTimes(1);
  });

  it('should handle invalid JSON in tool call arguments', async () => {
    const chunks = [
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'agentic_rag',
                    arguments: '{"action": "search_knowledge", "invalid": json}', // Invalid JSON
                  },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'tool_calls',
          },
        ],
      },
    ];

    const secondStreamChunks = [
      {
        choices: [
          {
            delta: { content: 'I encountered an error parsing the tool arguments.' },
            finish_reason: null,
          },
        ],
      },
      {
        choices: [
          {
            delta: {},
            finish_reason: 'stop',
          },
        ],
      },
    ];

    let callCount = 0;
    mockOpenAI.chat.completions.create.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          async *[Symbol.asyncIterator]() {
            for (const chunk of chunks) {
              yield chunk;
            }
          },
        });
      } else {
        return Promise.resolve({
          async *[Symbol.asyncIterator]() {
            for (const chunk of secondStreamChunks) {
              yield chunk;
            }
          },
        });
      }
    });

    // Should not throw, should handle gracefully
    await expect(provider.handleStream(commonParams, dataCallback)).resolves.not.toThrow();
  });
});
