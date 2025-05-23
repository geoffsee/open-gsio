import { WorkflowOperator } from "manifold-workflow-engine";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const QuerySchema = z.object({
  query: z.string(),
});

export function createNewsWebhookOperator({
  eventHost,
  streamId,
  openai,
  messages,
}) {
  return new WorkflowOperator("news-search", async (state: any) => {
    const { latestUserMessage } = state;
    console.log(`Processing user message: ${latestUserMessage}`);

    const resource = "news-search";
    const input = await getQueryFromContext({
      openai,
      messages,
      latestUserMessage,
    });

    const eventSource = new URL(eventHost);
    const url = `${eventSource}api/webhooks`;
    console.log({ url });

    const stream = {
      id: crypto.randomUUID(),
      parent: streamId,
      resource,
      payload: input,
    };
    const createStreamResponse = await fetch(`${eventSource}api/webhooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: stream.id,
        parent: streamId,
        resource: "news-search",
        payload: {
          input,
        },
      }),
    });
    const raw = await createStreamResponse.text();
    const { stream_url } = JSON.parse(raw);
    const surl = eventHost + stream_url;
    const webhook = { url: surl, id: stream.id, resource };

    return {
      ...state,
      webhook,
      latestUserMessage: "",
      latestAiMessage: "",
    };
  });

  async function getQueryFromContext({ messages, openai, latestUserMessage }) {
    const systemMessage = {
      role: "system",
      content: `Analyze the latest message in a conversation and generate a JSON object with a single implied question for a news search. The JSON should be structured as follows:

{
  "query": "<question to be answered by a news search>"
}

## Example
{
  "query": "When was the last Buffalo Sabres hockey game?"
}

Focus on the most recent message to determine the query. Output only the JSON object without any additional text.`,
    };

    const conversation = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    conversation.push({ role: "user", content: `${latestUserMessage}` });

    const m = [systemMessage, ...conversation];

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: m,
      temperature: 0,
      response_format: zodResponseFormat(QuerySchema, "query"),
    });

    const { query } = completion.choices[0].message.parsed;

    console.log({ newsWebhookQuery: query });

    return query;
  }
}
