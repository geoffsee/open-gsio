import {OpenAI} from "openai";
import Message from "../schema/Message.ts";
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
