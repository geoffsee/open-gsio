import { OpenAI } from "openai";
import { BaseChatProvider, CommonProviderParams } from "./chat-stream-provider.ts";

export class MlxOmniChatProvider extends BaseChatProvider {
    getOpenAIClient(param: CommonProviderParams): OpenAI {
        return new OpenAI({
            baseURL: param.env.MLX_API_ENDPOINT ?? "http://localhost:10240",
            apiKey: param.env.MLX_API_KEY,
        });
    }

    getStreamParams(param: CommonProviderParams, safeMessages: any[]): any {
        const tuningParams = {
            temperature: 0.75,
        };

        const getTuningParams = () => {
            return tuningParams;
        };

        return {
            model: param.model,
            messages: safeMessages,
            stream: true,
            ...getTuningParams(),
        };
    }

    async processChunk(chunk: any, dataCallback: (data: any) => void): Promise<boolean> {
        if (chunk.choices && chunk.choices[0]?.finish_reason === "stop") {
            dataCallback({ type: "chat", data: chunk });
            return true;
        }

        dataCallback({ type: "chat", data: chunk });
        return false;
    }
}

export class MlxOmniChatSdk {
    private static provider = new MlxOmniChatProvider();

    static async handleMlxOmniStream(
        ctx: {
            openai: OpenAI;
            systemPrompt: any;
            preprocessedContext: any;
            maxTokens: unknown | number | undefined;
            messages: any;
            disableWebhookGeneration: boolean;
            model: any;
            env: Env;
        },
        dataCallback: (data: any) => any,
    ) {
        if (!ctx.messages?.length) {
            return new Response("No messages provided", { status: 400 });
        }

        return this.provider.handleStream(
            {
                systemPrompt: ctx.systemPrompt,
                preprocessedContext: ctx.preprocessedContext,
                maxTokens: ctx.maxTokens,
                messages: ctx.messages,
                model: ctx.model,
                env: ctx.env,
                disableWebhookGeneration: ctx.disableWebhookGeneration,
            },
            dataCallback,
        );
    }
}
