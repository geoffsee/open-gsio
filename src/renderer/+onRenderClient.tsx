// https://vike.dev/onRenderClient
export { onRenderClient };

import React from "react";
import { hydrateRoot } from "react-dom/client";
import { Layout } from "../layout/Layout";

async function onRenderClient(pageContext) {
  const { Page, pageProps } = pageContext;
  hydrateRoot(
    document.getElementById("page-view"),
    <Layout pageContext={pageContext}>
      <Page {...pageProps} />
    </Layout>,
  );
}
