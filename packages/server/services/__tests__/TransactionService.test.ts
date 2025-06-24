import { getSnapshot, Instance } from 'mobx-state-tree';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import TransactionService from '../TransactionService.ts';

// Define types for testing
type TransactionServiceInstance = Instance<typeof TransactionService>;

// Mock global types
vi.stubGlobal(
  'Response',
  class MockResponse {
    status: number;
    headers: Headers;
    body: any;

    constructor(body?: any, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
    }

    clone() {
      return this;
    }

    async text() {
      return this.body?.toString() || '';
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
  },
);

describe('TransactionService', () => {
  let transactionService: TransactionServiceInstance;

  beforeEach(() => {
    // Create a new instance of the service before each test
    transactionService = TransactionService.create();

    // Reset mocks
    vi.resetAllMocks();

    // Mock crypto.randomUUID
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('mock-uuid');
  });

  describe('Initial state', () => {
    it('should have empty env and ctx objects initially', () => {
      expect(transactionService.env).toEqual({});
      expect(transactionService.ctx).toEqual({});
    });
  });

  describe('setEnv', () => {
    it('should set the environment', () => {
      const mockEnv = { KV_STORAGE: { put: vi.fn() } };
      transactionService.setEnv(mockEnv);
      expect(transactionService.env).toEqual(mockEnv);
    });
  });

  describe('setCtx', () => {
    it('should set the execution context', () => {
      const mockCtx = { waitUntil: vi.fn() };
      transactionService.setCtx(mockCtx);
      expect(transactionService.ctx).toEqual(mockCtx);
    });
  });

  describe('routeAction', () => {
    it('should route to the correct handler', async () => {
      // Mock the handler
      const mockHandlePrepareTransaction = vi.fn().mockResolvedValue({ success: true });
      transactionService.handlePrepareTransaction = mockHandlePrepareTransaction;

      // Call routeAction with a valid action
      const result = await transactionService.routeAction('PREPARE_TX', ['data']);

      // Verify the handler was called with the correct data
      expect(mockHandlePrepareTransaction).toHaveBeenCalledWith(['data']);
      expect(result).toEqual({ success: true });
    });

    it('should throw an error for unknown actions', async () => {
      // Call routeAction with an invalid action
      await expect(transactionService.routeAction('UNKNOWN_ACTION', ['data'])).rejects.toThrow(
        'No handler for action: UNKNOWN_ACTION',
      );
    });
  });

  describe('handlePrepareTransaction', () => {
    beforeEach(() => {
      // Mock fetch
      global.fetch = vi.fn();

      // Mock KV_STORAGE
      const mockEnv = {
        KV_STORAGE: {
          put: vi.fn().mockResolvedValue(undefined),
        },
      };
      transactionService.setEnv(mockEnv);
    });

    it('should prepare a transaction correctly', async () => {
      // Mock wallet API response
      const mockWalletResponse = JSON.stringify([
        'mock-address',
        'mock-private-key',
        'mock-public-key',
        'mock-phrase',
      ]);

      global.fetch.mockResolvedValue({
        text: vi.fn().mockResolvedValue(mockWalletResponse),
      });

      // Call the method with test data
      const result = await transactionService.handlePrepareTransaction([
        'donor123',
        'bitcoin',
        '0.01',
      ]);

      // Verify fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith('https://wallets.seemueller.io/api/btc/create');

      // Verify KV_STORAGE.put was called with the correct data
      expect(transactionService.env.KV_STORAGE.put).toHaveBeenCalledWith(
        'transactions::prepared::mock-uuid',
        expect.stringContaining('mock-address'),
      );

      // Verify the returned data
      expect(result).toEqual({
        depositAddress: 'mock-address',
        txKey: 'mock-uuid',
      });
    });

    it('should handle different currencies correctly', async () => {
      // Mock wallet API response
      const mockWalletResponse = JSON.stringify([
        'mock-address',
        'mock-private-key',
        'mock-public-key',
        'mock-phrase',
      ]);

      global.fetch.mockResolvedValue({
        text: vi.fn().mockResolvedValue(mockWalletResponse),
      });

      // Test with ethereum
      await transactionService.handlePrepareTransaction(['donor123', 'ethereum', '0.01']);
      expect(global.fetch).toHaveBeenCalledWith('https://wallets.seemueller.io/api/eth/create');

      // Reset mock and test with dogecoin
      vi.resetAllMocks();
      global.fetch.mockResolvedValue({
        text: vi.fn().mockResolvedValue(mockWalletResponse),
      });

      await transactionService.handlePrepareTransaction(['donor123', 'dogecoin', '0.01']);
      expect(global.fetch).toHaveBeenCalledWith('https://wallets.seemueller.io/api/doge/create');
    });
  });

  describe('handleTransact', () => {
    beforeEach(() => {
      // Mock routeAction
      transactionService.routeAction = vi.fn().mockResolvedValue({ success: true });
    });

    it('should process a valid transaction request', async () => {
      // Create a mock request
      const mockRequest = {
        text: vi.fn().mockResolvedValue('PREPARE_TX,donor123,bitcoin,0.01'),
      };

      // Call the method
      const response = await transactionService.handleTransact(mockRequest);

      // Verify routeAction was called with the correct parameters
      expect(transactionService.routeAction).toHaveBeenCalledWith('PREPARE_TX', [
        'donor123',
        'bitcoin',
        '0.01',
      ]);

      // Verify the response
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({ success: true });
    });

    it('should handle errors gracefully', async () => {
      // Create a mock request
      const mockRequest = {
        text: vi.fn().mockResolvedValue('PREPARE_TX,donor123,bitcoin,0.01'),
      };

      // Make routeAction throw an error
      transactionService.routeAction = vi.fn().mockRejectedValue(new Error('Test error'));

      // Call the method
      const response = await transactionService.handleTransact(mockRequest);

      // Verify the error response
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(500);

      const responseBody = await response.json();
      expect(responseBody).toEqual({ error: 'Transaction failed' });
    });
  });
});
