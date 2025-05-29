import React from "react";
export { onRenderHtml };

import { renderToStream } from "react-streaming/server";
import { escapeInject } from "vike/server";
import { Layout } from "../layout/Layout";
import type { OnRenderHtmlAsync } from "vike/types";

// See https://vike.dev/onRenderHtml for usage details
const onRenderHtml: OnRenderHtmlAsync = async (
  pageContext,
): ReturnType<OnRenderHtmlAsync> => {
  const { Page, pageProps } = pageContext;

  const page = (
    <Layout pageContext={pageContext}>
      <Page {...pageProps} />
    </Layout>
  );

  let ua;
  try {
    ua = pageContext.headers["user-agent"];
  } catch (e) {
    ua = "";
  }

  const res = escapeInject`<!DOCTYPE html>
<html data-theme="dark" lang="en">
<head>
<title>open-gsio</title>
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
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
    pageContext: {},
  };
};
