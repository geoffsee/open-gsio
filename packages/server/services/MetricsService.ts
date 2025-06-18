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
      let proxyUrl = "";
      if(self.env.METRICS_HOST) {
        proxyUrl = new URL(`${self.env.METRICS_HOST}${url.pathname}${url.search}`).toString();
      }

      if(proxyUrl) {
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
          return new Response("metrics misconfigured", { status: 200 });
        }
      } else {
        const event = {
          method: request.method,
          headers: request.headers,
          body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
        }
        self.env.KV_STORAGE.put(`metrics_events::${crypto.randomUUID()}`, JSON.stringify(event));
      }
    }),
  }));

export default MetricsService;
