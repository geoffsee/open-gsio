import { types, Instance, getMembers } from "mobx-state-tree";
import ContactService from "./services/ContactService.ts";
import AssetService from "./services/AssetService.ts";
import MetricsService from "./services/MetricsService.ts";
import ChatService from "./services/ChatService.ts";
import TransactionService from "./services/TransactionService.ts";
import FeedbackService from "./services/FeedbackService.ts";


const RequestContext = types
  .model("RequestContext", {
    chatService: ChatService,
    contactService: types.optional(ContactService, {}),
    assetService: types.optional(AssetService, {}),
    metricsService: types.optional(MetricsService, {}),
    transactionService: types.optional(TransactionService, {}),
    feedbackService: types.optional(FeedbackService, {}),
  })
  .actions((self) => {
    const services = Object.keys(getMembers(self).properties);

    return {
      setEnv(env: Env) {
        services.forEach((service) => {
          if (typeof self[service]?.setEnv === "function") {
            self[service].setEnv(env);
          }
        });
      },
      setCtx(ctx: ExecutionContext) {
        services.forEach((service) => {
          if (typeof self[service]?.setCtx === "function") {
            self[service].setCtx(ctx);
          }
        });
      },
    };
  });

export type IRootStore = Instance<typeof RequestContext>;

const createRequestContext = (env, ctx) => {
  const instance = RequestContext.create({
    contactService: ContactService.create({}),
    assetService: AssetService.create({}),
    transactionService: TransactionService.create({}),
    feedbackService: FeedbackService.create({}),
    metricsService: MetricsService.create({
      isCollectingMetrics: true,
    }),
    chatService: ChatService.create({
      openAIApiKey: env.OPENAI_API_KEY,
      openAIBaseURL: env.OPENAI_API_ENDPOINT,
      activeStreams: undefined,
      maxTokens: 16384,
      systemPrompt:
        "You are an assistant designed to provide accurate, concise, and context-aware responses while demonstrating your advanced reasoning capabilities.",
    }),
  });
  instance.setEnv(env);
  instance.setCtx(ctx);
  return instance;
};

export { createRequestContext };

export default RequestContext;
