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
        editMessage(message: Instance<typeof Message>, newContent: string) {
            // Find the index of the message in the items array
            const messageIndex = self.items.map(i => i.id).indexOf(message.id);
            if (messageIndex === -1) {
                // Message not found in the items array
                return false;
            }

            // Update the message content
            message.setContent(newContent);

            // Remove all messages after the edited message
            self.removeAfter(messageIndex);

            return true;
        },
    }));

export interface IMessagesStore extends Instance<typeof MessagesStore> {}
