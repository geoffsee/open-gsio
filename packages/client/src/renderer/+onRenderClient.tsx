export { onRenderClient };

import React from 'react';
import { hydrateRoot } from 'react-dom/client';

import { Layout } from '../layout/Layout';

// See https://vike.dev/onRenderClient for usage details
async function onRenderClient(pageContext) {
  const { Page, pageProps } = pageContext;
  hydrateRoot(
    document.getElementById('page-view'),
    <Layout pageContext={pageContext}>
      <Page {...pageProps} />
    </Layout>,
  );
}
