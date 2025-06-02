import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSnapshot } from 'mobx-state-tree';
import ContactService from '../ContactService.ts';
import ContactRecord from '../../models/ContactRecord.ts';

describe('ContactService', () => {
  let contactService;

  beforeEach(() => {
    // Create a new instance of the service before each test
    contactService = ContactService.create();

    // Reset mocks
    vi.resetAllMocks();
  });

  describe('Initial state', () => {
    it('should have empty env and ctx objects initially', () => {
      expect(contactService.env).toEqual({});
      expect(contactService.ctx).toEqual({});
    });
  });

  describe('setEnv', () => {
    it('should set the environment', () => {
      const mockEnv = { KV_STORAGE: { put: vi.fn() }, EMAIL_SERVICE: { sendMail: vi.fn() } };
      contactService.setEnv(mockEnv);
      expect(contactService.env).toEqual(mockEnv);
    });
  });

  describe('setCtx', () => {
    it('should set the execution context', () => {
      const mockCtx = { waitUntil: vi.fn() };
      contactService.setCtx(mockCtx);
      expect(contactService.ctx).toEqual(mockCtx);
    });
  });

  describe('handleContact', () => {
    it('should process a valid contact request and return a success response', async () => {
      // Mock crypto.randomUUID
      vi.stubGlobal('crypto', {
        randomUUID: vi.fn().mockReturnValue('mock-uuid'),
      });

      // Mock date for consistent testing
      const mockDate = new Date('2023-01-01T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      // Create mock request data
      const contactData = {
        markdown: 'Test message',
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
      };

      // Create mock request
      const mockRequest = {
        json: vi.fn().mockResolvedValue(contactData),
      };

      // Create mock environment
      const mockEnv = {
        KV_STORAGE: {
          put: vi.fn().mockResolvedValue(undefined),
        },
        EMAIL_SERVICE: {
          sendMail: vi.fn().mockResolvedValue(undefined),
        },
      };

      // Set the environment
      contactService.setEnv(mockEnv);

      // Call the method
      const result = await contactService.handleContact(mockRequest as any);

      // Verify KV_STORAGE.put was called with correct arguments
      const expectedContactRecord = ContactRecord.create({
        message: contactData.markdown,
        timestamp: mockDate.toISOString(),
        email: contactData.email,
        firstname: contactData.firstname,
        lastname: contactData.lastname,
      });

      expect(mockEnv.KV_STORAGE.put).toHaveBeenCalledWith(
        'contact:mock-uuid',
        JSON.stringify(getSnapshot(expectedContactRecord)),
      );

      // Verify EMAIL_SERVICE.sendMail was called with correct arguments
      expect(mockEnv.EMAIL_SERVICE.sendMail).toHaveBeenCalledWith({
        to: 'geoff@seemueller.io',
        plaintextMessage: expect.stringContaining(contactData.markdown),
      });

      // Verify result is a success Response
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(200);

      // Verify response body
      const text = await result.clone().text();
      expect(text).toBe('Contact record saved successfully');

      // Restore real timers
      vi.useRealTimers();
    });

    it('should return a 500 response when an error occurs', async () => {
      // Create mock request that throws an error
      const mockRequest = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      };

      // Create mock environment
      const mockEnv = {
        KV_STORAGE: {
          put: vi.fn(),
        },
        EMAIL_SERVICE: {
          sendMail: vi.fn(),
        },
      };

      // Set the environment
      contactService.setEnv(mockEnv);

      // Call the method
      const result = await contactService.handleContact(mockRequest as any);

      // Verify KV_STORAGE.put was not called
      expect(mockEnv.KV_STORAGE.put).not.toHaveBeenCalled();

      // Verify EMAIL_SERVICE.sendMail was not called
      expect(mockEnv.EMAIL_SERVICE.sendMail).not.toHaveBeenCalled();

      // Verify result is an error Response
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(500);

      // Verify response body
      const text = await result.clone().text();
      expect(text).toBe('Failed to process contact request');
    });
  });
});
