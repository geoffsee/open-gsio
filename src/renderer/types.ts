// renderer/types.ts
export type { PageProps };

type Page = (pageProps: PageProps) => React.ReactElement;
type PageProps = Record<string, unknown>;

declare global {
  namespace Vike {
    interface PageContext {
      Page: Page;
      pageProps?: PageProps;
      fetch?: typeof fetch;

      // Add your environment bindings here
      env: import("../../workers/site/env");
    }
  }
}
