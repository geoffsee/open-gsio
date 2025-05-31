import { describe, it, expect, vi } from 'vitest';
import { createRouter } from '../api-router';

// Mock the vike/server module
vi.mock('vike/server', () => ({
  renderPage: vi.fn()
}));

describe('api-router', () => {
  // Test that the router is created successfully
  it('creates a router', () => {
    const router = createRouter();
    expect(router).toBeDefined();
    expect(typeof router.handle).toBe('function');
  });
});