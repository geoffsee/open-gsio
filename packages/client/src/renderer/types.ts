export type { PageProps };

type Page = (pageProps: PageProps) => React.ReactElement;
type PageProps = Record<string, unknown>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vike {
    interface PageContext {
      Page: Page;
      pageProps?: PageProps;
      fetch?: typeof fetch;
      env: import('@open-gsio/env');
    }
  }
}
