import { OpenAI } from "openai";
import Message from "../models/Message";
import { executePreprocessingWorkflow } from "../workflows";
import { MarkdownSdk } from "./markdown-sdk";
import { AssistantSdk } from "./assistant-sdk";
import { IMessage } from "../../../src/stores/ClientChatStore";
import { getModelFamily } from "../../../src/components/chat/SupportedModels";

export class ChatSdk {
  static async preprocess({
    tools,
    messages,
    contextContainer,
    eventHost,
    streamId,
    openai,
    env,
  }) {
    const { latestAiMessage, latestUserMessage } =
      ChatSdk.extractMessageContext(messages);

    if (tools.includes("web-search")) {
      try {
        const { results } = await executePreprocessingWorkflow({
          latestUserMessage,
          latestAiMessage,
          eventHost,
          streamId,
          chat: {
            messages,
            openai,
          },
        });

        const { webhook } = results.get("preprocessed");

        if (webhook) {
          const objectId = env.SITE_COORDINATOR.idFromName("stream-index");

          const durableObject = env.SITE_COORDINATOR.get(objectId);

          await durableObject.saveStreamData(
            streamId,
            JSON.stringify({
              webhooks: [webhook],
            }),
          );

          await durableObject.saveStreamData(
            webhook.id,
            JSON.stringify({
              parent: streamId,
              url: webhook.url,
            }),
          );
        }

        console.log("handleOpenAiStream::workflowResults", {
          webhookUrl: webhook?.url,
        });
      } catch (workflowError) {
        console.error(
          "handleOpenAiStream::workflowError::Failed to execute workflow",
          workflowError,
        );
      }
      return Message.create({
        role: "assistant",
        content: MarkdownSdk.formatContextContainer(contextContainer),
      });
    }
    return Message.create({
      role: "assistant",
      content: "",
    });
  }

  static async handleChatRequest(
    request: Request,
    ctx: {
      openai: OpenAI;
      systemPrompt: any;
      maxTokens: any;
      env: Env;
    },
  ) {
    const streamId = crypto.randomUUID();
    const { messages, model, conversationId, attachments, tools } =
      await request.json();

    if (!messages?.length) {
      return new Response("No messages provided", { status: 400 });
    }

    const contextContainer = new Map();

    const preprocessedContext = await ChatSdk.preprocess({
      tools,
      messages,
      eventHost: ctx.env.EVENTSOURCE_HOST,
      contextContainer: contextContainer,
      streamId,
      openai: ctx.openai,
      env: ctx.env,
    });

    console.log({ preprocessedContext: JSON.stringify(preprocessedContext) });

    const objectId = ctx.env.SITE_COORDINATOR.idFromName("stream-index");
    const durableObject = ctx.env.SITE_COORDINATOR.get(objectId);

    const webhooks =
      JSON.parse(await durableObject.getStreamData(streamId)) ?? {};

    await durableObject.saveStreamData(
      streamId,
      JSON.stringify({
        messages,
        model,
        conversationId,
        timestamp: Date.now(),
        attachments,
        tools,
        systemPrompt: ctx.systemPrompt,
        preprocessedContext,
        ...webhooks,
      }),
    );

    return new Response(
      JSON.stringify({
        streamUrl: `/api/streams/${streamId}`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  private static extractMessageContext(messages: any[]) {
    const latestUserMessageObj = [...messages]
      .reverse()
      .find((msg) => msg.role === "user");
    const latestAiMessageObj = [...messages]
      .reverse()
      .find((msg) => msg.role === "assistant");

    return {
      latestUserMessage: latestUserMessageObj?.content || "",
      latestAiMessage: latestAiMessageObj?.content || "",
    };
  }

  static async calculateMaxTokens(
    messages: any[],
    ctx: Record<string, any> & {
      env: Env;
      maxTokens: number;
    },
  ) {
    const objectId = ctx.env.SITE_COORDINATOR.idFromName(
      "dynamic-token-counter",
    );
    const durableObject = ctx.env.SITE_COORDINATOR.get(objectId);
    return durableObject.dynamicMaxTokens(messages, ctx.maxTokens);
  }

  static buildAssistantPrompt({ maxTokens, tools }) {
    return AssistantSdk.getAssistantPrompt({
      maxTokens,
      userTimezone: "UTC",
      userLocation: "USA/unknown",
      tools,
    });
  }

  static buildMessageChain(
    messages: any[],
    opts: {
      systemPrompt: any;
      assistantPrompt: string;
      attachments: any[];
      toolResults: IMessage;
      model: any;
    },
  ) {
    const modelFamily = getModelFamily(opts.model);

    const messagesToSend = [];

    messagesToSend.push(
      Message.create({
        role:
          opts.model.includes("o1") ||
          opts.model.includes("gemma") ||
          modelFamily === "claude" ||
          modelFamily === "google"
            ? "assistant"
            : "system",
        content: opts.systemPrompt.trim(),
      }),
    );

    messagesToSend.push(
      Message.create({
        role: "assistant",
        content: opts.assistantPrompt.trim(),
      }),
    );

    const attachmentMessages = (opts.attachments || []).map((attachment) =>
      Message.create({
        role: "user",
        content: `Attachment: ${attachment.content}`,
      }),
    );

    if (attachmentMessages.length > 0) {
      messagesToSend.push(...attachmentMessages);
    }

    messagesToSend.push(
      ...messages
        .filter((message: any) => message.content?.trim())
        .map((message: any) => Message.create(message)),
    );

    return messagesToSend;
  }

  static async handleWebhookStream(
    eventSource: EventSource,
    dataCallback: any,
  ): Promise<void> {
    console.log("sdk::handleWebhookStream::start");
    let done = false;
    return new Promise((resolve, reject) => {
      if (!done) {
        console.log("sdk::handleWebhookStream::promise::created");
        eventSource.onopen = () => {
          console.log("sdk::handleWebhookStream::eventSource::open");
          console.log("Connected to webhook");
        };

        const parseEvent = (data) => {
          try {
            return JSON.parse(data);
          } catch (_) {
            return data;
          }
        };
        eventSource.onmessage = (event) => {
          try {
            if (event.data === "[DONE]") {
              done = true;
              console.log("Stream completed");

              eventSource.close();
              return resolve();
            }

            dataCallback({ type: "web-search", data: parseEvent(event.data) });
          } catch (error) {
            console.log("sdk::handleWebhookStream::eventSource::error");
            console.error("Error parsing webhook data:", error);
            dataCallback({ error: "Invalid data format from webhook" });
          }
        };

        eventSource.onerror = (error: any) => {
          console.error("Webhook stream error:", error);

          if (
            error.error &&
            error.error.message === "The server disconnected."
          ) {
            return resolve();
          }

          reject(new Error("Failed to stream from webhook"));
        };
      }
    });
  }

  static sendDoubleNewline(controller, encoder) {
    const data = {
      type: "chat",
      data: {
        choices: [
          {
            index: 0,
            delta: { content: "\n\n" },
            logprobs: null,
            finish_reason: null,
          },
        ],
      },
    };

    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  }
}

export default ChatSdk;
