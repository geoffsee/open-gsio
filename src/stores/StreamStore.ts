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
    .model("StreamStore", {
        streamId: types.optional(types.string, ""),
    })
    .volatile(() => ({
        eventSource: null as EventSource | null,
    }))
    .actions((self: any) => {                  // ← annotate `self` so it isn’t implicitly `any`
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
                console.error("error closing event source", e);
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
                role: "user" as const,
            });
            root.add(userMessage);
            root.setInput("");

            try {
                const payload = { messages: root.items.slice(), model: root.model };

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
                    UserOptionsStore.setFollowModeEnabled(false);
                    return;
                }
                if (response.status > 200) {
                    root.updateLast("Error • something went wrong.");
                    cleanup();
                    UserOptionsStore.setFollowModeEnabled(false);
                    return;
                }

                const { streamUrl } = (yield response.json()) as { streamUrl: string };
                setEventSource(new EventSource(streamUrl));

                const handleMessage = (event: MessageEvent) => {
                    try {
                        const parsed = JSON.parse(event.data);
                        if (parsed.type === "error") {
                            root.updateLast(parsed.error);
                            root.setIsLoading(false);
                            UserOptionsStore.setFollowModeEnabled(false);
                            cleanup();
                            return;
                        }

                        if (
                            parsed.type === "chat" &&
                            parsed.data.choices[0]?.finish_reason === "stop"
                        ) {
                            root.appendLast(parsed.data.choices[0]?.delta?.content ?? "");
                            UserOptionsStore.setFollowModeEnabled(false);
                            root.setIsLoading(false);
                            cleanup();
                            return;
                        }

                        if (parsed.type === "chat") {
                            root.appendLast(parsed.data.choices[0]?.delta?.content ?? "");
                        }
                    } catch (err) {
                        console.error("stream parse error", err);
                    }
                };

                const handleError = () => {
                    root.updateLast("Error • connection lost.");
                    root.setIsLoading(false);
                    UserOptionsStore.setFollowModeEnabled(false);
                    cleanup();
                };

                self.eventSource.onmessage = handleMessage;
                self.eventSource.onerror = handleError;
            } catch (err) {
                console.error("sendMessage", err);
                root.updateLast("Sorry • network error.");
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

export interface IStreamStore extends Instance<typeof StreamStore> {}
