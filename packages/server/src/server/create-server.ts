import ServerCoordinator from '@open-gsio/coordinators/src/ServerCoordinatorBun.ts';
import Router from '@open-gsio/router';
import { config } from 'dotenv';
import type { RequestLike } from 'itty-router';
import { error } from 'itty-router';

import { BunSqliteKVNamespace } from '../storage/BunSqliteKVNamespace.ts';

import { assetHandler } from './asset-handler.ts';

export function createServer() {
  const router = Router.Router();
  config({
    path: '.env',
    debug: true,
    // defaults: {
    //     EVENTSOURCE_HOST: "https://eventsource.seemueller.io",
    // }
  });

  // bootstrap the root path of the existing router to the asset handler defined here
  router.get('/', async (request: RequestLike, env: any) => {
    return await assetHandler.ASSETS.fetch(request as Request);
  });

  const server = {
    port: 3003,
    fetch: async (request: RequestLike, env: { [key: string]: any }, ctx: any) => {
      // console.log("[trace] request: ", request.method, request.url, "headers: ", request.headers.get("referer"), "body: ", request.body, "env: ", env, "ctx: ", ctx, "")

      env['SERVER_COORDINATOR'] = ServerCoordinator;
      env['ASSETS'] = assetHandler.ASSETS;
      env['EVENTSOURCE_HOST'] = process.env.EVENTSOURCE_HOST;
      env['GROQ_API_KEY'] = process.env.GROQ_API_KEY;
      env['ANTHROPIC_API_KEY'] = process.env.ANTHROPIC_API_KEY;
      env['FIREWORKS_API_KEY'] = process.env.FIREWORKS_API_KEY;
      env['XAI_API_KEY'] = process.env.XAI_API_KEY;
      env['CEREBRAS_API_KEY'] = process.env.CEREBRAS_API_KEY;
      env['CLOUDFLARE_API_KEY'] = process.env.CLOUDFLARE_API_KEY;
      env['CLOUDFLARE_ACCOUNT_ID'] = process.env.CLOUDFLARE_ACCOUNT_ID;
      env['MLX_API_KEY'] = process.env.MLX_API_KEY;
      env['OLLAMA_API_KEY'] = process.env.OLLAMA_API_KEY;
      env['KV_STORAGE'] = new BunSqliteKVNamespace({ namespace: 'open-gsio' });

      try {
        const controller = new AbortController();
        const timeout = new Promise((_, reject) =>
          setTimeout(() => {
            controller.abort();
            reject(new Error('Request timeout after 5s'));
          }, 5000),
        );
        return await Promise.race([router.fetch(request, env, ctx).catch(error), timeout]);
      } catch (e) {
        console.error('Error handling request:', e);
        return new Response('Server Error', { status: 500 });
      }
    },
  };
  return { server, router, assetHandler };
}
