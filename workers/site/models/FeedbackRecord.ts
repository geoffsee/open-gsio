// FeedbackRecord.ts
import { types } from "mobx-state-tree";

const FeedbackRecord = types.model("FeedbackRecord", {
  feedback: types.string,
  timestamp: types.string,
  user: types.optional(types.string, "Anonymous"),
});

export default FeedbackRecord;
