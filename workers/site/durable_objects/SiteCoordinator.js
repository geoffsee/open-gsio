import { DurableObject } from "cloudflare:workers";

export default class SiteCoordinator extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.state = state;
    this.env = env;
  }

  async dynamicMaxTokens(input, maxOuputTokens) {
    return 2000;
  }

  async getConversationHistory(conversationId) {
    const history = await this.env.KV_STORAGE.get(
      `conversations:${conversationId}`,
    );

    return JSON.parse(history) || [];
  }

  async saveConversationHistory(conversationId, message) {
    const history = await this.getConversationHistory(conversationId);
    history.push(message);
    await this.env.KV_STORAGE.put(
      `conversations:${conversationId}`,
      JSON.stringify(history),
    );
  }

  async saveStreamData(streamId, data, ttl = 10) {
    const expirationTimestamp = Date.now() + ttl * 1000;
    // await this.state.storage.put(streamId, { data, expirationTimestamp });
    await this.env.KV_STORAGE.put(
      `streams:${streamId}`,
      JSON.stringify({ data, expirationTimestamp }),
    );
  }

  async getStreamData(streamId) {
    const streamEntry = await this.env.KV_STORAGE.get(`streams:${streamId}`);
    if (!streamEntry) {
      return null;
    }

    const { data, expirationTimestamp } = JSON.parse(streamEntry);
    if (Date.now() > expirationTimestamp) {
      await this.deleteStreamData(`streams:${streamId}`);
      return null;
    }

    return data;
  }

  async deleteStreamData(streamId) {
    await this.env.KV_STORAGE.delete(`streams:${streamId}`);
  }
}
