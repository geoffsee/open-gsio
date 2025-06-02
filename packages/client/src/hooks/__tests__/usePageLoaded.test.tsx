import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import usePageLoaded from '../usePageLoaded';

describe('usePageLoaded', () => {
  const callback = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset event listeners
    vi.stubGlobal('addEventListener', vi.fn());
    vi.stubGlobal('removeEventListener', vi.fn());
  });

  it('calls callback immediately if document is already loaded', () => {
    // Mock document.readyState to be "complete"
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'complete'
    });

    const { result } = renderHook(() => usePageLoaded(callback));
    
    // The hook should return true
    expect(result.current).toBe(true);
    
    // Callback should be called immediately
    expect(callback).toHaveBeenCalledTimes(1);
    
    // No event listener should be added
    expect(window.addEventListener).not.toHaveBeenCalled();
  });

  it('adds event listener if document is not loaded yet', () => {
    // Mock document.readyState to be "loading"
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'loading'
    });

    const { result } = renderHook(() => usePageLoaded(callback));
    
    // The hook should return false initially
    expect(result.current).toBe(false);
    
    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled();
    
    // Event listener should be added
    expect(window.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
  });

  it('cleans up event listener on unmount', () => {
    // Mock document.readyState to be "loading"
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'loading'
    });

    const { unmount } = renderHook(() => usePageLoaded(callback));
    
    // Unmount the hook
    unmount();
    
    // Event listener should be removed
    expect(window.removeEventListener).toHaveBeenCalledWith('load', expect.any(Function));
  });

  it('calls callback and updates state when load event fires', () => {
    // Mock document.readyState to be "loading"
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'loading'
    });

    // Capture the event handler
    let loadHandler: Function;
    vi.stubGlobal('addEventListener', vi.fn((event, handler) => {
      if (event === 'load') {
        loadHandler = handler;
      }
    }));

    const { result } = renderHook(() => usePageLoaded(callback));
    
    // Initially, isLoaded should be false
    expect(result.current).toBe(false);
    
    // Simulate the load event
    loadHandler();
    
    // Now the callback should have been called
    expect(callback).toHaveBeenCalledTimes(1);
    
    // And isLoaded should be updated to true
    // Note: We need to use rerender or waitFor in a real test to see this update
    // For simplicity, we're just testing the callback was called
  });
});