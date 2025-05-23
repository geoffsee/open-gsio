import {getSnapshot, types} from 'mobx-state-tree';
import OpenAI from 'openai';
import ChatSdk from '../sdk/chat-sdk';
import Message from "../models/Message";
import O1Message from "../models/O1Message";
import {getModelFamily} from "../../../src/components/chat/SupportedModels";
import {OpenAiChatSdk} from "../sdk/models/openai";
import {GroqChatSdk} from "../sdk/models/groq";
import {ClaudeChatSdk} from "../sdk/models/claude";
import {FireworksAiChatSdk} from "../sdk/models/fireworks";
import handleStreamData from "../sdk/handleStreamData";
import {GoogleChatSdk} from "../sdk/models/google";
import {XaiChatSdk} from "../sdk/models/xai";

// Types
export interface StreamParams {
  env: Env;
  openai: OpenAI;
  messages: any[];
  model: string;
  systemPrompt: string;
  preprocessedContext: any;
  attachments: any[];
  tools: any[];
  disableWebhookGeneration: boolean;
  maxTokens: number;
}

interface StreamHandlerParams {
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
  webhook?: { url: string, payload: unknown };
  dynamicContext?: any;
}

const ChatService = types
    .model('ChatService', {
      openAIApiKey: types.optional(types.string, ""),
      openAIBaseURL: types.optional(types.string, ""),
      maxTokens: types.number,
      systemPrompt: types.string
    })
    .volatile(self => ({
      openai: {} as OpenAI,
      env: {} as Env,
      webhookStreamActive: false
    }))
    .actions(self => {
      // Helper functions
      const createMessageInstance = (message: any) => {
        if (typeof message.content === 'string') {
          return Message.create({
            role: message.role,
            content: message.content,
          });
        }
        if (Array.isArray(message.content)) {
          const m = O1Message.create({
            role: message.role,
            content: message.content.map(item => ({
              type: item.type,
              text: item.text
            })),
          });
          console.log({here: "createMessageInstance"});
          return m;
        }
        throw new Error('Unsupported message format');
      };


      const handleWebhookProcessing = async (
          {controller, encoder, webhook, dynamicContext}: StreamHandlerParams
      ) => {
        console.log("handleWebhookProcessing::start");
        if (!webhook) return;
        console.log("handleWebhookProcessing::[Loading Hot Data]");
        dynamicContext.append("\n## Hot Data\n~~~markdown\n");

        for await (const chunk of self.streamWebhookData({webhook})) {
          controller.enqueue(encoder.encode(chunk));
          dynamicContext.append(chunk);
        }

        dynamicContext.append("\n~~~\n");
        console.log(`handleWebhookProcessing::[Finished loading Hot Data!][length: ${dynamicContext.content.length}]`);
        ChatSdk.sendDoubleNewline(controller, encoder);
        console.log("handleWebhookProcessing::exit")
      };

      const createStreamParams = async (
          streamConfig: any,
          dynamicContext: any,
          durableObject: any
      ): Promise<StreamParams> => {
        return {
          env: self.env,
          openai: self.openai,
          messages: streamConfig.messages.map(createMessageInstance),
          model: streamConfig.model,
          systemPrompt: streamConfig.systemPrompt,
          preprocessedContext: getSnapshot(dynamicContext),
          attachments: streamConfig.attachments ?? [],
          tools: streamConfig.tools ?? [],
          disableWebhookGeneration: true,
          maxTokens: await durableObject.dynamicMaxTokens(
              streamConfig.messages,
              128000
          ),
        }
      };

      const modelHandlers = {
        openai: (params: StreamParams, dataHandler: Function) =>
            OpenAiChatSdk.handleOpenAiStream(params, dataHandler),
        groq: (params: StreamParams, dataHandler: Function) =>
            GroqChatSdk.handleGroqStream(params, dataHandler),
        claude: (params: StreamParams, dataHandler: Function) =>
            ClaudeChatSdk.handleClaudeStream(params, dataHandler),
        fireworks: (params: StreamParams, dataHandler: Function) =>
            FireworksAiChatSdk.handleFireworksStream(params, dataHandler),
        google: (params: StreamParams, dataHandler: Function) =>
            GoogleChatSdk.handleGoogleStream(params, dataHandler),
        xai: (params: StreamParams, dataHandler: Function) =>
            XaiChatSdk.handleXaiStream(params, dataHandler),
      };

      return {
        setEnv(env: Env) {
          self.env = env;
          self.openai = new OpenAI({
            apiKey: self.openAIApiKey,
            baseURL: self.openAIBaseURL,
          });
        },

        handleChatRequest: async (request: Request) => {
          return ChatSdk.handleChatRequest(request, {
            openai: self.openai,
            env: self.env,
            systemPrompt: self.systemPrompt,
            maxTokens: self.maxTokens
          });
        },

        setWebhookStreamActive(value) {
          self.webhookStreamActive = value;
        },

        streamWebhookData: async function* ({webhook}) {
          console.log("streamWebhookData::start");
          if (self.webhookStreamActive) {
            return
          }

          const queue: string[] = [];
          let resolveQueueItem: Function;
          let finished = false;
          let errorOccurred: Error | null = null;

          const dataPromise = () => new Promise<void>((resolve) => {
            resolveQueueItem = resolve;
          });

          let currentPromise = dataPromise();
          const eventSource = new EventSource(webhook.url.trim());
          console.log("streamWebhookData::setWebhookStreamActive::true");
          self.setWebhookStreamActive(true)
          try {
            ChatSdk.handleWebhookStream(eventSource, (data) => {
              const formattedData = `data: ${JSON.stringify(data)}\n\n`;
              queue.push(formattedData);
              if (resolveQueueItem) resolveQueueItem();
              currentPromise = dataPromise();
            }).then(() => {
              finished = true;
              if (resolveQueueItem) resolveQueueItem();
            }).catch((err) => {
              console.log(`chatService::streamWebhookData::STREAM_ERROR::${err}`);
              errorOccurred = err;
              if (resolveQueueItem) resolveQueueItem();
            });

            while (!finished || queue.length > 0) {
              if (queue.length > 0) {
                yield queue.shift()!;
              } else if (errorOccurred) {
                throw errorOccurred;
              } else {
                await currentPromise;
              }
            }
            self.setWebhookStreamActive(false);
            eventSource.close();
            console.log(`chatService::streamWebhookData::complete`);
          } catch (error) {
            console.log(`chatService::streamWebhookData::error`);
            eventSource.close();
            self.setWebhookStreamActive(false);
            console.error("Error while streaming webhook data:", error);
            throw error;
          }
        },

        async handleSseStream(streamId: string) {
          console.log(`chatService::handleSseStream::enter::${streamId}`);

          const objectId = self.env.SITE_COORDINATOR.idFromName('stream-index');
          const durableObject = self.env.SITE_COORDINATOR.get(objectId);
          const savedStreamConfig = await durableObject.getStreamData(streamId);
          // console.log({savedStreamConfig});

          if (!savedStreamConfig) {
            return new Response('Stream not found', {status: 404});
          }

          const streamConfig = JSON.parse(savedStreamConfig);
          console.log(`chatService::handleSseStream::${streamId}::[stream configured]`);

          console.log(`chatService::handleSseStream::${streamId}::[initializing stream]`);

          const stream = new ReadableStream({
            async start(controller) {
              console.log(`chatService::handleSseStream::ReadableStream::${streamId}::open`);
              const encoder = new TextEncoder();
              // controller.enqueue(encoder.encode('retry: 3\n\n'));

              console.log(streamConfig.preprocessedContext);

              const dynamicContext = Message.create(streamConfig.preprocessedContext);
              console.log(`chatService::handleSseStream::ReadableStream::dynamicContext`);
              try {

                const config = JSON.parse(savedStreamConfig);

                const webhook = config?.webhooks?.at(0);

                if (webhook) {
                  console.log(`chatService::handleSseStream::ReadableStream::${streamId}::webhook:start`);
                  await handleWebhookProcessing({
                    controller,
                    encoder,
                    webhook,
                    dynamicContext
                  });
                  console.log(`chatService::handleSseStream::ReadableStream::${streamId}::webhook::end`);
                }

                const streamParams = await createStreamParams(
                    streamConfig,
                    dynamicContext,
                    durableObject
                );

                const modelFamily = getModelFamily(streamConfig.model);
                console.log(`chatService::handleSseStream::ReadableStream::modelFamily::${modelFamily}`);
                const handler = modelHandlers[modelFamily];

                if (handler) {
                  console.log(`chatService::handleSseStream::ReadableStream::${streamId}::handler::start`);
                  await handler(
                      streamParams,
                      handleStreamData(controller, encoder)
                  );
                  console.log(`chatService::handleSseStream::ReadableStream::${streamId}::handler::finish`);
                }
              } catch (error) {
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({error: error.message})}\n\n`)
                );
                console.log(`chatService::handleSseStream::ReadableStream::${streamId}::Error::${error}`);
              } finally {
                console.log(`chatService::handleSseStream::ReadableStream::${streamId}::closed::${streamId}`);
                controller.close();
              }
            },
          });
          return new Response(
              stream,
              {
                headers: {
                  'Content-Type': 'text/event-stream',
                  'Cache-Control': 'no-cache',
                  'Connection': 'keep-alive',
                },
              }
          );
        }
      };
    });

export default ChatService;