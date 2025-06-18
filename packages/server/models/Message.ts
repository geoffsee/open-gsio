// Base Message
import { type Instance, types } from "mobx-state-tree";

export default types
  .model("Message", {
    content: types.string,
    role: types.enumeration(["user", "assistant", "system"]),
  })
  .actions((self) => ({
    setContent(newContent: string) {
      self.content = newContent;
    },
    append(newContent: string) {
      self.content += newContent;
    },
  }));

export type MessageType = Instance<typeof this>;
