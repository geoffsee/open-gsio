import {flow, getSnapshot, types} from 'mobx-state-tree';
import OpenAI from 'openai';
import ChatSdk from '../lib/chat-sdk';
import Message from "../models/Message";
import O1Message from "../models/O1Message";
import {getModelFamily, ModelFamily} from "../../../src/components/chat/lib/SupportedModels";
import {OpenAiChatSdk} from "../providers/openai";
import {GroqChatSdk} from "../providers/groq";
import {ClaudeChatSdk} from "../providers/claude";
import {FireworksAiChatSdk} from "../providers/fireworks";
import handleStreamData from "../lib/handleStreamData";
import {GoogleChatSdk} from "../providers/google";
import {XaiChatSdk} from "../providers/xai";
import {CerebrasSdk} from "../providers/cerebras";
import {CloudflareAISdk} from "../providers/cloudflareAi";

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
    name: types.optional(types.string, ""),
    maxTokens: types.optional(types.number, 0),
    systemPrompt: types.optional(types.string, ""),
    model: types.optional(types.string, ""),
    messages: types.optional(types.array(types.frozen()), []),
});

const activeStreamsMap = types.map(
    activeStreamType,
);

const ChatService = types
    .model('ChatService', {
        openAIApiKey: types.optional(types.string, ""),
        openAIBaseURL: types.optional(types.string, ""),
        activeStreams: types.optional(
            activeStreamsMap,
            {}
        ),
        maxTokens: types.number,
        systemPrompt: types.string
    })
    .volatile(self => ({
        openai: {} as OpenAI,
        env: {} as Env,
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
                return m;
            }
            throw new Error('Unsupported message format');
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
                maxTokens: await durableObject.dynamicMaxTokens(
                    streamConfig.messages,
                    2000
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
            cerebras: (params: StreamParams, dataHandler: Function) =>
                CerebrasSdk.handleCerebrasStream(params, dataHandler),
            cloudflareAI: (params: StreamParams, dataHandler: Function) =>
                CloudflareAISdk.handleCloudflareAIStream(params, dataHandler)
        };

        return {
            setActiveStream(streamId: string, stream: any) {
                const validStream = {
                    name: stream?.name || "Unnamed Stream",
                    maxTokens: stream?.maxTokens || 0,
                    systemPrompt: stream?.systemPrompt || "",
                    model: stream?.model || "",
                    messages: stream?.messages || [],
                };

                self.activeStreams.set(streamId, validStream);
            },

            removeActiveStream(streamId: string) {
                self.activeStreams.delete(streamId);
            },
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


            async runModelHandler(params: {
                streamConfig: any;
                streamParams: any;
                controller: ReadableStreamDefaultController;
                encoder: TextEncoder;
                streamId: string;
            }) {
                const {streamConfig, streamParams, controller, encoder, streamId} = params;

                const modelFamily = getModelFamily(streamConfig.model);

                const handler = modelHandlers[modelFamily as ModelFamily];
                if (handler) {
                    try {

                        await handler(streamParams, handleStreamData(controller, encoder));

                    } catch (error) {
                        const message = error.message.toLowerCase();

                        if (message.includes("413 ") || (message.includes("maximum") || message.includes("too long") || message.includes("too large"))) {
                            throw new ClientError(`Error! Content length exceeds limits. Try shortening your message or editing an earlier message.`, 413, {
                                model: streamConfig.model,
                                maxTokens: streamParams.maxTokens
                            })
                        }
                        if (message.includes("429 ")) {
                            throw new ClientError(`Error! Rate limit exceeded. Wait a few minutes before trying again.`, 429, {
                                model: streamConfig.model,
                                maxTokens: streamParams.maxTokens
                            })
                        }
                        if (message.includes("404")) {
                            throw new ClientError(`Something went wrong, try again.`, 413, {})
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
                const {streamId, streamConfig, savedStreamConfig, durableObject} = params;

                return new ReadableStream({
                    async start(controller) {
                        const encoder = new TextEncoder();

                        try {
                            const dynamicContext = Message.create(streamConfig.preprocessedContext);

                            // Process the stream data using the appropriate handler
                            const streamParams = await createStreamParams(
                                streamConfig,
                                dynamicContext,
                                durableObject
                            );

                            try {
                                await self.runModelHandler({
                                    streamConfig,
                                    streamParams,
                                    controller,
                                    encoder,
                                    streamId,
                                });
                            } catch (e) {
                                console.log("error caught at runModelHandler")
                                throw e;
                            }

                        } catch (error) {
                            console.error(`chatService::handleSseStream::${streamId}::Error`, error);

                            if (error instanceof ClientError) {
                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({type: 'error', error: error.message})}\n\n`)
                                );
                            } else {
                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({
                                        type: 'error',
                                        error: "Server error"
                                    })}\n\n`)
                                );
                            }
                            controller.close();
                        } finally {
                            try {
                                controller.close();
                            } catch (_) {
                            }
                        }
                    },
                });
            },


            handleSseStream: flow(function* (streamId: string): Generator<Promise<string>, Response, unknown> {
                console.log(`chatService::handleSseStream::enter::${streamId}`);

                // Check if a stream is already active for this ID
                if (self.activeStreams.has(streamId)) {
                    return new Response('Stream already active', {status: 409});
                }

                // Retrieve the stream configuration from the durable object
                const objectId = self.env.SITE_COORDINATOR.idFromName('stream-index');
                const durableObject = self.env.SITE_COORDINATOR.get(objectId);
                const savedStreamConfig = yield durableObject.getStreamData(streamId);

                if (!savedStreamConfig) {
                    return new Response('Stream not found', {status: 404});
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
                    })
                );

                // Return the second stream as the response
                return new Response(responseStream, {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
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
