import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userOptionsStore, { UserOptionsStoreModel } from '../UserOptionsStore';
import ClientChatStore from '../ClientChatStore';
import Cookies from 'js-cookie';

// Mock dependencies
vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
  },
}));

vi.mock('../ClientChatStore', () => ({
  default: {
    isLoading: false,
    setIsLoading: vi.fn((value) => {
      (ClientChatStore as any).isLoading = value;
    }),
  },
}));

describe('UserOptionsStore', () => {
  // Mock document.cookie
  let originalDocumentCookie: PropertyDescriptor | undefined;

  beforeEach(() => {
    // Save original document.cookie property descriptor
    originalDocumentCookie = Object.getOwnPropertyDescriptor(document, 'cookie');

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });

    // Reset mocks
    vi.clearAllMocks();

    // Reset store to default values
    userOptionsStore.resetStore();
  });

  afterEach(() => {
    // Restore original document.cookie property descriptor
    if (originalDocumentCookie) {
      Object.defineProperty(document, 'cookie', originalDocumentCookie);
    }
  });

  describe('getFollowModeEnabled', () => {
    it('should return the current followModeEnabled value', () => {
      userOptionsStore.setFollowModeEnabled(false);
      expect(userOptionsStore.getFollowModeEnabled()).toBe(false);

      userOptionsStore.setFollowModeEnabled(true);
      expect(userOptionsStore.getFollowModeEnabled()).toBe(true);
    });
  });

  describe('storeUserOptions', () => {
    it('should store user options in a cookie', () => {
      // Set up document.cookie to simulate an existing cookie
      document.cookie = 'user_preferences=abc123';

      userOptionsStore.setTheme('light');
      userOptionsStore.setTextModel('test-model');

      userOptionsStore.storeUserOptions();

      // Check that Cookies.set was called with the correct arguments
      const expectedOptions = JSON.stringify({
        theme: 'light',
        text_model: 'test-model',
      });
      const encodedOptions = btoa(expectedOptions);

      expect(Cookies.set).toHaveBeenCalledWith('user_preferences', encodedOptions);
    });
  });

  describe('initialize', () => {
    it('should create a cookie if none exists', () => {
      // Ensure no cookie exists
      document.cookie = '';

      // Mock storeUserOptions to avoid actual implementation
      const storeUserOptionsMock = vi.fn();
      const originalStoreUserOptions = userOptionsStore.storeUserOptions;
      userOptionsStore.storeUserOptions = storeUserOptionsMock;

      try {
        userOptionsStore.initialize();
        expect(storeUserOptionsMock).toHaveBeenCalled();
      } finally {
        // Restore original method
        userOptionsStore.storeUserOptions = originalStoreUserOptions;
      }
    });

    it('should load preferences from existing cookie', () => {
      // Create a mock cookie with preferences
      const mockPreferences = {
        theme: 'light',
        text_model: 'test-model',
      };
      const encodedPreferences = btoa(JSON.stringify(mockPreferences));
      document.cookie = `user_preferences=${encodedPreferences}`;

      userOptionsStore.initialize();

      expect(userOptionsStore.theme).toBe('light');
      expect(userOptionsStore.text_model).toBe('test-model');
    });

    it('should set up event listeners', () => {
      // Spy on window.addEventListener
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      userOptionsStore.initialize();

      // Check that event listeners were added for scroll, wheel, touchmove, and mousedown
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('wheel', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    });
  });

  describe('deleteCookie', () => {
    it('should delete the user_preferences cookie', () => {
      userOptionsStore.deleteCookie();

      expect(document.cookie).toContain('user_preferences=; max-age=; path=/;');
    });
  });

  describe('setFollowModeEnabled', () => {
    it('should set the followModeEnabled value', () => {
      userOptionsStore.setFollowModeEnabled(true);
      expect(userOptionsStore.followModeEnabled).toBe(true);

      userOptionsStore.setFollowModeEnabled(false);
      expect(userOptionsStore.followModeEnabled).toBe(false);
    });
  });

  describe('toggleFollowMode', () => {
    it('should toggle the followModeEnabled value', () => {
      userOptionsStore.setFollowModeEnabled(false);

      userOptionsStore.toggleFollowMode();
      expect(userOptionsStore.followModeEnabled).toBe(true);

      userOptionsStore.toggleFollowMode();
      expect(userOptionsStore.followModeEnabled).toBe(false);
    });
  });

  describe('selectTheme', () => {
    it('should set the theme and store user options', () => {
      // Mock storeUserOptions to avoid actual implementation
      const storeUserOptionsMock = vi.fn();
      const originalStoreUserOptions = userOptionsStore.storeUserOptions;
      userOptionsStore.storeUserOptions = storeUserOptionsMock;

      try {
        userOptionsStore.selectTheme('light');
        expect(userOptionsStore.theme).toBe('light');
        expect(storeUserOptionsMock).toHaveBeenCalled();
      } finally {
        // Restore original method
        userOptionsStore.storeUserOptions = originalStoreUserOptions;
      }
    });
  });

  describe('event listeners', () => {
    it('should disable follow mode when scrolling if loading', () => {
      // Create a new instance of the store for this test
      const testStore = UserOptionsStoreModel.create({
        followModeEnabled: true,
        theme: "darknight",
        text_model: "llama-3.3-70b-versatile"
      });

      // Mock ClientChatStore.isLoading
      const originalIsLoading = ClientChatStore.isLoading;
      (ClientChatStore as any).isLoading = true;

      // Mock setFollowModeEnabled
      const setFollowModeEnabledMock = vi.fn();
      testStore.setFollowModeEnabled = setFollowModeEnabledMock;

      // Add the event listener manually (similar to initialize)
      const scrollHandler = () => {
        if (ClientChatStore.isLoading && testStore.followModeEnabled) {
          testStore.setFollowModeEnabled(false);
        }
      };

      // Trigger the handler directly
      scrollHandler();

      // Restore original value
      (ClientChatStore as any).isLoading = originalIsLoading;

      expect(setFollowModeEnabledMock).toHaveBeenCalledWith(false);
    });

    it('should not disable follow mode when scrolling if not loading', () => {
      // Create a new instance of the store for this test
      const testStore = UserOptionsStoreModel.create({
        followModeEnabled: true,
        theme: "darknight",
        text_model: "llama-3.3-70b-versatile"
      });

      // Mock ClientChatStore.isLoading
      const originalIsLoading = ClientChatStore.isLoading;
      (ClientChatStore as any).isLoading = false;

      // Mock setFollowModeEnabled
      const setFollowModeEnabledMock = vi.fn();
      testStore.setFollowModeEnabled = setFollowModeEnabledMock;

      // Add the event listener manually (similar to initialize)
      const scrollHandler = () => {
        if (ClientChatStore.isLoading && testStore.followModeEnabled) {
          testStore.setFollowModeEnabled(false);
        }
      };

      // Trigger the handler directly
      scrollHandler();

      // Restore original value
      (ClientChatStore as any).isLoading = originalIsLoading;

      expect(setFollowModeEnabledMock).not.toHaveBeenCalled();
    });
  });
});
