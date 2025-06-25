import { ProviderRepository } from '@open-gsio/ai/providers/_ProviderRepository.ts';
// @ts-expect-error - don't care
// eslint-disable-next-line import/no-unresolved
import { DurableObject } from 'cloudflare:workers';

export default class ServerCoordinator extends DurableObject {
  env;
  state;
  constructor(state, env) {
    super(state, env);
    this.state = state;
    this.env = env;
  }

  // Public method to calculate dynamic max tokens
  async dynamicMaxTokens(model, input, maxOuputTokens) {
    const modelMeta = ProviderRepository.getModelMeta(model, this.env);

    // The token‑limit information is stored in three different keys:
    // max_completion_tokens
    // context_window
    // context_length

    if ('max_completion_tokens' in modelMeta) {
      return modelMeta.max_completion_tokens;
    } else if ('context_window' in modelMeta) {
      return modelMeta.context_window;
    } else if ('context_length' in modelMeta) {
      return modelMeta.context_length;
    } else {
      return 2000;
    }
  }

  // Public method to retrieve conversation history
  async getConversationHistory(conversationId) {
    const history = await this.env.KV_STORAGE.get(`conversations:${conversationId}`);

    return JSON.parse(history) || [];
  }

  // Public method to save a message to the conversation history
  async saveConversationHistory(conversationId, message) {
    const history = await this.getConversationHistory(conversationId);
    history.push(message);
    await this.env.KV_STORAGE.put(`conversations:${conversationId}`, JSON.stringify(history));
  }

  async saveStreamData(streamId, data, ttl = 10) {
    const expirationTimestamp = Date.now() + ttl * 1000;
    // await this.state.storage.put(streamId, { data, expirationTimestamp });
    await this.env.KV_STORAGE.put(
      `streams:${streamId}`,
      JSON.stringify({ data, expirationTimestamp }),
    );
  }

  // New method to get stream data
  async getStreamData(streamId) {
    const streamEntry = await this.env.KV_STORAGE.get(`streams:${streamId}`);
    if (!streamEntry) {
      return null;
    }

    const { data, expirationTimestamp } = JSON.parse(streamEntry);
    if (Date.now() > expirationTimestamp) {
      // await this.state.storage.delete(streamId); // Clean up expired entry
      await this.deleteStreamData(`streams:${streamId}`);
      return null;
    }

    return data;
  }

  // New method to delete stream data (cleanup)
  async deleteStreamData(streamId) {
    await this.env.KV_STORAGE.delete(`streams:${streamId}`);
  }
}
