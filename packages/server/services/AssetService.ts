import { types } from "mobx-state-tree";
import renderPage from "@open-gsio/client/server";

export default types
  .model("StaticAssetStore", {})
  .volatile((self) => ({
    env: {} as Env,
    ctx: {} as ExecutionContext,
  }))
  .actions((self) => ({
    setEnv(env: Env) {
      self.env = env;
    },
    setCtx(ctx: ExecutionContext) {
      self.ctx = ctx;
    },
    async handleSsr(
      url: string,
      headers: Headers,
      env: Vike.PageContext.env,
    ) {
      console.log("handleSsr");
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
        const { statusCode: status, headers } = httpResponse;
        return new Response(httpResponse.pipe, { headers, status });
      }
    },
    async handleStaticAssets(request: Request, env) {
      console.log("handleStaticAssets");
      try {
        return await env.ASSETS.fetch(request);
      } catch (error) {
        console.error("Error serving static asset:", error);
        return new Response("Asset not found", { status: 404 });
      }
    },
  }));
