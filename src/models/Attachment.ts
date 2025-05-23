import { types } from "mobx-state-tree";

export default types.model("Attachment", {
  content: types.string,
  url: types.string,
});
