import { Router, withParams } from "itty-router";
import { createRequestContext } from "./RequestContext";

export function createRouter() {
  return (
    Router()
      .get("/assets/*", (r, e, c) => {
        const { assetService } = createRequestContext(e, c);
        return assetService.handleStaticAssets(r, e, c);
      })

      .post("/api/contact", (r, e, c) => {
        const { contactService } = createRequestContext(e, c);
        return contactService.handleContact(r);
      })

      .post("/api/chat", (r, e, c) => {
        const { chatService } = createRequestContext(e, c);
        return chatService.handleChatRequest(r);
      })

      .get(
        "/api/streams/:streamId",
        withParams,
        async ({ streamId }, env, ctx) => {
          const { chatService } = createRequestContext(env, ctx);
          return chatService.handleSseStream(streamId); // Handles SSE for streamId
        },
      )

      .post("/api/feedback", async (r, e, c) => {
        const { feedbackService } = createRequestContext(e, c);
        return feedbackService.handleFeedback(r);
      })

      .post("/api/tx", async (r, e, c) => {
        const { transactionService } = createRequestContext(e, c);
        return transactionService.handleTransact(r);
      })

      // used for file handling, can be enabled but is not fully implemented in this fork.
      // .post('/api/documents', async (r, e, c) => {
      //     const {documentService} = createServerContext(e, c);
      //     return documentService.handlePutDocument(r)
      // })
      //
      // .get('/api/documents', async (r, e, c) => {
      //     const {documentService} = createServerContext(e, c);
      //     return documentService.handleGetDocument(r)
      // })

      .all("/api/metrics/*", async (r, e, c) => {
        const { metricsService } = createRequestContext(e, c);
        return metricsService.handleMetricsRequest(r);
      })

      .get("*", async (r, e, c) => {
        const { assetService } = createRequestContext(e, c);

        console.log("Request received:", { url: r.url, headers: r.headers });

        // First attempt to serve pre-rendered HTML
        const preRenderedHtml = await assetService.handleStaticAssets(r, e, c);

        if (
          preRenderedHtml !== null &&
          typeof preRenderedHtml === "object" &&
          Object.keys(preRenderedHtml).length > 0
        ) {
          console.log("Serving pre-rendered HTML for:", r.url);
          console.log({ preRenderedHtml });
          return preRenderedHtml;
        }

        // If no pre-rendered HTML, attempt SSR
        console.log("No pre-rendered HTML found, attempting SSR for:", r.url);
        const ssrResponse = await assetService.handleSsr(r.url, r.headers, e);
        if (
          ssrResponse !== null &&
          typeof ssrResponse === "object" &&
          Object.keys(ssrResponse).length > 0
        ) {
          console.log("SSR successful for:", r.url);
          return ssrResponse;
        }

        // If no 404.html exists, fall back to static assets
        console.log("Serving not found:", r.url);

        const url = new URL(r.url);

        url.pathname = "/404.html";
        // Finally, try to serve 404.html for not found pages
        return assetService.handleStaticAssets(new Request(url, r), e, c);
      })
  );
}
