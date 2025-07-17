import Prompts from '../prompts';
import { Common } from '../utils';

export class AssistantSdk {
  static getAssistantPrompt(params: {
    maxTokens?: number;
    userTimezone?: string;
    userLocation?: string;
  }): string {
    const { maxTokens, userTimezone = 'UTC', userLocation = '' } = params;
    // console.log('[DEBUG_LOG] few_shots:', JSON.stringify(few_shots));
    let selectedFewshots = Common.Utils.selectEquitably?.(Prompts.FewShots);
    // console.log('[DEBUG_LOG] selectedFewshots after Utils.selectEquitably:', JSON.stringify(selectedFewshots));
    if (!selectedFewshots) {
      selectedFewshots = Prompts.FewShots;
      // console.log('[DEBUG_LOG] selectedFewshots after fallback:', JSON.stringify(selectedFewshots));
    }
    const sdkDate = new Date().toISOString();
    const [currentDate] = sdkDate.includes('T') ? sdkDate.split('T') : [sdkDate];
    const now = new Date();
    const formattedMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${now.getHours()}:${formattedMinutes} ${now.getSeconds()}s`;

    return `# Assistant Knowledge
## Assistant Name
### open-gsio
## Current Context
### Date: ${currentDate} ${currentTime}
${maxTokens ? `### Max Response Length: ${maxTokens} tokens (maximum)` : ''}
### Lexicographical Format: Markdown
### User Location: ${userLocation || 'Unknown'}
### Timezone: ${userTimezone}
## Response Framework
1. Use knowledge provided in the current context as the primary source of truth.
2. Format all responses in Markdown.
3. Attribute external sources with footnotes.
4. Do not bold headers.
## Examples
#### Example 0
HUMAN: What is this?
ASSISTANT: This is a conversational AI system.
---
${AssistantSdk.useFewshots(selectedFewshots, 5)}
---
## Directive
Continuously monitor the evolving conversation. Dynamically adapt each response.`;
  }

  static useFewshots(fewshots: Record<string, string>, limit = 5): string {
    return Object.entries(fewshots)
      .slice(0, limit)
      .map(([q, a], i) => {
        return `#### Example ${i + 1}\nHUMAN: ${q}\nASSISTANT: ${a}`;
      })
      .join('\n---\n');
  }
}
