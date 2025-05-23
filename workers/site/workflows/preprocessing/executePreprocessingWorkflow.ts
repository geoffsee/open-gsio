import { createPreprocessingWorkflow } from "./createPreprocessingWorkflow";

export async function executePreprocessingWorkflow({
  latestUserMessage,
  latestAiMessage,
  eventHost,
  streamId,
  chat: { messages, openai },
}) {
  console.log(`Executing executePreprocessingWorkflow`);
  const initialState = { latestUserMessage, latestAiMessage };

  // Add execution tracking flag to prevent duplicate runs
  const executionKey = `preprocessing-${crypto.randomUUID()}`;
  if (globalThis[executionKey]) {
    console.log("Preventing duplicate preprocessing workflow execution");
    return globalThis[executionKey];
  }

  const workflows = {
    preprocessing: createPreprocessingWorkflow({
      eventHost,
      initialState,
      streamId,
      chat: { messages, openai },
    }),
    results: new Map(),
  };

  try {
    // Store the promise to prevent parallel executions
    globalThis[executionKey] = (async () => {
      await workflows.preprocessing.navigate(latestUserMessage);
      await workflows.preprocessing.executeWorkflow(latestUserMessage);
      console.log(
        `executePreprocessingWorkflow::workflow::preprocessing::results`,
        { state: JSON.stringify(workflows.preprocessing.state, null, 2) },
      );
      workflows.results.set("preprocessed", workflows.preprocessing.state);

      // Cleanup after execution
      setTimeout(() => {
        delete globalThis[executionKey];
      }, 1000);

      return workflows;
    })();

    return await globalThis[executionKey];
  } catch (error) {
    delete globalThis[executionKey];
    throw new Error("Workflow execution failed");
  }
}
