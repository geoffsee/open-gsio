import {BunSqliteKVNamespace} from "./storage/BunSqliteKVNamespace";
import {readdir} from 'node:fs/promises';
import type { RequestLike } from "itty-router";

import ServerCoordinator from "./durable-objects/ServerCoordinatorBun";
import Server from ".";

import {config} from "dotenv";

const router = Server.Router();

config({
    path: ".env",
    debug: true,
    // defaults: {
    //     EVENTSOURCE_HOST: "https://eventsource.seemueller.io",
    // }
})

export default {
    port: 3003,
    fetch: async (request: RequestLike, env: { [key: string]: any; }, ctx: any) =>{
        // console.log("[trace] request: ", request.method, request.url, "headers: ", request.headers.get("referer"), "body: ", request.body, "env: ", env, "ctx: ", ctx, "")

        env["SERVER_COORDINATOR"] = ServerCoordinator;
        env["ASSETS"] = assetHandler.ASSETS;
        env["EVENTSOURCE_HOST"] = process.env.EVENTSOURCE_HOST;
        env["GROQ_API_KEY"] = process.env.GROQ_API_KEY;
        env["ANTHROPIC_API_KEY"] = process.env.ANTHROPIC_API_KEY;
        env["FIREWORKS_API_KEY"] = process.env.FIREWORKS_API_KEY;
        env["XAI_API_KEY"] = process.env.XAI_API_KEY;
        env["CEREBRAS_API_KEY"] = process.env.CEREBRAS_API_KEY;
        env["CLOUDFLARE_API_KEY"] = process.env.CLOUDFLARE_API_KEY;
        env["CLOUDFLARE_ACCOUNT_ID"] = process.env.CLOUDFLARE_ACCOUNT_ID;
        env["MLX_API_KEY"] = process.env.MLX_API_KEY;
        env["OLLAMA_API_KEY"] = process.env.OLLAMA_API_KEY;
        env["KV_STORAGE"] = new BunSqliteKVNamespace({namespace: "open-gsio"});


        try {
            const controller = new AbortController();
            const timeout = new Promise((_, reject) =>
                setTimeout(() => {
                    controller.abort();
                    reject(new Error('Request timeout after 5s'));
                }, 5000)
            );

            return await Promise.race([
                router.fetch(request, env, ctx),
                timeout
            ]);
        } catch (e) {
            console.error("Error handling request:", e);
            return new Response("Server Error", { status: 500 });
        }
        
    }
}

export const assetHandler = {
    ASSETS: {
        /**
         * Fetches the requested static asset from local dist
         *
         * @param {Request} request - The incoming Fetch API Request object.
         * @returns {Promise<Response>} A Promise that resolves with the Response for the requested asset,
         *                              or a 404 Response if the asset is not found or an error occurs.
         */
        async fetch(request: Request): Promise<Response> {
            // Serialize incoming request URL
            const originalUrl = new URL(request.url);
            const url = new URL(request.url);

            // List all files in the public directory
            const PUBLIC_DIR = new URL('../client/public/', import.meta.url).pathname;
            const publicFiles = await readdir(PUBLIC_DIR, {recursive: true});

            // Get the filename from pathname and remove any path traversal attempts
            const filename = url.pathname.split('/').pop()?.replace(/\.\./g, '') || '';

            const isStatic = publicFiles.some(file => file === filename);

            if (url.pathname === "/") {
                url.pathname = "/index.html";
            } else if (isStatic && !url.pathname.startsWith('/static')) {
                // leave it alone
            } else if (isStatic) {
                url.pathname = `/static${url.pathname}`;
            }

            const dist = new URL('../client/dist/client', import.meta.url).pathname;

            try {
                return new Response(Bun.file(`${dist}${url.pathname}`));
            } catch (error) {
                // Log the error with the original requested path
                console.error(`Error reading asset from path ${originalUrl.pathname}:`, error);
                return new Response(null, { status: 404 });
            }
        }
    }
}