import renderPage from '@open-gsio/client/server';
import { types } from 'mobx-state-tree';

export default types
  .model('StaticAssetStore', {})
  .volatile(self => ({
    env: {} as Env,
    ctx: {} as ExecutionContext,
  }))
  .actions(self => ({
    setEnv(env: Env) {
      self.env = env;
    },
    setCtx(ctx: ExecutionContext) {
      self.ctx = ctx;
    },
    async handleSsr(url: string, headers: Headers, env: Vike.PageContext.env) {
      const pageContextInit = {
        urlOriginal: url,
        headersOriginal: headers,
        fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
        env,
      };

      const pageContext = await renderPage(pageContextInit);
      const { httpResponse } = pageContext;

      if (!httpResponse) {
        return null;
      } else {
        const { statusCode: status, headers: responseHeaders } = httpResponse;

        // Create a new Headers object and remove Content-Length for streaming.
        const newHeaders = new Headers(responseHeaders);
        newHeaders.delete('Content-Length');

        return new Response(httpResponse.pipe, { headers: newHeaders, status });
      }
    },
    async handleStaticAssets(request: Request, env) {
      try {
        return await env.ASSETS.fetch(request);
      } catch (error) {
        console.error('Error serving static asset:', error);
        return new Response('Asset not found', { status: 404 });
      }
    },
  }));
