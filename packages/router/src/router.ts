import { Router, withParams } from 'itty-router';

import { createRequestContext } from './request-context.ts';

export function createRouter() {
  return (
    Router()
      .get('/assets/*', (r, e, c) => {
        const { assetService } = createRequestContext(e, c);
        return assetService.handleStaticAssets(r, e, c);
      })

      .post('/api/contact', (r, e, c) => {
        const { contactService } = createRequestContext(e, c);
        return contactService.handleContact(r);
      })

      .post('/api/chat', (r, e, c) => {
        const { chatService } = createRequestContext(e, c);
        return chatService.handleChatRequest(r);
      })

      .get('/api/streams/:streamId', withParams, async ({ streamId }, env, ctx) => {
        const { chatService } = createRequestContext(env, ctx);
        return chatService.handleSseStream(streamId); // Handles SSE for streamId
      })

      .get('/api/models', async (req, env, ctx) => {
        const { chatService } = createRequestContext(env, ctx);
        return chatService.getSupportedModels();
      })

      .post('/api/feedback', async (r, e, c) => {
        const { feedbackService } = createRequestContext(e, c);
        return feedbackService.handleFeedback(r);
      })

      .post('/api/tx', async (r, e, c) => {
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

      .get('/api/metrics*', async (r, e, c) => {
        return new Response('ok');
        // const { metricsService } = createRequestContext(e, c);
        // return metricsService.handleMetricsRequest(r);
      })

      .post('/api/metrics*', async (r, e, c) => {
        return new Response('ok');
        // const { metricsService } = createRequestContext(e, c);
        // return metricsService.handleMetricsRequest(r);
      })

      // renders the app
      .all('^(?!/api/)(?!/assets/).*$', async (r, e, c) => {
        const { assetService } = createRequestContext(e, c);

        // First attempt to serve pre-rendered HTML
        const preRenderedHtml = await assetService.handleStaticAssets(r, e);
        if (preRenderedHtml !== null) {
          return preRenderedHtml;
        }

        // If no pre-rendered HTML, attempt SSR
        const ssrResponse = await assetService.handleSsr(r.url, r.headers, e);
        if (ssrResponse !== null) {
          return ssrResponse;
        }

        // Finally, proxy to static assets if nothing else matched
        return assetService.handleStaticAssets(r, e);
      })
  );
}
