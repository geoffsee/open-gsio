import { types, flow } from "mobx-state-tree";

// Utility to pause execution inside a flow
const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

// Simple function to generate a unique ID
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Utility for efficient batched content updates
let batchedContent = "";
let batchUpdateTimeout: NodeJS.Timeout | null = null;
const BATCH_UPDATE_DELAY = 50; // ms

export const batchContentUpdate = (message: any, content: string) => {
    if (!content) return;

    // Add the content to the batch
    batchedContent += content;

    // If we already have a timeout scheduled, do nothing
    if (batchUpdateTimeout) return;

    // Schedule a timeout to apply the batched content
    batchUpdateTimeout = setTimeout(() => {
        if (message && batchedContent) {
            message.append(batchedContent);
            batchedContent = "";
        }
        batchUpdateTimeout = null;
    }, BATCH_UPDATE_DELAY);
};

const Message = types
    .model("Message", {
        id: types.optional(types.identifier, generateId),
        content: types.string,
        role: types.enumeration(["user", "assistant"]),
    })
    // Runtime‑only flags that never persist or get serialized
    .volatile(() => ({
        /** Indicates that characters are still being streamed in */
        isStreaming: false,
    }))
    .actions((self) => {
        // Basic mutators ---------------------------------------------------------
        const setContent = (newContent: string) => {
            self.content = newContent;
        };

        const append = (newContent: string) => {
            self.content += newContent;
        };

        /**
         * Stream content into the message for a smooth “typing” effect.
         * @param newContent The full text to stream in.
         * @param chunkSize  How many characters to reveal per tick (default 3).
         * @param delay      Delay (ms) between ticks (default 20 ms).
         */
        const streamContent = flow(function* (
            newContent: string,
            chunkSize = 3,
            delay = 20
        ) {
            self.isStreaming = true;
            let pointer = 0;

            // Reveal the content chunk‑by‑chunk
            while (pointer < newContent.length) {
                append(newContent.slice(pointer, pointer + chunkSize));
                pointer += chunkSize;
                yield sleep(delay);
            }

            self.isStreaming = false; // finished
        });

        return { setContent, append, streamContent };
    });

export default Message;
