import { describe, it, expect, vi, beforeEach } from 'vitest';
import MetricsService from '../MetricsService.ts';

describe('MetricsService', () => {
  let metricsService;

  beforeEach(() => {
    // Create a new instance of the service before each test
    metricsService = MetricsService.create();

    // Reset mocks
    vi.resetAllMocks();

    // Mock fetch
    global.fetch = vi.fn();
  });

  describe('Initial state', () => {
    it('should have empty env and ctx objects initially', () => {
      expect(metricsService.env).toEqual({});
      expect(metricsService.ctx).toEqual({});
    });

    it('should have isCollectingMetrics set to true by default', () => {
      expect(metricsService.isCollectingMetrics).toBe(true);
    });
  });

  describe('setEnv', () => {
    it('should set the environment', () => {
      const mockEnv = { METRICS_API_KEY: 'test-key' };
      metricsService.setEnv(mockEnv);
      expect(metricsService.env).toEqual(mockEnv);
    });
  });

  describe('setCtx', () => {
    it('should set the execution context', () => {
      const mockCtx = { waitUntil: vi.fn() };
      metricsService.setCtx(mockCtx);
      expect(metricsService.ctx).toEqual(mockCtx);
    });
  });

  describe('handleMetricsRequest', () => {
    it('should proxy GET requests to metrics.seemueller.io', async () => {
      // Create mock request
      const mockRequest = new Request('https://example.com/metrics/path?query=value', {
        method: 'GET',
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      // Create mock response
      const mockResponse = new Response('{"data": "test"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      // Mock fetch to return the mock response
      global.fetch.mockResolvedValue(mockResponse);

      // Call the method
      const result = await metricsService.handleMetricsRequest(mockRequest);

      // Verify fetch was called with correct arguments
      expect(global.fetch).toHaveBeenCalledWith(
        'https://metrics.seemueller.io/metrics/path?query=value',
        expect.objectContaining({
          method: 'GET',
          body: null,
          redirect: 'follow',
        })
      );

      // Verify result is the expected response
      expect(result).toBe(mockResponse);
    });

    it('should proxy POST requests with body to metrics.seemueller.io', async () => {
      // Create mock request with body
      const mockBody = JSON.stringify({ test: 'data' });
      const mockRequest = new Request('https://example.com/metrics/path', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: mockBody,
      });

      // Create mock response
      const mockResponse = new Response('{"success": true}', {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });

      // Mock fetch to return the mock response
      global.fetch.mockResolvedValue(mockResponse);

      // Call the method
      const result = await metricsService.handleMetricsRequest(mockRequest);

      // Verify fetch was called with correct arguments
      expect(global.fetch).toHaveBeenCalledWith(
        'https://metrics.seemueller.io/metrics/path',
        expect.objectContaining({
          method: 'POST',
          body: mockRequest.body,
          redirect: 'follow',
        })
      );

      // Verify result is the expected response
      expect(result).toBe(mockResponse);
    });

    it('should return a 500 response when fetch fails', async () => {
      // Create mock request
      const mockRequest = new Request('https://example.com/metrics/path');

      // Mock fetch to throw an error
      global.fetch.mockRejectedValue(new Error('Network error'));

      // Call the method
      const result = await metricsService.handleMetricsRequest(mockRequest);

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();

      // Verify result is an error Response
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(500);

      // Verify response body
      const text = await result.clone().text();
      expect(text).toBe('Failed to fetch metrics');
    });
  });
});
