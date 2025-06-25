/* eslint-disable no-irregular-whitespace */
import ChatSdk from '@open-gsio/ai/chat-sdk/chat-sdk.ts';
import { ProviderRepository } from '@open-gsio/ai/providers/_ProviderRepository.ts';
import { GoogleChatSdk } from '@open-gsio/ai/providers/google.ts';
import { OpenAiChatSdk } from '@open-gsio/ai/providers/openai.ts';
import {
  CerebrasSdk,
  ClaudeChatSdk,
  CloudflareAISdk,
  FireworksAiChatSdk,
  GroqChatSdk,
  MlxOmniChatSdk,
  OllamaChatSdk,
  XaiChatSdk,
} from '@open-gsio/ai/src';
import { Common } from '@open-gsio/ai/utils';
import { Schema } from '@open-gsio/schema';
import { flow, getSnapshot, types } from 'mobx-state-tree';
import OpenAI from 'openai';

export interface StreamParams {
  env: Env;
  openai: OpenAI;
  messages: any[];
  model: string;
  systemPrompt: string;
  preprocessedContext: any;
  maxTokens: number;
}

const activeStreamType = types.model({
  name: types.optional(types.string, ''),
  maxTokens: types.optional(types.number, 0),
  systemPrompt: types.optional(types.string, ''),
  model: types.optional(types.string, ''),
  messages: types.optional(types.array(types.frozen()), []),
});

const activeStreamsMap = types.map(activeStreamType);

const ChatService = types
  .model('ChatService', {
    openAIApiKey: types.optional(types.string, ''),
    openAIBaseURL: types.optional(types.string, ''),
    activeStreams: types.optional(activeStreamsMap, {}),
    maxTokens: types.number,
    systemPrompt: types.string,
  })
  .volatile(self => ({
    openai: {} as OpenAI,
    env: {} as Env,
  }))
  .actions(self => {
    // Helper functions
    const createMessageInstance = (message: any) => {
      if (typeof message.content === 'string') {
        return Schema.Message.create({
          role: message.role,
          content: message.content,
        });
      }
      if (Array.isArray(message.content)) {
        const m = Schema.O1Message.create({
          role: message.role,
          content: message.content.map((item: { type: any; text: any }) => ({
            type: item.type,
            text: item.text,
          })),
        });
        return m;
      }
      throw new Error('Unsupported message format');
    };

    const createStreamParams = async (
      streamConfig: any,
      dynamicContext: any,
      durableObject: any,
    ): Promise<StreamParams> => {
      return {
        env: self.env,
        openai: self.openai,
        messages: streamConfig.messages.map(createMessageInstance),
        model: streamConfig.model,
        systemPrompt: streamConfig.systemPrompt,
        preprocessedContext: getSnapshot(dynamicContext),
        maxTokens: await durableObject.dynamicMaxTokens(streamConfig.messages, 2000),
      };
    };

    const modelHandlers = {
      openai: (params: StreamParams, dataHandler: (data: any) => any) =>
        OpenAiChatSdk.handleOpenAiStream(params, dataHandler),
      groq: (params: StreamParams, dataHandler: (data: any) => any) =>
        GroqChatSdk.handleGroqStream(params, dataHandler),
      claude: (params: StreamParams, dataHandler: (data: any) => any) =>
        ClaudeChatSdk.handleClaudeStream(params, dataHandler),
      fireworks: (params: StreamParams, dataHandler: (data: any) => any) =>
        FireworksAiChatSdk.handleFireworksStream(params, dataHandler),
      google: (params: StreamParams, dataHandler: (data: any) => any) =>
        GoogleChatSdk.handleGoogleStream(params, dataHandler),
      xai: (params: StreamParams, dataHandler: (data: any) => any) =>
        XaiChatSdk.handleXaiStream(params, dataHandler),
      cerebras: (params: StreamParams, dataHandler: (data: any) => any) =>
        CerebrasSdk.handleCerebrasStream(params, dataHandler),
      cloudflareAI: (params: StreamParams, dataHandler: (data: any) => any) =>
        CloudflareAISdk.handleCloudflareAIStream(params, dataHandler),
      ollama: (params: StreamParams, dataHandler: (data: any) => any) =>
        OllamaChatSdk.handleOllamaStream(params, dataHandler),
      mlx: (params: StreamParams, dataHandler: (data: any) => any) =>
        MlxOmniChatSdk.handleMlxOmniStream(params, dataHandler),
    };

    return {
      getSupportedModels: flow(function* (): Generator<Promise<unknown>, Response, unknown> {
        // ----- Helpers ----------------------------------------------------------
        const logger = console;

        const useCache = true;

        // Create a signature of the current providers
        const providerRepo = new ProviderRepository(self.env);
        const providers = providerRepo.getProviders();
        const currentProvidersSignature = JSON.stringify(providers.map(p => p.name).sort());

        if (useCache) {
          // ----- 1. Try cached value ---------------------------------------------
          try {
            const cached = yield self.env.KV_STORAGE.get('supportedModels');
            const cachedSignature = yield self.env.KV_STORAGE.get('providersSignature');

            // Check if cache exists and providers haven't changed
            if (cached && cachedSignature && cachedSignature === currentProvidersSignature) {
              const parsed = JSON.parse(cached as string);
              if (Array.isArray(parsed) && parsed.length > 0) {
                logger.info('Cache hit – returning supportedModels from KV');
                return new Response(JSON.stringify(parsed), { status: 200 });
              }
              logger.warn('Cache entry malformed – refreshing');
              throw new Error('Malformed cache entry');
            } else if (
              cached &&
              (!cachedSignature || cachedSignature !== currentProvidersSignature)
            ) {
              logger.info('Providers changed – refreshing cache');
            }
          } catch (err) {
            logger.warn('Error reading/parsing supportedModels cache', err);
          }
        }

        // ----- 2. Build fresh list ---------------------------------------------

        const providerModels = new Map<string, any[]>();
        const modelMeta = new Map<string, any>();

        for (const provider of providers) {
          if (!provider.key) continue;

          logger.info(`Fetching models from «${provider.endpoint}»`);

          const openai = new OpenAI({ apiKey: provider.key, baseURL: provider.endpoint });

          // 2‑a. List models
          try {
            const listResp: any = yield openai.models.list(); // <‑‑ async
            const models = 'data' in listResp ? listResp.data : listResp;

            providerModels.set(
              provider.name,
              models.filter(
                (mdl: any) =>
                  !mdl.id.includes('whisper') &&
                  !mdl.id.includes('tts') &&
                  !mdl.id.includes('guard'),
              ),
            );

            // 2‑b. Retrieve metadata
            for (const mdl of models) {
              try {
                const meta: any = yield openai.models.retrieve(mdl.id); // <‑‑ async
                modelMeta.set(mdl.id, { ...mdl, ...meta });
              } catch (err) {
                // logger.error(`Metadata fetch failed for ${mdl.id}`, err);
                modelMeta.set(mdl.id, { provider: provider.name, mdl });
              }
            }
          } catch (err) {
            logger.error(`Model list failed for provider «${provider.name}»`, err);
          }
        }

        // ----- 3. Merge results -------------------------------------------------
        const resultMap = new Map<string, any>();
        for (const [provName, models] of providerModels) {
          for (const mdl of models) {
            resultMap.set(mdl.id, {
              id: mdl.id,
              provider: provName,
              ...(modelMeta.get(mdl.id) ?? mdl),
            });
          }
        }
        const resultArr = Array.from(resultMap.values());

        // ----- 4. Cache fresh list ---------------------------------------------
        try {
          // Store the models
          yield self.env.KV_STORAGE.put(
            'supportedModels',
            JSON.stringify(resultArr),
            { expirationTtl: 60 * 60 * 24 }, // 24 hours
          );

          // Store the providers signature
          yield self.env.KV_STORAGE.put(
            'providersSignature',
            currentProvidersSignature,
            { expirationTtl: 60 * 60 * 24 }, // 24 hours
          );

          logger.info('supportedModels cache refreshed');
        } catch (err) {
          logger.error('KV put failed for supportedModels', err);
        }

        // ----- 5. Return --------------------------------------------------------
        return new Response(JSON.stringify(resultArr), { status: 200 });
      }),
      setActiveStream(streamId: string, stream: any) {
        const validStream = {
          name: stream?.name || 'Unnamed Stream',
          maxTokens: stream?.maxTokens || 0,
          systemPrompt: stream?.systemPrompt || '',
          model: stream?.model || '',
          messages: stream?.messages || [],
        };

        self.activeStreams.set(streamId, validStream);
      },

      removeActiveStream(streamId: string) {
        self.activeStreams.delete(streamId);
      },
      setEnv(env: Env) {
        self.env = env;

        if (env.OPENAI_API_ENDPOINT && env.OPENAI_API_ENDPOINT.includes('localhost')) {
          self.openai = new OpenAI({
            apiKey: self.env.OPENAI_API_KEY,
            baseURL: self.env.OPENAI_API_ENDPOINT,
          });
        } else {
          self.openai = new OpenAI({
            apiKey: self.openAIApiKey,
            baseURL: self.openAIBaseURL,
          });
        }
      },

      handleChatRequest: async (request: Request) => {
        return ChatSdk.handleChatRequest(request, {
          openai: self.openai,
          env: self.env,
          systemPrompt: self.systemPrompt,
          maxTokens: self.maxTokens,
        });
      },

      async runModelHandler(params: {
        streamConfig: any;
        streamParams: any;
        controller: ReadableStreamDefaultController;
        encoder: TextEncoder;
        streamId: string;
      }) {
        const { streamConfig, streamParams, controller, encoder, streamId } = params;

        const modelFamily = await ProviderRepository.getModelFamily(streamConfig.model, self.env);

        const useModelHandler = () => {
          // @ts-expect-error - language server does not have enough information to validate modelFamily as an indexer for modelHandlers
          return modelHandlers[modelFamily];
        };

        const handler = useModelHandler();

        if (handler) {
          try {
            await handler(streamParams, Common.Utils.handleStreamData(controller, encoder));
          } catch (error: any) {
            const message = error.message.toLowerCase();

            if (
              message.includes('413 ') ||
              message.includes('maximum') ||
              message.includes('too long') ||
              message.includes('too large')
            ) {
              throw new ClientError(
                `Error! Content length exceeds limits. Try shortening your message or editing an earlier message.`,
                413,
                {
                  model: streamConfig.model,
                  maxTokens: streamParams.maxTokens,
                },
              );
            }
            if (message.includes('429 ')) {
              throw new ClientError(
                `Error! Rate limit exceeded. Wait a few minutes before trying again.`,
                429,
                {
                  model: streamConfig.model,
                  maxTokens: streamParams.maxTokens,
                },
              );
            }
            if (message.includes('404')) {
              throw new ClientError(`Something went wrong, try again.`, 413, {});
            }
            throw error;
          }
        }
      },

      createSseReadableStream(params: {
        streamId: string;
        streamConfig: any;
        savedStreamConfig: string;
        durableObject: any;
      }) {
        const { streamId, streamConfig, savedStreamConfig, durableObject } = params;

        return new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();

            try {
              const dynamicContext = Schema.Message.create(streamConfig.preprocessedContext);

              // Process the stream data using the appropriate handler
              const streamParams = await createStreamParams(
                streamConfig,
                dynamicContext,
                durableObject,
              );

              await self.runModelHandler({
                streamConfig,
                streamParams,
                controller,
                encoder,
                streamId,
              });
            } catch (error) {
              console.error(`chatService::handleSseStream::${streamId}::Error`, error);

              if (error instanceof ClientError) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`,
                  ),
                );
              } else {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'error',
                      error: 'Server error',
                    })}\n\n`,
                  ),
                );
              }
              controller.close();
            } finally {
              try {
                controller.close();
              } catch (_) {
                // Ignore errors when closing the controller, as it might already be closed
              }
            }
          },
        });
      },

      handleSseStream: flow(function* (
        streamId: string,
      ): Generator<Promise<string>, Response, unknown> {
        // Check if a stream is already active for this ID
        if (self.activeStreams.has(streamId)) {
          return new Response('Stream already active', { status: 409 });
        }

        // Retrieve the stream configuration from the durable object
        const objectId = self.env.SERVER_COORDINATOR.idFromName('stream-index');
        const durableObject = self.env.SERVER_COORDINATOR.get(objectId);
        const savedStreamConfig: any = yield durableObject.getStreamData(streamId);

        if (!savedStreamConfig) {
          return new Response('Stream not found', { status: 404 });
        }

        const streamConfig = JSON.parse(savedStreamConfig);

        const stream = self.createSseReadableStream({
          streamId,
          streamConfig,
          savedStreamConfig,
          durableObject,
        });

        // Use `tee()` to create two streams: one for processing and one for the response
        const [processingStream, responseStream] = stream.tee();

        self.setActiveStream(streamId, {
          ...streamConfig,
        });

        processingStream.pipeTo(
          new WritableStream({
            close() {
              self.removeActiveStream(streamId);
            },
          }),
        );

        // Return the second stream as the response
        return new Response(responseStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      }),
    };
  });

/**
 * ClientError
 * A custom construct for sending client-friendly errors via the controller in a structured and controlled manner.
 */
export class ClientError extends Error {
  public statusCode: number;
  public details: Record<string, any>;

  constructor(message: string, statusCode: number, details: Record<string, any> = {}) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ClientError.prototype);
  }

  /**
   * Formats the error for SSE-compatible data transmission.
   */
  public formatForSSE(): string {
    return JSON.stringify({
      type: 'error',
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
    });
  }
}

export default ChatService;
