import { describe, it, expect, vi } from 'vitest';
import { BaseChatProvider, CommonProviderParams, ChatStreamProvider } from '../chat-stream-provider';
import { OpenAI } from 'openai';

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
vi.mock('../../lib/chat-sdk', () => ({
  default: {
    buildAssistantPrompt: vi.fn().mockReturnValue('Assistant prompt'),
    buildMessageChain: vi.fn().mockReturnValue([
      { role: 'system', content: 'System prompt' },
      { role: 'user', content: 'User message' }
    ])
  }
}));

describe('ChatStreamProvider', () => {
  it('should define the required interface', () => {
    // Verify the interface has the required method
    const mockProvider: ChatStreamProvider = {
      handleStream: vi.fn()
    };

    expect(mockProvider.handleStream).toBeDefined();
  });
});

describe('BaseChatProvider', () => {
  it('should implement the ChatStreamProvider interface', () => {
    // Create a concrete implementation
    const provider = new TestChatProvider();

    // Verify it implements the interface
    expect(provider.handleStream).toBeInstanceOf(Function);
    expect(provider.getOpenAIClient).toBeInstanceOf(Function);
    expect(provider.getStreamParams).toBeInstanceOf(Function);
    expect(provider.processChunk).toBeInstanceOf(Function);
  });

  it('should have abstract methods that need to be implemented', () => {
    // This test verifies that the abstract methods exist
    // We can't instantiate BaseChatProvider directly, so we use the concrete implementation
    const provider = new TestChatProvider();

    // Verify the abstract methods are implemented
    expect(provider.getOpenAIClient).toBeDefined();
    expect(provider.getStreamParams).toBeDefined();
    expect(provider.processChunk).toBeDefined();
  });
});
