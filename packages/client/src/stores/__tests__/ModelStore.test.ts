import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { ModelStore } from '../ModelStore';

describe('ModelStore', () => {
  let modelStore;

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    // Create a new instance of the store before each test
    modelStore = ModelStore.create();

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

  describe('Initial state', () => {
    it('should have default model set initially', () => {
      expect(modelStore.model).toBe('meta-llama/llama-4-scout-17b-16e-instruct');
    });

    it('should have default image model set initially', () => {
      expect(modelStore.imageModel).toBe('black-forest-labs/flux-1.1-pro');
    });

    it('should have empty supportedModels array initially', () => {
      expect(modelStore.supportedModels).toEqual([]);
    });
  });

  describe('setModel', () => {
    it('should update the model value', () => {
      modelStore.setModel('new-model');
      expect(modelStore.model).toBe('new-model');
    });

    it('should save the model to localStorage', () => {
      modelStore.setModel('new-model');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('recentModel', 'new-model');
    });

    it('should handle localStorage errors gracefully', () => {
      // Make localStorage.setItem throw an error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // This should not throw an error
      expect(() => modelStore.setModel('new-model')).not.toThrow();
      expect(modelStore.model).toBe('new-model');
    });
  });

  describe('setImageModel', () => {
    it('should update the imageModel value', () => {
      modelStore.setImageModel('new-image-model');
      expect(modelStore.imageModel).toBe('new-image-model');
    });
  });

  describe('setSupportedModels', () => {
    it('should update the supportedModels array', () => {
      const models = ['model1', 'model2', 'model3'];
      modelStore.setSupportedModels(models);
      expect(modelStore.supportedModels).toEqual(models);
    });

    it('should not change the current model if it is in the supported models list', () => {
      // First set a model
      modelStore.setModel('model2');

      // Then set supported models including the current model
      const models = ['model1', 'model2', 'model3'];
      modelStore.setSupportedModels(models);

      // The model should remain the same
      expect(modelStore.model).toBe('model2');
    });

    it('should change the current model if it is not in the supported models list', () => {
      // First set a model
      modelStore.setModel('unsupported-model');

      // Then set supported models not including the current model
      const models = ['model1', 'model2', 'model3'];
      modelStore.setSupportedModels(models);

      // The model should be changed to the last model in the list
      expect(modelStore.model).toBe('model3');
    });

    it('should handle empty supported models list', () => {
      // First set a model
      modelStore.setModel('current-model');

      // Then set empty supported models
      modelStore.setSupportedModels([]);

      // The model should remain the same since there's no alternative
      expect(modelStore.model).toBe('current-model');
    });
  });
});
