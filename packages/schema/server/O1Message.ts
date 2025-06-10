import { types } from "mobx-state-tree";

export default types
  .model("O1Message", {
    role: types.enumeration(["user", "assistant", "system"]),
    content: types.array(
      types.model({
        type: types.string,
        text: types.string,
      }),
    ),
  })
  .actions((self) => ({
    setContent(newContent: string, contentType: string = "text") {
      self.content = [{ type: contentType, text: newContent }];
    },
    append(newContent: string, contentType: string = "text") {
      self.content.push({ type: contentType, text: newContent });
    },
  }));
