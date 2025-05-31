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
