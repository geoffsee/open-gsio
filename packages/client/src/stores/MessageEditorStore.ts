import {types, type Instance} from "mobx-state-tree";
import clientChatStore from "./ClientChatStore";
import UserOptionsStore from "./UserOptionsStore";
import Message, { batchContentUpdate } from "../models/Message";
import {MessagesStore} from "./MessagesStore";

export const MessageEditorStore = types
    .compose(
        MessagesStore,
        types.model("MessageEditorStore", {
            editedContent: types.optional(types.string, ""),
            messageId: types.optional(types.string, "")
        })
    )
    .views((self) => ({
        getMessage() {
            // Find the message in clientChatStore by ID
            if (!self.messageId) return null;

            const message = clientChatStore.items.find(item => item.id === self.messageId);
            return message || null;
        }
    }))
    .actions((self) => ({
        setEditedContent(content: string) {
            self.editedContent = content;
        },
        setMessage(message: Instance<typeof Message>) {
            // Handle messages that might not have an id property (for testing)
            self.messageId = message.id || "";
            self.editedContent = message.content;
        },
        onCancel() {
            self.messageId = "";
            self.editedContent = "";
        },
        handleSave: async () => {
            // Get the message using the ID
            const message = self.getMessage();

            // Check if message reference is still valid
            if (!message) {
                // Message reference is no longer valid, just cancel the edit
                self.onCancel();
                return;
            }

            // Store the content we want to update
            const contentToUpdate = self.editedContent;

            try {
                // Use the editMessage function from MessagesStore
                const success = clientChatStore.editMessage(message, contentToUpdate);
                if (!success) {
                    // Message not found in the items array, just cancel
                    self.onCancel();
                    return;
                }

                // Set follow mode and loading state
                UserOptionsStore.setFollowModeEnabled(true);
                clientChatStore.setIsLoading(true);

                try {
                    // Add a small delay before adding the assistant message (for better UX)
                    await new Promise((r) => setTimeout(r, 500));

                    // Add an empty assistant message to clientChatStore's items
                    clientChatStore.add(Message.create({content: "", role: "assistant"}));
                    // Use clientChatStore for the API call since it has the model property
                    const payload = {messages: clientChatStore.items.slice(), model: clientChatStore.model};

                    // Make API call
                    const response = await fetch("/api/chat", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(payload),
                    });

                    if (response.status === 429) {
                        clientChatStore.appendLast("\n\nError: Too many requests • please slow down.");
                        clientChatStore.setIsLoading(false);
                        UserOptionsStore.setFollowModeEnabled(false);
                        return;
                    }
                    if (response.status > 200) {
                        clientChatStore.appendLast("\n\nError: Something went wrong.");
                        clientChatStore.setIsLoading(false);
                        UserOptionsStore.setFollowModeEnabled(false);
                        return;
                    }

                    const {streamUrl} = await response.json();

                    // Use the StreamStore's functionality to handle the event source
                    const eventSource = new EventSource(streamUrl);

                    // Set up event handlers using a more efficient approach
                    const handleMessage = (event) => {
                        try {
                            const parsed = JSON.parse(event.data);

                            if (parsed.type === "error") {
                                // Append error message instead of replacing content
                                clientChatStore.appendLast("\n\nError: " + parsed.error);
                                clientChatStore.setIsLoading(false);
                                UserOptionsStore.setFollowModeEnabled(false);
                                eventSource.close();
                                return;
                            }

                            // Get the last message to use its streamContent method
                            const lastMessage = clientChatStore.items[clientChatStore.items.length - 1];

                            if (parsed.type === "chat" && parsed.data.choices[0]?.finish_reason === "stop") {
                                // For the final chunk, append it and close the connection
                                const content = parsed.data.choices[0]?.delta?.content ?? "";
                                if (content) {
                                    // Use appendLast for the final chunk to ensure it's added immediately
                                    clientChatStore.appendLast(content);
                                }
                                clientChatStore.setIsLoading(false);
                                UserOptionsStore.setFollowModeEnabled(false);
                                eventSource.close();
                                return;
                            }

                            if (parsed.type === "chat") {
                                // For regular chunks, use the batched content update for a smoother effect
                                const content = parsed.data.choices[0]?.delta?.content ?? "";
                                if (content && lastMessage) {
                                    // Use the batching utility for more efficient updates
                                    batchContentUpdate(lastMessage, content);
                                }
                            }
                        } catch (err) {
                            console.error("stream parse error", err);
                        }
                    };

                    const handleError = () => {
                        clientChatStore.appendLast("\n\nError: Connection lost.");
                        clientChatStore.setIsLoading(false);
                        UserOptionsStore.setFollowModeEnabled(false);
                        eventSource.close();
                    };

                    eventSource.onmessage = handleMessage;
                    eventSource.onerror = handleError;
                } catch (err) {
                    console.error("sendMessage", err);
                    clientChatStore.appendLast("\n\nError: Sorry • network error.");
                    clientChatStore.setIsLoading(false);
                    UserOptionsStore.setFollowModeEnabled(false);
                }
            } catch (err) {
                console.error("Error in handleSave:", err);
                // If any error occurs, just cancel the edit
                self.onCancel();
                return;
            }

            // Always clean up at the end
            self.onCancel();
        }
    }));

const messageEditorStore = MessageEditorStore.create();

export default messageEditorStore;
