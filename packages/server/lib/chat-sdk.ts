import {OpenAI} from "openai";
import Message from "../models/Message.ts";
import {AssistantSdk} from "./assistant-sdk.ts";
import {getModelFamily} from "@open-gsio/ai/supported-models.ts";
import type {Instance} from "mobx-state-tree";

export class ChatSdk {
    static async preprocess({
                                messages,
                            }) {
        // run processing on messages to generate events/context
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
        const {messages, model, conversationId} =
            await request.json();

        if (!messages?.length) {
            return new Response("No messages provided", {status: 400});
        }

        const preprocessedContext = await ChatSdk.preprocess({
            messages,
        });
        console.log(ctx.env)
        console.log(ctx.env.SERVER_COORDINATOR);

        const objectId = ctx.env.SERVER_COORDINATOR.idFromName("stream-index");
        const durableObject = ctx.env.SERVER_COORDINATOR.get(objectId, ctx.env);


        await durableObject.saveStreamData(
            streamId,
            JSON.stringify({
                messages,
                model,
                conversationId,
                timestamp: Date.now(),
                systemPrompt: ctx.systemPrompt,
                preprocessedContext
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

    static async calculateMaxTokens(
        messages: any[],
        ctx: Record<string, any> & {
            env: Env;
            maxTokens: number;
        },
    ) {
        const objectId = ctx.env.SERVER_COORDINATOR.idFromName(
            "dynamic-token-counter",
        );
        const durableObject = ctx.env.SERVER_COORDINATOR.get(objectId);
        return durableObject.dynamicMaxTokens(messages, ctx.maxTokens);
    }

    static buildAssistantPrompt({maxTokens}) {
        return AssistantSdk.getAssistantPrompt({
            maxTokens,
            userTimezone: "UTC",
            userLocation: "USA/unknown",
        });
    }

    static buildMessageChain(
        messages: any[],
        opts: {
            systemPrompt: any;
            assistantPrompt: string;
            toolResults: Instance<typeof Message>;
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

        messagesToSend.push(
            ...messages
                .filter((message: any) => message.content?.trim())
                .map((message: any) => Message.create(message)),
        );

        return messagesToSend;
    }
}

export default ChatSdk;
