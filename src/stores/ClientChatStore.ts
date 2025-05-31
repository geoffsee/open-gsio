// ---------------------------
// stores/MessagesStore.ts
// ---------------------------
import { Instance, types } from "mobx-state-tree";
import Message from "../models/Message";

export const MessagesStore = types
    .model("MessagesStore", {
      items: types.optional(types.array(Message), []),
    })
    .actions((self) => ({
      add(message: Instance<typeof Message>) {
        self.items.push(message);
      },
      updateLast(content: string) {
        if (self.items.length) {
          self.items[self.items.length - 1].content = content;
        }
      },
      appendLast(content: string) {
        if (self.items.length) {
          self.items[self.items.length - 1].content += content;
        }
      },
      removeAfter(index: number) {
        if (index >= 0 && index < self.items.length) {
          self.items.splice(index + 1);
        }
      },
      reset() {
        self.items.clear();
      },
    }));

export interface IMessagesStore extends Instance<typeof MessagesStore> {}

// ---------------------------
// stores/UIStore.ts
// ---------------------------
import { Instance, types } from "mobx-state-tree";

export const UIStore = types
    .model("UIStore", {
      input: types.optional(types.string, ""),
      isLoading: types.optional(types.boolean, false),
    })
    .actions((self) => ({
      setInput(value: string) {
        self.input = value;
      },
      setIsLoading(value: boolean) {
        self.isLoading = value;
      },
    }));

export interface IUIStore extends Instance<typeof UIStore> {}

// ---------------------------
// stores/ModelStore.ts
// ---------------------------
import { Instance, types } from "mobx-state-tree";

export const ModelStore = types
    .model("ModelStore", {
      model: types.optional(
          types.string,
          "meta-llama/llama-4-scout-17b-16e-instruct",
      ),
      imageModel: types.optional(types.string, "black-forest-labs/flux-1.1-pro"),
      supportedModels: types.optional(types.array(types.string), []),
    })
    .actions((self) => ({
      setModel(value: string) {
        self.model = value;
        try {
          localStorage.setItem("recentModel", value);
        } catch (_) {}
      },
      setImageModel(value: string) {
        self.imageModel = value;
      },
      setSupportedModels(list: string[]) {
        self.supportedModels = list;
        if (!list.includes(self.model)) {
          // fall back to last entry (arbitrary but predictable)
          self.model = list[list.length - 1] ?? self.model;
        }
      },
    }));

export interface IModelStore extends Instance<typeof ModelStore> {}

// ---------------------------
// stores/StreamStore.ts
// Handles networking + SSE lifecycle.
// Depends on MessagesStore, UIStore, and ModelStore via composition.
// ---------------------------
import {
  getParent,
  Instance,
  flow,
  types,
} from "mobx-state-tree";
import type { IMessagesStore } from "./MessagesStore";
import type { IUIStore } from "./UIStore";
import type { IModelStore } from "./ModelStore";
import UserOptionsStore from "./UserOptionsStore";
import Message from "../models/Message";

interface RootDeps extends IMessagesStore, IUIStore, IModelStore {}

export const StreamStore = types
    .model("StreamStore", {})
    .volatile(() => ({
      eventSource: null as EventSource | null,
    }))
    .actions((self) => {
      // helpers
      const root = getParent<RootDeps>(self);

      function cleanup() {
        if (self.eventSource) {
          self.eventSource.close();
          self.eventSource = null;
        }
      }

      const sendMessage = flow(function* () {
        if (!root.input.trim() || root.isLoading) return;
        cleanup();
        yield UserOptionsStore.setFollowModeEnabled(true);
        root.setIsLoading(true);

        const userMessage = Message.create({
          content: root.input,
          role: "user" as const,
        });
        root.add(userMessage);
        root.setInput("");

        try {
          const payload = { messages: root.items.slice(), model: root.model };
          // optimistic UI delay (demo‑purpose)
          yield new Promise((r) => setTimeout(r, 500));
          root.add(Message.create({ content: "", role: "assistant" }));

          const response: Response = yield fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (response.status === 429) {
            root.updateLast("Too many requests • please slow down.");
            cleanup();
            return;
          }
          if (response.status > 200) {
            root.updateLast("Error • something went wrong.");
            cleanup();
            return;
          }

          const { streamUrl } = (yield response.json()) as { streamUrl: string };
          self.eventSource = new EventSource(streamUrl);

          self.eventSource.onmessage = (event) => {
            try {
              const parsed = JSON.parse(event.data);
              if (parsed.type === "error") {
                root.updateLast(parsed.error);
                cleanup();
                root.setIsLoading(false);
                return;
              }

              if (
                  parsed.type === "chat" &&
                  parsed.data.choices[0]?.finish_reason === "stop"
              ) {
                root.appendLast(parsed.data.choices[0]?.delta?.content ?? "");
                cleanup();
                root.setIsLoading(false);
                return;
              }

              if (parsed.type === "chat") {
                root.appendLast(parsed.data.choices[0]?.delta?.content ?? "");
              }
            } catch (err) {
              console.error("stream parse error", err);
            }
          };

          self.eventSource.onerror = () => cleanup();
        } catch (err) {
          console.error("sendMessage", err);
          root.updateLast("Sorry • network error.");
          cleanup();
          root.setIsLoading(false);
        }
      });

      const stopIncomingMessage = () => {
        cleanup();
        root.setIsLoading(false);
      };

      return { sendMessage, stopIncomingMessage, cleanup };
    });

export interface IStreamStore extends Instance<typeof StreamStore> {}

// ---------------------------
// stores/ClientChatStore.ts (root)
// ---------------------------
import { types } from "mobx-state-tree";
// import { MessagesStore } from "./MessagesStore";
// import { UIStore } from "./UIStore";
// import { ModelStore } from "./ModelStore";
// import { StreamStore } from "./StreamStore";

export const ClientChatStore = types
    .compose(MessagesStore, UIStore, ModelStore, StreamStore)
    .named("ClientChatStore");

export const clientChatStore = ClientChatStore.create();

export type IClientChatStore = Instance<typeof ClientChatStore>;