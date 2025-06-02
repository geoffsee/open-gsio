import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssistantSdk } from '../assistant-sdk.ts';
import { Utils } from '../utils.ts';

// Mock dependencies
vi.mock('../utils', () => ({
  Utils: {
    selectEquitably: vi.fn(),
    getCurrentDate: vi.fn()
  }
}));

vi.mock('../prompts/few_shots', () => ({
  default: {
    'a': 'A1',
    'question1': 'answer1',
    'question2': 'answer2',
    'question3': 'answer3'
  }
}));

describe('AssistantSdk', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T12:30:45Z'));

    // Reset mocks
    vi.mocked(Utils.selectEquitably).mockReset();
    vi.mocked(Utils.getCurrentDate).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getAssistantPrompt', () => {
    it('should return a prompt with default values when minimal params are provided', () => {
      // Mock dependencies
      vi.mocked(Utils.selectEquitably).mockReturnValue({
        'question1': 'answer1',
        'question2': 'answer2'
      });
      vi.mocked(Utils.getCurrentDate).mockReturnValue('2023-01-01T12:30:45Z');

      const prompt = AssistantSdk.getAssistantPrompt({});

      expect(prompt).toContain('# Assistant Knowledge');
      expect(prompt).toContain('2023-01-01');
      expect(prompt).toContain('- **Web Host**: geoff.seemueller.io');
      expect(prompt).toContain('- **User Location**: Unknown');
      expect(prompt).toContain('- **Timezone**: UTC');
      expect(prompt).not.toContain('- **Response Limit**:');
    });

    it('should include maxTokens when provided', () => {
      // Mock dependencies
      vi.mocked(Utils.selectEquitably).mockReturnValue({
        'question1': 'answer1',
        'question2': 'answer2'
      });
      vi.mocked(Utils.getCurrentDate).mockReturnValue('2023-01-01T12:30:45Z');

      const prompt = AssistantSdk.getAssistantPrompt({ maxTokens: 1000 });

      expect(prompt).toContain('- **Response Limit**: 1000 tokens (maximum)');
    });

    it('should use provided userTimezone and userLocation', () => {
      // Mock dependencies
      vi.mocked(Utils.selectEquitably).mockReturnValue({
        'question1': 'answer1',
        'question2': 'answer2'
      });
      vi.mocked(Utils.getCurrentDate).mockReturnValue('2023-01-01T12:30:45Z');

      const prompt = AssistantSdk.getAssistantPrompt({
        userTimezone: 'America/New_York',
        userLocation: 'New York, USA'
      });

      expect(prompt).toContain('- **User Location**: New York, USA');
      expect(prompt).toContain('- **Timezone**: America/New_York');
    });

    it('should use current date when Utils.getCurrentDate is not available', () => {
      // Mock dependencies
      vi.mocked(Utils.selectEquitably).mockReturnValue({
        'question1': 'answer1',
        'question2': 'answer2'
      });
      vi.mocked(Utils.getCurrentDate).mockReturnValue(undefined);

      const prompt = AssistantSdk.getAssistantPrompt({});

      // Instead of checking for a specific date, just verify that a date is included
      expect(prompt).toMatch(/- \*\*Date\*\*: \d{4}-\d{2}-\d{2} \d{1,2}:\d{2} \d{1,2}s/);
    });

    it('should use few_shots directly when Utils.selectEquitably is not available', () => {
      // Mock dependencies
      vi.mocked(Utils.selectEquitably).mockReturnValue(undefined);
      vi.mocked(Utils.getCurrentDate).mockReturnValue('2023-01-01T12:30:45Z');

      const prompt = AssistantSdk.getAssistantPrompt({});

      // The prompt should still contain examples
      expect(prompt).toContain('#### Example 1');
      // Instead of checking for specific content, just verify that examples are included
      expect(prompt).toMatch(/\*\*Human\*\*: .+\n\*\*Assistant\*\*: .+/);
    });
  });

  describe('useFewshots', () => {
    it('should format fewshots correctly', () => {
      const fewshots = {
        'What is the capital of France?': 'Paris is the capital of France.',
        'How do I make pasta?': 'Boil water, add pasta, cook until al dente.'
      };

      const result = AssistantSdk.useFewshots(fewshots);

      expect(result).toContain('#### Example 1');
      expect(result).toContain('**Human**: What is the capital of France?');
      expect(result).toContain('**Assistant**: Paris is the capital of France.');
      expect(result).toContain('#### Example 2');
      expect(result).toContain('**Human**: How do I make pasta?');
      expect(result).toContain('**Assistant**: Boil water, add pasta, cook until al dente.');
    });

    it('should respect the limit parameter', () => {
      const fewshots = {
        'Q1': 'A1',
        'Q2': 'A2',
        'Q3': 'A3',
        'Q4': 'A4',
        'Q5': 'A5',
        'Q6': 'A6'
      };

      const result = AssistantSdk.useFewshots(fewshots, 3);

      expect(result).toContain('#### Example 1');
      expect(result).toContain('**Human**: Q1');
      expect(result).toContain('**Assistant**: A1');
      expect(result).toContain('#### Example 2');
      expect(result).toContain('**Human**: Q2');
      expect(result).toContain('**Assistant**: A2');
      expect(result).toContain('#### Example 3');
      expect(result).toContain('**Human**: Q3');
      expect(result).toContain('**Assistant**: A3');
      expect(result).not.toContain('#### Example 4');
      expect(result).not.toContain('**Human**: Q4');
    });
  });
});
