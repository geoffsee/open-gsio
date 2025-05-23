// models/IntermediateStep.ts
import { types } from "mobx-state-tree";

export default types.model("IntermediateStep", {
  kind: types.string,
  data: types.frozen(), // Allows storing any JSON-serializable data
});
