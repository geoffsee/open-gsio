import { types, flow } from "mobx-state-tree";

const MetricsService = types
  .model("MetricsService", {
    isCollectingMetrics: types.optional(types.boolean, true),
  })
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
    handleMetricsRequest: flow(function* (request: Request) {
      const url = new URL(request.url);
      const proxyUrl = `https://metrics.seemueller.io${url.pathname}${url.search}`;

      try {
        const response = yield fetch(proxyUrl, {
          method: request.method,
          headers: request.headers,
          body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
          redirect: "follow",
        });

        return response;
      } catch (error) {
        console.error("Failed to proxy metrics request:", error);
        return new Response("Failed to fetch metrics", { status: 500 });
      }
    }),
  }));

export default MetricsService;
