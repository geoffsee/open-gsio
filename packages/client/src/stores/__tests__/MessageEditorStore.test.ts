import { getSnapshot } from 'mobx-state-tree';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Message from '../../models/Message';
import clientChatStore from '../ClientChatStore';
import messageEditorStore from '../MessageEditorStore';

// Mock the ClientChatStore
vi.mock('../ClientChatStore', () => {
  const mockStore = {
    items: [],
    add: vi.fn(),
    updateLast: vi.fn(),
    appendLast: vi.fn(),
    removeAfter: vi.fn(),
    editMessage: vi.fn().mockReturnValue(true),
    setIsLoading: vi.fn(),
    model: 'test-model',
  };

  return {
    default: mockStore,
  };
});

// Mock fetch globally
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    status: 200,
    json: () => Promise.resolve({ streamUrl: 'test-stream-url' }),
  }),
);

// Mock EventSource
class MockEventSource {
  onmessage: (event: any) => void;
  onerror: () => void;

  constructor(public url: string) {}

  close() {}
}

globalThis.EventSource = MockEventSource as any;

describe('MessageEditorStore', () => {
  const mockMessage = Message.create({
    id: 'test-id',
    content: 'Test message',
    role: 'user',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    messageEditorStore.onCancel(); // Reset the store

    // Set up the mock clientChatStore.items with our test message
    vi.mocked(clientChatStore.items).length = 0;
    vi.mocked(clientChatStore.items).push(mockMessage);
    vi.mocked(clientChatStore.items).find = vi
      .fn()
      .mockImplementation(predicate => (predicate(mockMessage) ? mockMessage : null));
  });

  it('should set message ID and edited content', () => {
    messageEditorStore.setMessage(mockMessage);

    expect(messageEditorStore.messageId).toBe('test-id');
    expect(messageEditorStore.editedContent).toBe('Test message');
  });

  it('should get message by ID', () => {
    messageEditorStore.setMessage(mockMessage);

    const retrievedMessage = messageEditorStore.getMessage();
    expect(retrievedMessage).toBe(mockMessage);
  });

  it('should handle save without duplicating messages in the state tree', async () => {
    // Set up the message to edit
    messageEditorStore.setMessage(mockMessage);
    messageEditorStore.setEditedContent('Updated message');

    // Call handleSave
    await messageEditorStore.handleSave();

    // Verify that clientChatStore.editMessage was called with the correct arguments
    expect(clientChatStore.editMessage).toHaveBeenCalledWith(mockMessage, 'Updated message');

    // Verify that clientChatStore.add was called to add the assistant message
    expect(clientChatStore.add).toHaveBeenCalledTimes(1);

    // Verify that the store was reset after save
    expect(messageEditorStore.messageId).toBe('');
    expect(messageEditorStore.editedContent).toBe('');
  });

  it('should handle errors during save', async () => {
    // Set up the message to edit
    messageEditorStore.setMessage(mockMessage);

    // Mock clientChatStore.editMessage to return false (message not found)
    vi.mocked(clientChatStore.editMessage).mockReturnValueOnce(false);

    // Call handleSave
    await messageEditorStore.handleSave();

    // Verify that the store was reset after save
    expect(messageEditorStore.messageId).toBe('');
    expect(messageEditorStore.editedContent).toBe('');

    // Verify that clientChatStore.add was not called
    expect(clientChatStore.add).not.toHaveBeenCalled();
  });

  it('should handle API errors during save', async () => {
    // Set up the message to edit
    messageEditorStore.setMessage(mockMessage);

    // Mock fetch to return an error
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 500,
      json: () => Promise.resolve({}),
    } as Response);

    // Call handleSave
    await messageEditorStore.handleSave();

    // Verify that clientChatStore.setIsLoading was called to reset loading state
    expect(clientChatStore.setIsLoading).toHaveBeenCalledWith(false);
  });
});
