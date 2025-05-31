import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ClientChatStore } from '../ClientChatStore';
import Message from '../../models/Message';
import { getSnapshot } from 'mobx-state-tree';

describe('ClientChatStore', () => {
  let clientChatStore;
  
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  };
  
  beforeEach(() => {
    // Create a new instance of the store before each test
    clientChatStore = ClientChatStore.create();
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore all mocks
    vi.restoreAllMocks();
  });
  
  describe('Composition', () => {
    it('should be composed of MessagesStore, UIStore, ModelStore, and StreamStore', () => {
      // Test that the store has properties and methods from all composed stores
      
      // MessagesStore properties and methods
      expect(clientChatStore.items).toBeDefined();
      expect(typeof clientChatStore.add).toBe('function');
      expect(typeof clientChatStore.updateLast).toBe('function');
      expect(typeof clientChatStore.appendLast).toBe('function');
      expect(typeof clientChatStore.removeAfter).toBe('function');
      expect(typeof clientChatStore.reset).toBe('function');
      
      // UIStore properties and methods
      expect(clientChatStore.isLoading).toBeDefined();
      expect(typeof clientChatStore.setIsLoading).toBe('function');
      
      // ModelStore properties and methods
      expect(clientChatStore.model).toBeDefined();
      expect(clientChatStore.imageModel).toBeDefined();
      expect(clientChatStore.supportedModels).toBeDefined();
      expect(typeof clientChatStore.setModel).toBe('function');
      expect(typeof clientChatStore.setImageModel).toBe('function');
      expect(typeof clientChatStore.setSupportedModels).toBe('function');
      
      // StreamStore properties and methods
      expect(clientChatStore.streamId).toBeDefined();
      expect(typeof clientChatStore.setStreamId).toBe('function');
    });
  });
  
  describe('MessagesStore functionality', () => {
    it('should add a message to the items array', () => {
      // Create a message
      const message = Message.create({
        content: 'Hello, world!',
        role: 'user',
      });
      
      // Add the message to the store
      clientChatStore.add(message);
      
      // Check that the message was added
      expect(clientChatStore.items.length).toBe(1);
      expect(clientChatStore.items[0].content).toBe('Hello, world!');
      expect(clientChatStore.items[0].role).toBe('user');
    });
    
    it('should update the content of the last message', () => {
      // Add a message
      const message = Message.create({
        content: 'Hello',
        role: 'user',
      });
      clientChatStore.add(message);
      
      // Update the last message
      clientChatStore.updateLast('Updated content');
      
      // Check that the message was updated
      expect(clientChatStore.items[0].content).toBe('Updated content');
    });
    
    it('should reset the messages', () => {
      // Add messages
      const message1 = Message.create({
        content: 'Message 1',
        role: 'user',
      });
      
      const message2 = Message.create({
        content: 'Message 2',
        role: 'assistant',
      });
      
      clientChatStore.add(message1);
      clientChatStore.add(message2);
      
      // Reset the store
      clientChatStore.reset();
      
      // Check that all messages were removed
      expect(clientChatStore.items.length).toBe(0);
    });
  });
  
  describe('UIStore functionality', () => {
    it('should update isLoading state', () => {
      // Check initial state
      expect(clientChatStore.isLoading).toBe(false);
      
      // Update isLoading
      clientChatStore.setIsLoading(true);
      
      // Check that isLoading was updated
      expect(clientChatStore.isLoading).toBe(true);
    });
  });
  
  describe('ModelStore functionality', () => {
    it('should update the model value', () => {
      clientChatStore.setModel('new-model');
      expect(clientChatStore.model).toBe('new-model');
    });
    
    it('should update the imageModel value', () => {
      clientChatStore.setImageModel('new-image-model');
      expect(clientChatStore.imageModel).toBe('new-image-model');
    });
    
    it('should update the supportedModels array', () => {
      const models = ['model1', 'model2', 'model3'];
      clientChatStore.setSupportedModels(models);
      expect(clientChatStore.supportedModels).toEqual(models);
    });
  });
  
  describe('StreamStore functionality', () => {
    it('should update the streamId value', () => {
      clientChatStore.setStreamId('new-stream-id');
      expect(clientChatStore.streamId).toBe('new-stream-id');
    });
  });
  
  describe('Integration', () => {
    it('should handle a complete chat flow', () => {
      // Set loading state
      clientChatStore.setIsLoading(true);
      expect(clientChatStore.isLoading).toBe(true);
      
      // Add a user message
      const userMessage = Message.create({
        content: 'Hello, AI!',
        role: 'user',
      });
      clientChatStore.add(userMessage);
      
      // Set model
      clientChatStore.setModel('test-model');
      
      // Set stream ID
      clientChatStore.setStreamId('test-stream-id');
      
      // Add an assistant message
      const assistantMessage = Message.create({
        content: '',
        role: 'assistant',
      });
      clientChatStore.add(assistantMessage);
      
      // Append to the assistant message as if streaming
      clientChatStore.appendLast('Hello');
      clientChatStore.appendLast(', ');
      clientChatStore.appendLast('human!');
      
      // Set loading state to false
      clientChatStore.setIsLoading(false);
      
      // Verify the final state
      expect(clientChatStore.isLoading).toBe(false);
      expect(clientChatStore.items.length).toBe(2);
      expect(clientChatStore.items[0].content).toBe('Hello, AI!');
      expect(clientChatStore.items[0].role).toBe('user');
      expect(clientChatStore.items[1].content).toBe('Hello, human!');
      expect(clientChatStore.items[1].role).toBe('assistant');
      expect(clientChatStore.model).toBe('test-model');
      expect(clientChatStore.streamId).toBe('test-stream-id');
    });
  });
});