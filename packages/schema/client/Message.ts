import { types } from "mobx-state-tree";

// Simple function to generate a unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export default types
  .model("Message", {
    id: types.optional(types.identifier, generateId),
    content: types.string,
    role: types.enumeration(["user", "assistant"]),
  })
  .actions((self) => ({
    setContent(newContent: string) {
      self.content = newContent;
    },
    append(newContent: string) {
      self.content += newContent;
    },
  }));
