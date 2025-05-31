import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import clientTransactionStore from '../ClientTransactionStore';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ClientTransactionStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    clientTransactionStore.resetTransaction();
    clientTransactionStore.setSelectedMethod('Ethereum');
    clientTransactionStore.setAmount('');
    clientTransactionStore.setDonerId('');

    // Reset mocks
    vi.clearAllMocks();

    // No need to fix inconsistency anymore as we've updated the model
  });

  describe('setSelectedMethod', () => {
    it('should set the selected method and reset userConfirmed', () => {
      // First set userConfirmed to true to verify it gets reset
      clientTransactionStore.confirmUser();
      expect(clientTransactionStore.userConfirmed).toBe(true);

      clientTransactionStore.setSelectedMethod('Bitcoin');

      expect(clientTransactionStore.selectedMethod).toBe('Bitcoin');
      expect(clientTransactionStore.userConfirmed).toBe(false);
    });
  });

  describe('setAmount', () => {
    it('should set the amount', () => {
      clientTransactionStore.setAmount('100');
      expect(clientTransactionStore.amount).toBe('100');
    });
  });

  describe('setDonerId', () => {
    it('should set the donerId', () => {
      clientTransactionStore.setDonerId('donor123');
      expect(clientTransactionStore.donerId).toBe('donor123');
    });
  });

  describe('confirmUser', () => {
    it('should set userConfirmed to true', () => {
      clientTransactionStore.confirmUser();
      expect(clientTransactionStore.userConfirmed).toBe(true);
    });
  });

  describe('setTransactionId', () => {
    it('should set the transaction ID', () => {
      clientTransactionStore.setTransactionId('tx123');
      expect(clientTransactionStore.txId).toBe('tx123');
    });
  });

  describe('setDepositAddress', () => {
    it('should set the deposit address', () => {
      clientTransactionStore.setDepositAddress('0xabc123');
      expect(clientTransactionStore.depositAddress).toBe('0xabc123');
    });
  });

  describe('resetTransaction', () => {
    it('should reset transaction-related properties', () => {
      // Set up some values first
      clientTransactionStore.setTransactionId('tx123');
      clientTransactionStore.setDepositAddress('0xabc123');
      clientTransactionStore.confirmUser();

      // Reset the transaction
      clientTransactionStore.resetTransaction();

      // Verify reset values
      expect(clientTransactionStore.txId).toBe('');
      expect(clientTransactionStore.depositAddress).toBe(null);
      expect(clientTransactionStore.userConfirmed).toBe(false);
    });
  });

  describe('prepareTransaction', () => {
    it('should throw an error if amount is empty', async () => {
      clientTransactionStore.setDonerId('donor123');

      await expect(clientTransactionStore.prepareTransaction()).rejects.toThrow('Invalid donation data');
    });

    it('should throw an error if donerId is empty', async () => {
      clientTransactionStore.setAmount('100');

      await expect(clientTransactionStore.prepareTransaction()).rejects.toThrow('Invalid donation data');
    });

    it('should throw an error if amount is less than or equal to 0', async () => {
      clientTransactionStore.setAmount('0');
      clientTransactionStore.setDonerId('donor123');

      await expect(clientTransactionStore.prepareTransaction()).rejects.toThrow('Invalid donation data');
    });

    it('should throw an error if the API request fails', async () => {
      // Set up valid transaction data
      clientTransactionStore.setAmount('100');
      clientTransactionStore.setDonerId('donor123');

      // Mock a failed API response
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(clientTransactionStore.prepareTransaction()).rejects.toThrow('Failed to prepare transaction');
    });

    it('should successfully prepare an Ethereum transaction', async () => {
      // Set up valid transaction data
      clientTransactionStore.setAmount('100');
      clientTransactionStore.setDonerId('donor123');
      clientTransactionStore.setSelectedMethod('Ethereum');

      // Mock a successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          txKey: 'tx123',
          depositAddress: 'abc123', // Without 0x prefix to test the Ethereum-specific logic
        }),
      });

      await clientTransactionStore.prepareTransaction();

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith('/api/tx', {
        method: 'POST',
        body: 'PREPARE_TX,donor123,ethereum,100',
      });

      // Verify store updates
      expect(clientTransactionStore.txId).toBe('tx123');
      expect(clientTransactionStore.depositAddress).toBe('0xabc123'); // Should have 0x prefix added
      expect(clientTransactionStore.userConfirmed).toBe(true);
    });

    it('should successfully prepare a non-Ethereum transaction', async () => {
      // Set up valid transaction data
      clientTransactionStore.setAmount('100');
      clientTransactionStore.setDonerId('donor123');
      clientTransactionStore.setSelectedMethod('Bitcoin');

      // Mock a successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          txKey: 'tx123',
          depositAddress: 'btc123', // Bitcoin address doesn't need prefix
        }),
      });

      await clientTransactionStore.prepareTransaction();

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith('/api/tx', {
        method: 'POST',
        body: 'PREPARE_TX,donor123,bitcoin,100',
      });

      // Verify store updates
      expect(clientTransactionStore.txId).toBe('tx123');
      expect(clientTransactionStore.depositAddress).toBe('btc123'); // Should not have prefix added
      expect(clientTransactionStore.userConfirmed).toBe(true);
    });

    it('should handle API errors and rethrow them', async () => {
      // Set up valid transaction data
      clientTransactionStore.setAmount('100');
      clientTransactionStore.setDonerId('donor123');

      // Mock an API error
      const mockError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(mockError);

      await expect(clientTransactionStore.prepareTransaction()).rejects.toThrow(mockError);
    });
  });
});
