import React from 'react';
import { renderToStream } from 'react-streaming/server';
import { escapeInject } from 'vike/server';
import type { OnRenderHtmlAsync } from 'vike/types';

import { Layout } from '../layout/Layout';

export { onRenderHtml };

// See https://vike.dev/onRenderHtml for usage details
const onRenderHtml: OnRenderHtmlAsync = async (pageContext): ReturnType<OnRenderHtmlAsync> => {
  const { Page, pageProps } = pageContext;

  const page = (
    <Layout pageContext={pageContext}>
      <Page {...pageProps} />
    </Layout>
  );

  let ua;
  try {
    ua = pageContext.headers['user-agent'];
  } catch (e) {
    ua = '';
  }

  const res = escapeInject`<!DOCTYPE html>
<html data-theme="dark" lang="en">
<head>
<title>open-gsio</title>
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta charset="UTF-8">
<meta name="description" content="Maker Site">
<script>
window.ga_tid = "open-gsio";
window.ga_api = "/api/metrics";
</script>
<script src="/cfga.min.js" async></script>
</head>
<body>
<div id="page-view">${await renderToStream(page, { userAgent: ua })}</div>
</body>
</html>`;

  return {
    documentHtml: res,
    pageContext: {
      enableEagerStreaming: true,
    },
  };
};
