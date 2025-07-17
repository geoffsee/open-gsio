import { flow, getParent, type Instance, types } from 'mobx-state-tree';

import Message, { batchContentUpdate } from '../models/Message';

import clientChatStore from './ClientChatStore.ts';
import type { MapControlCommand } from './MapStore';
import type { RootDeps } from './RootDeps.ts';
import UserOptionsStore from './UserOptionsStore';

export const StreamStore = types
  .model('StreamStore', {
    streamId: types.optional(types.string, ''),
  })
  .volatile(() => ({
    eventSource: undefined as unknown as EventSource,
  }))
  .actions((self: any) => {
    // ← annotate `self` so it isn’t implicitly `any`
    let root: RootDeps;
    try {
      root = getParent<RootDeps>(self);
    } catch {
      root = self as any;
    }

    function setEventSource(source: EventSource | null) {
      self.eventSource = source;
    }

    function cleanup() {
      try {
        self.eventSource.close();
      } catch (e) {
        console.error('error closing event source', e);
      } finally {
        setEventSource(null);
      }
    }

    const sendMessage = flow(function* () {
      if (!root.input.trim() || root.isLoading) return;
      cleanup();

      // ← **DO NOT** `yield` a synchronous action
      UserOptionsStore.setFollowModeEnabled(true);
      root.setIsLoading(true);

      const userMessage = Message.create({
        content: root.input,
        role: 'user' as const,
      });
      root.add(userMessage);
      root.setInput('');

      try {
        const payload = { messages: root.items.slice(), model: root.model };

        yield new Promise(r => setTimeout(r, 500));
        root.add(Message.create({ content: '', role: 'assistant' }));

        const response: Response = yield fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.status === 429) {
          root.appendLast('\n\nError: Too many requests • please slow down.');
          cleanup();
          UserOptionsStore.setFollowModeEnabled(false);
          return;
        }
        if (response.status > 200) {
          root.appendLast('\n\nError: Something went wrong.');
          cleanup();
          UserOptionsStore.setFollowModeEnabled(false);
          return;
        }

        const { streamUrl } = (yield response.json()) as { streamUrl: string };

        setEventSource(new EventSource(streamUrl));

        const handleMessage = (event: MessageEvent) => {
          try {
            const parsed = JSON.parse(event.data);

            if (parsed.type === 'error') {
              // Append error message instead of replacing content
              root.appendLast('\n\nError: ' + parsed.error);
              root.setIsLoading(false);
              UserOptionsStore.setFollowModeEnabled(false);
              cleanup();
              return;
            }

            // Handle tool call responses
            if (parsed.type === 'tool_result') {
              console.log('[DEBUG_LOG] Received tool result:', parsed);

              // Check if this is a map control tool call
              if (parsed.tool_name === 'maps_control' && parsed.result?.data) {
                const mapCommand: MapControlCommand = {
                  action: parsed.result.data.action,
                  value: parsed.args?.value,
                  data: parsed.result.data,
                };

                console.log('[DEBUG_LOG] Processing map command:', mapCommand);

                // Execute the map command through the store
                if ('executeMapCommand' in root) {
                  (root as any).executeMapCommand(mapCommand);
                } else {
                  console.warn('[DEBUG_LOG] MapStore not available in root');
                }
              }
              return;
            }

            // Get the last message
            const lastMessage = root.items[root.items.length - 1];

            if (parsed.type === 'chat' && parsed.data.choices[0]?.finish_reason === 'stop') {
              // For the final chunk, append it and close the connection
              const content = parsed.data.choices[0]?.delta?.content ?? '';
              if (content) {
                // Use appendLast for the final chunk to ensure it's added immediately
                root.appendLast(content);
              }
              UserOptionsStore.setFollowModeEnabled(false);
              root.setIsLoading(false);
              cleanup();
              return;
            }

            if (parsed.type === 'chat') {
              // For regular chunks, use the batched content update for a smoother effect
              const content = parsed.data.choices[0]?.delta?.content ?? '';
              if (content && lastMessage) {
                // Use the batching utility for more efficient updates
                batchContentUpdate(lastMessage, content);
              }
            }
          } catch (err) {
            console.error('stream parse error', err);
          }
        };

        const handleError = () => {
          root.appendLast('\n\nError: Connection lost.');
          root.setIsLoading(false);
          UserOptionsStore.setFollowModeEnabled(false);
          cleanup();
        };

        self.eventSource.onmessage = handleMessage;
        self.eventSource.onerror = handleError;
      } catch (err) {
        console.error('sendMessage', err);
        root.appendLast('\n\nError: Sorry • network error.');
        root.setIsLoading(false);
        UserOptionsStore.setFollowModeEnabled(false);
        cleanup();
      }
    });

    const stopIncomingMessage = () => {
      cleanup();
      root.setIsLoading(false);
      UserOptionsStore.setFollowModeEnabled(false);
    };

    const setStreamId = (id: string) => {
      self.streamId = id;
    };

    return { sendMessage, stopIncomingMessage, cleanup, setEventSource, setStreamId };
  });

export type IStreamStore = Instance<typeof StreamStore>;
