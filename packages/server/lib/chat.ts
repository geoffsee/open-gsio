import {OpenAI} from "openai";
import Message from "@open-gsio/schema/server/Message";
import type {Instance} from "mobx-state-tree";
import ProviderRepository from "@open-gsio/ai/providers/_ProviderRepository";

export class Chat {
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

        const preprocessedContext = await Chat.preprocess({
            messages,
        });
        console.log(ctx.env)
        console.log(ctx.env.SERVER_COORDINATOR);

        const objectId = ctx.env.SERVER_COORDINATOR.idFromName("stream-index");
        const durableObject = ctx.env.SERVER_COORDINATOR.get(objectId);


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

    static async buildMessageChain(
        messages: any[],
        opts: {
            systemPrompt: any;
            assistantPrompt: string;
            toolResults: Instance<typeof Message>;
            model: any;
            env: Env;
        },
    ) {
        const modelFamily = await ProviderRepository.getModelFamily(opts.model, opts.env)

        const messagesToSend = [];

        messagesToSend.push(
            Message.create({
                role:
                    opts.model.includes("o1") ||
                    opts.model.includes("gemma") ||
                   ( modelFamily === "claude" ||
                    modelFamily === "google")
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

export default Chat;
