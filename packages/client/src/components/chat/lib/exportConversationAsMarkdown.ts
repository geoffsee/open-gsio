// Function to generate a Markdown representation of the current conversation
import { type IMessage } from "../../../stores/ClientChatStore";
import { type Instance } from "mobx-state-tree";

export function formatConversationMarkdown(
  messages: Instance<typeof IMessage>[],
): string {
  return messages
    .map((message) => {
      if (message.role === "user") {
        return `**You**: ${message.content}`;
      } else if (message.role === "assistant") {
        return `**Geoff's AI**: ${message.content}`;
      }
      return "";
    })
    .join("\n\n");
}
