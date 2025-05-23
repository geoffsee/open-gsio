import { WorkflowOperator } from "manifold-workflow-engine";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const UrlActionSchema = z.object({
  url: z.string(),
  query: z.string(),
  action: z.enum(["read", "scrape", "crawl", ""]),
});

export function createScrapeWebhookOperator({
  eventHost,
  streamId,
  openai,
  messages,
}) {
  return new WorkflowOperator("web-scrape", async (state: any) => {
    const { latestUserMessage } = state;

    const webscrapeWebhookEndpoint = "/api/webhooks";

    const resource = "web-scrape";
    const context = await getQueryFromContext({
      openai,
      messages,
      latestUserMessage,
    });

    const input = {
      url: context?.url,
      action: context?.action,
      query: context.query,
    };

    const eventSource = new URL(eventHost);
    const url = `${eventSource}api/webhooks`;

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
        resource: "web-scrape",
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
}

async function getQueryFromContext({ messages, openai, latestUserMessage }) {
  const systemMessage = {
    role: "system" as const,
    content:
      `You are modeling a structured output containing a single question, a URL, and an action, all relative to a single input.

Return the result as a JSON object in the following structure:
{
  "url": "Full URL in the conversation that references the URL being interacted with. No trailing slash!",
  "query": "Implied question about the resources at the URL.",
  "action": "read | scrape | crawl"
}

- The input being modeled is conversational data from a different conversation than this one.
- Intent should represent a next likely action the system might take to satisfy or enhance the user's request.

Instructions:
1. Analyze the provided context and declare the url, action, and question implied by the latest message.

Output the JSON object. Do not include any additional explanations or text.`.trim(),
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
    response_format: zodResponseFormat(UrlActionSchema, "UrlActionSchema"),
  });

  const { query, action, url } = completion.choices[0].message.parsed;

  return { query, action, url };
}
