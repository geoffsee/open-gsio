import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSnapshot } from 'mobx-state-tree';
import FeedbackService from '../FeedbackService.ts';
import FeedbackRecord from '../../models/FeedbackRecord.ts';

describe('FeedbackService', () => {
  let feedbackService;

  beforeEach(() => {
    // Create a new instance of the service before each test
    feedbackService = FeedbackService.create();

    // Reset mocks
    vi.resetAllMocks();
  });

  describe('Initial state', () => {
    it('should have empty env and ctx objects initially', () => {
      expect(feedbackService.env).toEqual({});
      expect(feedbackService.ctx).toEqual({});
    });
  });

  describe('setEnv', () => {
    it('should set the environment', () => {
      const mockEnv = { KV_STORAGE: { put: vi.fn() }, EMAIL_SERVICE: { sendMail: vi.fn() } };
      feedbackService.setEnv(mockEnv);
      expect(feedbackService.env).toEqual(mockEnv);
    });
  });

  describe('setCtx', () => {
    it('should set the execution context', () => {
      const mockCtx = { waitUntil: vi.fn() };
      feedbackService.setCtx(mockCtx);
      expect(feedbackService.ctx).toEqual(mockCtx);
    });
  });

  describe('handleFeedback', () => {
    it('should process a valid feedback request and return a success response', async () => {
      // Mock crypto.randomUUID
      vi.stubGlobal('crypto', {
        randomUUID: vi.fn().mockReturnValue('mock-uuid'),
      });

      // Mock date for consistent testing
      const mockDate = new Date('2023-01-01T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      // Create mock request data
      const feedbackData = {
        feedback: 'This is a test feedback',
        user: 'TestUser',
      };

      // Create mock request
      const mockRequest = {
        json: vi.fn().mockResolvedValue(feedbackData),
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
      feedbackService.setEnv(mockEnv);

      // Call the method
      const result = await feedbackService.handleFeedback(mockRequest as any);

      // Verify KV_STORAGE.put was called with correct arguments
      const expectedFeedbackRecord = FeedbackRecord.create({
        feedback: feedbackData.feedback,
        timestamp: mockDate.toISOString(),
        user: feedbackData.user,
      });

      expect(mockEnv.KV_STORAGE.put).toHaveBeenCalledWith(
        'feedback:mock-uuid',
        JSON.stringify(getSnapshot(expectedFeedbackRecord)),
      );

      // Verify EMAIL_SERVICE.sendMail was called with correct arguments
      expect(mockEnv.EMAIL_SERVICE.sendMail).toHaveBeenCalledWith({
        to: 'geoff@seemueller.io',
        plaintextMessage: expect.stringContaining(feedbackData.feedback),
      });

      // Verify result is a success Response
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(200);

      // Verify response body
      const text = await result.clone().text();
      expect(text).toBe('Feedback saved successfully');

      // Restore real timers
      vi.useRealTimers();
    });

    it('should use default values when not provided in the request', async () => {
      // Mock crypto.randomUUID
      vi.stubGlobal('crypto', {
        randomUUID: vi.fn().mockReturnValue('mock-uuid'),
      });

      // Mock date for consistent testing
      const mockDate = new Date('2023-01-01T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      // Create mock request data with only feedback
      const feedbackData = {
        feedback: 'This is a test feedback',
      };

      // Create mock request
      const mockRequest = {
        json: vi.fn().mockResolvedValue(feedbackData),
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
      feedbackService.setEnv(mockEnv);

      // Call the method
      const result = await feedbackService.handleFeedback(mockRequest as any);

      // Verify KV_STORAGE.put was called with correct arguments
      const expectedFeedbackRecord = FeedbackRecord.create({
        feedback: feedbackData.feedback,
        timestamp: mockDate.toISOString(),
        user: 'Anonymous', // Default value
      });

      expect(mockEnv.KV_STORAGE.put).toHaveBeenCalledWith(
        'feedback:mock-uuid',
        JSON.stringify(getSnapshot(expectedFeedbackRecord)),
      );

      // Verify result is a success Response
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(200);

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
      feedbackService.setEnv(mockEnv);

      // Call the method
      const result = await feedbackService.handleFeedback(mockRequest as any);

      // Verify KV_STORAGE.put was not called
      expect(mockEnv.KV_STORAGE.put).not.toHaveBeenCalled();

      // Verify EMAIL_SERVICE.sendMail was not called
      expect(mockEnv.EMAIL_SERVICE.sendMail).not.toHaveBeenCalled();

      // Verify result is an error Response
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(500);

      // Verify response body
      const text = await result.clone().text();
      expect(text).toBe('Failed to process feedback request');
    });
  });
});
