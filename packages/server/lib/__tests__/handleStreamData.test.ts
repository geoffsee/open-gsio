import { describe, it, expect, vi } from 'vitest';
import handleStreamData from '../handleStreamData.ts';

describe('handleStreamData', () => {
  // Setup mocks
  const mockController = {
    enqueue: vi.fn()
  };
  const mockEncoder = {
    encode: vi.fn((str) => str)
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return early if data type is not "chat"', () => {
    const handler = handleStreamData(mockController as any, mockEncoder as any);
    
    handler({ type: 'not-chat', data: {} });
    
    expect(mockController.enqueue).not.toHaveBeenCalled();
    expect(mockEncoder.encode).not.toHaveBeenCalled();
  });

  it('should return early if data is undefined', () => {
    const handler = handleStreamData(mockController as any, mockEncoder as any);
    
    handler(undefined as any);
    
    expect(mockController.enqueue).not.toHaveBeenCalled();
    expect(mockEncoder.encode).not.toHaveBeenCalled();
  });

  it('should handle content_block_start type data', () => {
    const handler = handleStreamData(mockController as any, mockEncoder as any);
    
    const data = {
      type: 'chat',
      data: {
        type: 'content_block_start',
        content_block: {
          type: 'text',
          text: 'Hello world'
        }
      }
    };
    
    handler(data);
    
    expect(mockController.enqueue).toHaveBeenCalledTimes(1);
    expect(mockEncoder.encode).toHaveBeenCalledWith(expect.stringContaining('Hello world'));
    
    const encodedData = mockEncoder.encode.mock.calls[0][0];
    const parsedData = JSON.parse(encodedData.split('data: ')[1]);
    
    expect(parsedData.type).toBe('chat');
    expect(parsedData.data.choices[0].delta.content).toBe('Hello world');
  });

  it('should handle delta.text type data', () => {
    const handler = handleStreamData(mockController as any, mockEncoder as any);
    
    const data = {
      type: 'chat',
      data: {
        delta: {
          text: 'Hello world'
        }
      }
    };
    
    handler(data);
    
    expect(mockController.enqueue).toHaveBeenCalledTimes(1);
    expect(mockEncoder.encode).toHaveBeenCalledWith(expect.stringContaining('Hello world'));
    
    const encodedData = mockEncoder.encode.mock.calls[0][0];
    const parsedData = JSON.parse(encodedData.split('data: ')[1]);
    
    expect(parsedData.type).toBe('chat');
    expect(parsedData.data.choices[0].delta.content).toBe('Hello world');
  });

  it('should handle choices[0].delta.content type data', () => {
    const handler = handleStreamData(mockController as any, mockEncoder as any);
    
    const data = {
      type: 'chat',
      data: {
        choices: [
          {
            index: 0,
            delta: {
              content: 'Hello world'
            },
            logprobs: null,
            finish_reason: null
          }
        ]
      }
    };
    
    handler(data);
    
    expect(mockController.enqueue).toHaveBeenCalledTimes(1);
    expect(mockEncoder.encode).toHaveBeenCalledWith(expect.stringContaining('Hello world'));
    
    const encodedData = mockEncoder.encode.mock.calls[0][0];
    const parsedData = JSON.parse(encodedData.split('data: ')[1]);
    
    expect(parsedData.type).toBe('chat');
    expect(parsedData.data.choices[0].delta.content).toBe('Hello world');
    expect(parsedData.data.choices[0].finish_reason).toBe(null);
  });

  it('should pass through data with choices but no delta.content', () => {
    const handler = handleStreamData(mockController as any, mockEncoder as any);
    
    const data = {
      type: 'chat',
      data: {
        choices: [
          {
            index: 0,
            delta: {},
            logprobs: null,
            finish_reason: 'stop'
          }
        ]
      }
    };
    
    handler(data);
    
    expect(mockController.enqueue).toHaveBeenCalledTimes(1);
    expect(mockEncoder.encode).toHaveBeenCalledWith(expect.stringContaining('"finish_reason":"stop"'));
  });

  it('should return early for unrecognized data format', () => {
    const handler = handleStreamData(mockController as any, mockEncoder as any);
    
    const data = {
      type: 'chat',
      data: {
        // No recognized properties
        unrecognized: 'property'
      }
    };
    
    handler(data);
    
    expect(mockController.enqueue).not.toHaveBeenCalled();
    expect(mockEncoder.encode).not.toHaveBeenCalled();
  });

  it('should use custom transform function if provided', () => {
    const handler = handleStreamData(mockController as any, mockEncoder as any);
    
    const data = {
      type: 'chat',
      data: {
        original: 'data'
      }
    };
    
    const transformFn = vi.fn().mockReturnValue({
      type: 'chat',
      data: {
        choices: [
          {
            delta: {
              content: 'Transformed content'
            },
            logprobs: null,
            finish_reason: null
          }
        ]
      }
    });
    
    handler(data, transformFn);
    
    expect(transformFn).toHaveBeenCalledWith(data);
    expect(mockController.enqueue).toHaveBeenCalledTimes(1);
    expect(mockEncoder.encode).toHaveBeenCalledWith(expect.stringContaining('Transformed content'));
  });
});