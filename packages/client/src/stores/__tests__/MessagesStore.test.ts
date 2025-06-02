import { describe, it, expect, beforeEach } from 'vitest';
import { MessagesStore } from '../MessagesStore';
import Message from '../../models/Message';
import { getSnapshot } from 'mobx-state-tree';

describe('MessagesStore', () => {
  let messagesStore;
  
  beforeEach(() => {
    // Create a new instance of the store before each test
    messagesStore = MessagesStore.create();
  });
  
  describe('Initial state', () => {
    it('should have empty items array initially', () => {
      expect(messagesStore.items).toEqual([]);
    });
  });
  
  describe('add', () => {
    it('should add a message to the items array', () => {
      // Create a message
      const message = Message.create({
        content: 'Hello, world!',
        role: 'user',
      });
      
      // Add the message to the store
      messagesStore.add(message);
      
      // Check that the message was added
      expect(messagesStore.items.length).toBe(1);
      expect(messagesStore.items[0].content).toBe('Hello, world!');
      expect(messagesStore.items[0].role).toBe('user');
    });
    
    it('should add multiple messages to the items array', () => {
      // Create messages
      const message1 = Message.create({
        content: 'Hello',
        role: 'user',
      });
      
      const message2 = Message.create({
        content: 'Hi there',
        role: 'assistant',
      });
      
      // Add the messages to the store
      messagesStore.add(message1);
      messagesStore.add(message2);
      
      // Check that the messages were added
      expect(messagesStore.items.length).toBe(2);
      expect(messagesStore.items[0].content).toBe('Hello');
      expect(messagesStore.items[0].role).toBe('user');
      expect(messagesStore.items[1].content).toBe('Hi there');
      expect(messagesStore.items[1].role).toBe('assistant');
    });
  });
  
  describe('updateLast', () => {
    it('should update the content of the last message', () => {
      // Add a message
      const message = Message.create({
        content: 'Hello',
        role: 'user',
      });
      messagesStore.add(message);
      
      // Update the last message
      messagesStore.updateLast('Updated content');
      
      // Check that the message was updated
      expect(messagesStore.items[0].content).toBe('Updated content');
    });
    
    it('should do nothing if there are no messages', () => {
      // Try to update the last message when there are no messages
      messagesStore.updateLast('Updated content');
      
      // Check that nothing happened
      expect(messagesStore.items.length).toBe(0);
    });
  });
  
  describe('appendLast', () => {
    it('should append content to the last message', () => {
      // Add a message
      const message = Message.create({
        content: 'Hello',
        role: 'user',
      });
      messagesStore.add(message);
      
      // Append to the last message
      messagesStore.appendLast(', world!');
      
      // Check that the message was updated
      expect(messagesStore.items[0].content).toBe('Hello, world!');
    });
    
    it('should do nothing if there are no messages', () => {
      // Try to append to the last message when there are no messages
      messagesStore.appendLast(', world!');
      
      // Check that nothing happened
      expect(messagesStore.items.length).toBe(0);
    });
  });
  
  describe('removeAfter', () => {
    it('should remove all messages after the specified index', () => {
      // Add messages
      const message1 = Message.create({
        content: 'Message 1',
        role: 'user',
      });
      
      const message2 = Message.create({
        content: 'Message 2',
        role: 'assistant',
      });
      
      const message3 = Message.create({
        content: 'Message 3',
        role: 'user',
      });
      
      messagesStore.add(message1);
      messagesStore.add(message2);
      messagesStore.add(message3);
      
      // Remove messages after index 0
      messagesStore.removeAfter(0);
      
      // Check that messages were removed
      expect(messagesStore.items.length).toBe(1);
      expect(messagesStore.items[0].content).toBe('Message 1');
    });
    
    it('should do nothing if index is out of bounds (negative)', () => {
      // Add messages
      const message1 = Message.create({
        content: 'Message 1',
        role: 'user',
      });
      
      const message2 = Message.create({
        content: 'Message 2',
        role: 'assistant',
      });
      
      messagesStore.add(message1);
      messagesStore.add(message2);
      
      // Try to remove messages with negative index
      messagesStore.removeAfter(-1);
      
      // Check that nothing happened
      expect(messagesStore.items.length).toBe(2);
    });
    
    it('should do nothing if index is out of bounds (too large)', () => {
      // Add messages
      const message1 = Message.create({
        content: 'Message 1',
        role: 'user',
      });
      
      const message2 = Message.create({
        content: 'Message 2',
        role: 'assistant',
      });
      
      messagesStore.add(message1);
      messagesStore.add(message2);
      
      // Try to remove messages with index that's too large
      messagesStore.removeAfter(2);
      
      // Check that nothing happened
      expect(messagesStore.items.length).toBe(2);
    });
  });
  
  describe('reset', () => {
    it('should remove all messages', () => {
      // Add messages
      const message1 = Message.create({
        content: 'Message 1',
        role: 'user',
      });
      
      const message2 = Message.create({
        content: 'Message 2',
        role: 'assistant',
      });
      
      messagesStore.add(message1);
      messagesStore.add(message2);
      
      // Reset the store
      messagesStore.reset();
      
      // Check that all messages were removed
      expect(messagesStore.items.length).toBe(0);
    });
    
    it('should do nothing if there are no messages', () => {
      // Reset the store when there are no messages
      messagesStore.reset();
      
      // Check that nothing happened
      expect(messagesStore.items.length).toBe(0);
    });
  });
});