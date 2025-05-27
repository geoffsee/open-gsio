import Routes from "../../src/renderer/routes";

export { data };
export type Data = Awaited<ReturnType<typeof data>>;
import type { PageContextServer } from "vike/types";

// sets the window title depending on the route
const data = async (pageContext: PageContextServer) => {
  const getTitle = (path) => {
    return Routes[normalizePath(path)]?.heroLabel || "";
  };

  const normalizePath = (path) => {
    if (!path) return "/";
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return path.toLowerCase();
  };
  return {
    // The page's <title>
    title: getTitle(pageContext.urlOriginal),
  };
};
