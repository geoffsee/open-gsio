import { describe, it, expect, beforeEach } from 'vitest';

import { UIStore } from '../UIStore';

describe('UIStore', () => {
  let uiStore;

  beforeEach(() => {
    // Create a new instance of the store before each test
    uiStore = UIStore.create();
  });

  describe('Initial state', () => {
    it('should have input set to empty string initially', () => {
      expect(uiStore.input).toBe('');
    });

    it('should have isLoading set to false initially', () => {
      expect(uiStore.isLoading).toBe(false);
    });
  });

  describe('setInput', () => {
    it('should update the input value', () => {
      uiStore.setInput('Hello, world!');
      expect(uiStore.input).toBe('Hello, world!');
    });

    it('should handle empty string', () => {
      // First set to non-empty
      uiStore.setInput('Hello');
      expect(uiStore.input).toBe('Hello');

      // Then set to empty
      uiStore.setInput('');
      expect(uiStore.input).toBe('');
    });
  });

  describe('setIsLoading', () => {
    it('should update the isLoading value to true', () => {
      uiStore.setIsLoading(true);
      expect(uiStore.isLoading).toBe(true);
    });

    it('should update the isLoading value to false', () => {
      // First set to true
      uiStore.setIsLoading(true);
      expect(uiStore.isLoading).toBe(true);

      // Then set to false
      uiStore.setIsLoading(false);
      expect(uiStore.isLoading).toBe(false);
    });
  });
});
