import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSnapshot } from 'mobx-state-tree';
import AssetService from '../AssetService.ts';

// Mock the vike/server module
vi.mock('vike/server', () => ({
  renderPage: vi.fn(),
}));

// Import the mocked renderPage function for assertions
import { renderPage } from 'vike/server';

describe('AssetService', () => {
  let assetService;
  
  beforeEach(() => {
    // Create a new instance of the service before each test
    assetService = AssetService.create();
    
    // Reset mocks
    vi.resetAllMocks();
  });
  
  describe('Initial state', () => {
    it('should have empty env and ctx objects initially', () => {
      expect(assetService.env).toEqual({});
      expect(assetService.ctx).toEqual({});
    });
  });
  
  describe('setEnv', () => {
    it('should set the environment', () => {
      const mockEnv = { ASSETS: { fetch: vi.fn() } };
      assetService.setEnv(mockEnv);
      expect(assetService.env).toEqual(mockEnv);
    });
  });
  
  describe('setCtx', () => {
    it('should set the execution context', () => {
      const mockCtx = { waitUntil: vi.fn() };
      assetService.setCtx(mockCtx);
      expect(assetService.ctx).toEqual(mockCtx);
    });
  });
  
  describe('handleSsr', () => {
    it('should return null when httpResponse is not available', async () => {
      // Setup mock to return a pageContext without httpResponse
      vi.mocked(renderPage).mockResolvedValue({});
      
      const url = 'https://example.com';
      const headers = new Headers();
      const env = {};
      
      const result = await assetService.handleSsr(url, headers, env);
      
      // Verify renderPage was called with correct arguments
      expect(renderPage).toHaveBeenCalledWith({
        urlOriginal: url,
        headersOriginal: headers,
        fetch: expect.any(Function),
        env,
      });
      
      // Verify result is null
      expect(result).toBeNull();
    });
    
    it('should return a Response when httpResponse is available', async () => {
      // Create mock stream
      const mockStream = new ReadableStream();
      
      // Setup mock to return a pageContext with httpResponse
      vi.mocked(renderPage).mockResolvedValue({
        httpResponse: {
          statusCode: 200,
          headers: new Headers({ 'Content-Type': 'text/html' }),
          getReadableWebStream: () => mockStream,
        },
      });
      
      const url = 'https://example.com';
      const headers = new Headers();
      const env = {};
      
      const result = await assetService.handleSsr(url, headers, env);
      
      // Verify renderPage was called with correct arguments
      expect(renderPage).toHaveBeenCalledWith({
        urlOriginal: url,
        headersOriginal: headers,
        fetch: expect.any(Function),
        env,
      });
      
      // Verify result is a Response with correct properties
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Type')).toBe('text/html');
    });
  });
  
  describe('handleStaticAssets', () => {
    it('should fetch assets from the environment', async () => {
      // Create mock request
      const request = new Request('https://example.com/static/image.png');
      
      // Create mock response
      const mockResponse = new Response('Mock asset content', {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      });
      
      // Create mock environment with ASSETS.fetch
      const mockEnv = {
        ASSETS: {
          fetch: vi.fn().mockResolvedValue(mockResponse),
        },
      };
      
      // Set the environment
      assetService.setEnv(mockEnv);
      
      // Call the method
      const result = await assetService.handleStaticAssets(request, mockEnv);
      
      // Verify ASSETS.fetch was called with the request
      expect(mockEnv.ASSETS.fetch).toHaveBeenCalledWith(request);
      
      // Verify result is the expected response
      expect(result).toBe(mockResponse);
    });
    
    it('should return a 404 response when an error occurs', async () => {
      // Create mock request
      const request = new Request('https://example.com/static/not-found.png');
      
      // Create mock environment with ASSETS.fetch that throws an error
      const mockEnv = {
        ASSETS: {
          fetch: vi.fn().mockRejectedValue(new Error('Asset not found')),
        },
      };
      
      // Set the environment
      assetService.setEnv(mockEnv);
      
      // Call the method
      const result = await assetService.handleStaticAssets(request, mockEnv);
      
      // Verify ASSETS.fetch was called with the request
      expect(mockEnv.ASSETS.fetch).toHaveBeenCalledWith(request);
      
      // Verify result is a 404 Response
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(404);
      
      // Verify response body
      const text = await result.clone().text();
      expect(text).toBe('Asset not found');
    });
  });
});