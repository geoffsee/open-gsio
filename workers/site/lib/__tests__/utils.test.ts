import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Utils } from '../utils';

describe('Utils', () => {
  describe('getSeason', () => {
    // Based on the actual behavior from debug tests (months are 0-indexed in JavaScript):
    // Winter: month < 2 (Jan, Feb) OR month === 2 && day <= 20 (Mar 1-20) OR month === 11 (Dec)
    // Spring: (month === 2 && day > 20) (Mar 21-31) OR month === 3 || month === 4 (Apr, May) OR (month === 5 && day <= 21) (Jun 1-21)
    // Summer: (month === 5 && day > 21) (Jun 22-30) OR month === 6 || month === 7 (Jul, Aug) OR (month === 8 && day <= 22) (Sep 1-22)
    // Autumn: (month === 8 && day > 22) (Sep 23-30) OR month === 9 || month === 10 (Oct, Nov)

    it('should return Winter for dates in winter in Northern Hemisphere', () => {
      expect(Utils.getSeason('2023-01-15')).toBe('Winter'); // January (month 0)
      expect(Utils.getSeason('2023-02-15')).toBe('Winter'); // February (month 1)
      expect(Utils.getSeason('2023-03-20')).toBe('Winter'); // March 20 (month 2)
      expect(Utils.getSeason('2023-12-15')).toBe('Winter'); // December (month 11)
    });

    it('should return Spring for dates in spring in Northern Hemisphere', () => {
      expect(Utils.getSeason('2023-03-25')).toBe('Spring'); // March 25 (month 2)
      expect(Utils.getSeason('2023-04-15')).toBe('Spring'); // April (month 3)
      expect(Utils.getSeason('2023-05-15')).toBe('Spring'); // May (month 4)
      expect(Utils.getSeason('2023-06-21')).toBe('Spring'); // June 21 (month 5)
    });

    it('should return Summer for dates in summer in Northern Hemisphere', () => {
      expect(Utils.getSeason('2023-06-23')).toBe('Summer'); // June 23 (month 5)
      expect(Utils.getSeason('2023-07-15')).toBe('Summer'); // July (month 6)
      expect(Utils.getSeason('2023-08-15')).toBe('Summer'); // August (month 7)
      expect(Utils.getSeason('2023-09-22')).toBe('Summer'); // September 22 (month 8)
    });

    it('should return Autumn for dates in autumn in Northern Hemisphere', () => {
      expect(Utils.getSeason('2023-09-24')).toBe('Autumn'); // September 24 (month 8)
      expect(Utils.getSeason('2023-10-15')).toBe('Autumn'); // October (month 9)
      expect(Utils.getSeason('2023-11-15')).toBe('Autumn'); // November (month 10)
    });
  });

  describe('getTimezone', () => {
    const originalDateTimeFormat = Intl.DateTimeFormat;

    beforeEach(() => {
      // Mock Intl.DateTimeFormat
      global.Intl.DateTimeFormat = vi.fn().mockReturnValue({
        resolvedOptions: vi.fn().mockReturnValue({
          timeZone: 'America/New_York'
        })
      });
    });

    afterEach(() => {
      // Restore original
      global.Intl.DateTimeFormat = originalDateTimeFormat;
    });

    it('should return the provided timezone if available', () => {
      expect(Utils.getTimezone('Europe/London')).toBe('Europe/London');
    });

    it('should return the system timezone if no timezone is provided', () => {
      expect(Utils.getTimezone(undefined)).toBe('America/New_York');
    });
  });

  describe('getCurrentDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-01-01T12:30:45Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return the current date as an ISO string', () => {
      expect(Utils.getCurrentDate()).toBe('2023-01-01T12:30:45.000Z');
    });
  });

  describe('isAssetUrl', () => {
    it('should return true for URLs starting with /assets/', () => {
      expect(Utils.isAssetUrl('https://example.com/assets/image.png')).toBe(true);
      expect(Utils.isAssetUrl('http://localhost:8080/assets/script.js')).toBe(true);
    });

    it('should return false for URLs not starting with /assets/', () => {
      expect(Utils.isAssetUrl('https://example.com/api/data')).toBe(false);
      expect(Utils.isAssetUrl('http://localhost:8080/images/logo.png')).toBe(false);
    });
  });

  describe('selectEquitably', () => {
    beforeEach(() => {
      // Mock Math.random to return predictable values
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should select items equitably from multiple sources', () => {
      const sources = {
        a: { 'key1': 'value1', 'key2': 'value2' },
        b: { 'key3': 'value3', 'key4': 'value4' },
        c: { 'key5': 'value5', 'key6': 'value6' },
        d: { 'key7': 'value7', 'key8': 'value8' }
      };

      const result = Utils.selectEquitably(sources, 4);

      expect(Object.keys(result).length).toBe(4);
      // Due to the mocked Math.random, the selection should be deterministic
      // but we can't predict the exact keys due to the sort, so we just check the count
    });

    it('should handle itemCount greater than available items', () => {
      const sources = {
        a: { 'key1': 'value1' },
        b: { 'key2': 'value2' },
        c: {},
        d: {}
      };

      const result = Utils.selectEquitably(sources, 5);

      expect(Object.keys(result).length).toBe(2);
      expect(result).toHaveProperty('key1');
      expect(result).toHaveProperty('key2');
    });

    it('should handle empty sources', () => {
      const sources = {
        a: {},
        b: {},
        c: {},
        d: {}
      };

      const result = Utils.selectEquitably(sources, 5);

      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('normalizeWithBlanks', () => {
    it('should insert blank messages to maintain user/assistant alternation', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'user', content: 'How are you?' }
      ];

      const result = Utils.normalizeWithBlanks(messages);

      expect(result.length).toBe(3);
      expect(result[0]).toEqual({ role: 'user', content: 'Hello' });
      expect(result[1]).toEqual({ role: 'assistant', content: '' });
      expect(result[2]).toEqual({ role: 'user', content: 'How are you?' });
    });

    it('should insert blank user message if first message is assistant', () => {
      const messages = [
        { role: 'assistant', content: 'Hello, how can I help?' }
      ];

      const result = Utils.normalizeWithBlanks(messages);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ role: 'user', content: '' });
      expect(result[1]).toEqual({ role: 'assistant', content: 'Hello, how can I help?' });
    });

    it('should handle empty array', () => {
      const messages: any[] = [];

      const result = Utils.normalizeWithBlanks(messages);

      expect(result.length).toBe(0);
    });

    it('should handle already alternating messages', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
        { role: 'user', content: 'How are you?' }
      ];

      const result = Utils.normalizeWithBlanks(messages);

      expect(result.length).toBe(3);
      expect(result).toEqual(messages);
    });
  });
});
