import { types, flow, getSnapshot } from "mobx-state-tree";
import FeedbackRecord from "../models/FeedbackRecord.ts";

export default types
  .model("FeedbackStore", {})
  .volatile((self) => ({
    env: {} as Env,
    ctx: {} as ExecutionContext,
  }))
  .actions((self) => ({
    setEnv(env: Env) {
      self.env = env;
    },
    setCtx(ctx: ExecutionContext) {
      self.ctx = ctx;
    },
    handleFeedback: flow(function* (request: Request) {
      try {
        const {
          feedback,
          timestamp = new Date().toISOString(),
          user = "Anonymous",
        } = yield request.json();

        const feedbackRecord = FeedbackRecord.create({
          feedback,
          timestamp,
          user,
        });

        const feedbackId = crypto.randomUUID();
        yield self.env.KV_STORAGE.put(
          `feedback:${feedbackId}`,
          JSON.stringify(getSnapshot(feedbackRecord)),
        );

        yield self.env.EMAIL_SERVICE.sendMail({
          to: "geoff@seemueller.io",
          plaintextMessage: `NEW FEEDBACK SUBMISSION
User: ${user}
Feedback: ${feedback}
Timestamp: ${timestamp}`,
        });

        return new Response("Feedback saved successfully", { status: 200 });
      } catch (error) {
        console.error("Error processing feedback request:", error);
        return new Response("Failed to process feedback request", {
          status: 500,
        });
      }
    }),
  }));
