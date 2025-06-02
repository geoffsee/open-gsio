import {types, Instance} from "mobx-state-tree";
import clientChatStore from "./ClientChatStore";
import UserOptionsStore from "./UserOptionsStore";
import Message from "../models/Message";
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
                        clientChatStore.updateLast("Too many requests • please slow down.");
                        clientChatStore.setIsLoading(false);
                        UserOptionsStore.setFollowModeEnabled(false);
                        return;
                    }
                    if (response.status > 200) {
                        clientChatStore.updateLast("Error • something went wrong.");
                        clientChatStore.setIsLoading(false);
                        UserOptionsStore.setFollowModeEnabled(false);
                        return;
                    }

                    const {streamUrl} = await response.json();
                    const eventSource = new EventSource(streamUrl);

                    eventSource.onmessage = (event) => {
                        try {
                            const parsed = JSON.parse(event.data);
                            if (parsed.type === "error") {
                                clientChatStore.updateLast(parsed.error);
                                clientChatStore.setIsLoading(false);
                                UserOptionsStore.setFollowModeEnabled(false);
                                eventSource.close();
                                return;
                            }

                            if (parsed.type === "chat" && parsed.data.choices[0]?.finish_reason === "stop") {
                                clientChatStore.appendLast(parsed.data.choices[0]?.delta?.content ?? "");
                                clientChatStore.setIsLoading(false);
                                UserOptionsStore.setFollowModeEnabled(false);
                                eventSource.close();
                                return;
                            }

                            if (parsed.type === "chat") {
                                clientChatStore.appendLast(parsed.data.choices[0]?.delta?.content ?? "");
                            }
                        } catch (err) {
                            console.error("stream parse error", err);
                        }
                    };

                    eventSource.onerror = () => {
                        clientChatStore.updateLast("Error • connection lost.");
                        clientChatStore.setIsLoading(false);
                        UserOptionsStore.setFollowModeEnabled(false);
                        eventSource.close();
                    };
                } catch (err) {
                    console.error("sendMessage", err);
                    clientChatStore.updateLast("Sorry • network error.");
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
