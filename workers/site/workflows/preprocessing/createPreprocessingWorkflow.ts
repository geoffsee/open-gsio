import {
  ManifoldRegion,
  WorkflowFunctionManifold,
} from "manifold-workflow-engine";
import { createIntentService } from "../IntentService";
import { createSearchWebhookOperator } from "./webOperator";
import { createNewsWebhookOperator } from "./newsOperator";
import { createScrapeWebhookOperator } from "./scrapeOperator";

export const createPreprocessingWorkflow = ({
  eventHost,
  initialState,
  streamId,
  chat: { messages, openai },
}) => {
  const preprocessingManifold = new WorkflowFunctionManifold(
    createIntentService({ messages, openai }),
  );
  preprocessingManifold.state = { ...initialState };

  const searchWebhookOperator = createSearchWebhookOperator({
    eventHost,
    streamId,
    openai,
    messages,
  });
  const newsWebhookOperator = createNewsWebhookOperator({
    eventHost,
    streamId,
    openai,
    messages,
  });
  const scrapeWebhookOperator = createScrapeWebhookOperator({
    eventHost,
    streamId,
    openai,
    messages,
  });

  const preprocessingRegion = new ManifoldRegion("preprocessingRegion", [
    searchWebhookOperator,
    newsWebhookOperator,
    scrapeWebhookOperator,
  ]);

  preprocessingManifold.addRegion(preprocessingRegion);

  return preprocessingManifold;
};
