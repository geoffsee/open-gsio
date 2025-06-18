import { useContext, createContext, type ReactNode } from "react";
import type { PageContext } from "vike/types";

export { PageContextProvider };
export { usePageContext };

const Context = createContext<PageContext>(undefined as any);

function PageContextProvider({
  pageContext,
  children,
}: {
  pageContext: PageContext;
  children: ReactNode;
}) {
  return <Context.Provider value={pageContext}>{children}</Context.Provider>;
}

function usePageContext() {
  const pageContext = useContext(Context);
  return pageContext;
}
