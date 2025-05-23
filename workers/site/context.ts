import { types, Instance, getMembers } from "mobx-state-tree";
import ContactService from "./services/ContactService";
import AssetService from "./services/AssetService";
import MetricsService from "./services/MetricsService";
import ChatService from "./services/ChatService";
import TransactionService from "./services/TransactionService";
import DocumentService from "./services/DocumentService";
import FeedbackService from "./services/FeedbackService";

const Context = types
  .model("ApplicationContext", {
    chatService: ChatService,
    contactService: types.optional(ContactService, {}),
    assetService: types.optional(AssetService, {}),
    metricsService: types.optional(MetricsService, {}),
    transactionService: types.optional(TransactionService, {}),
    documentService: types.optional(DocumentService, {}),
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

export type IRootStore = Instance<typeof Context>;

const createServerContext = (env, ctx) => {
  const instance = Context.create({
    contactService: ContactService.create({}),
    assetService: AssetService.create({}),
    transactionService: TransactionService.create({}),
    documentService: DocumentService.create({}),
    feedbackService: FeedbackService.create({}),
    metricsService: MetricsService.create({
      isCollectingMetrics: true,
    }),
    chatService: ChatService.create({
      openAIApiKey: env.OPENAI_API_KEY,
      openAIBaseURL: env.VITE_OPENAI_API_ENDPOINT,
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

export { createServerContext };

export default Context;
