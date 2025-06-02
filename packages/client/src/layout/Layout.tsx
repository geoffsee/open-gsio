import React, { useEffect, useState } from "react";
import { PageContextProvider } from "../renderer/usePageContext";
import { MobileProvider } from "../components/contexts/MobileContext";
import LayoutComponent from "./LayoutComponent";
import userOptionsStore from "../stores/UserOptionsStore";
import { observer } from "mobx-react-lite";
import { Chakra } from "../components/contexts/ChakraContext";
import { getTheme } from "./theme/color-themes";

export { Layout };

const Layout = observer(({ pageContext, children }) => {
  const [activeTheme, setActiveTheme] = useState<string>("darknight");

  useEffect(() => {
    if (userOptionsStore.theme !== activeTheme) {
      setActiveTheme(userOptionsStore.theme);
    }
  }, [userOptionsStore.theme]);

  try {
    if (pageContext?.headersOriginal) {
      const headers = new Headers(pageContext.headersOriginal);

      const cookies = headers.get("cookie");

      const userPreferencesCookie = cookies
        ?.split("; ")
        .find((row) => row.startsWith("user_preferences="))
        ?.split("=")[1];

      try {
        const { theme: receivedTheme } = JSON.parse(
          atob(userPreferencesCookie ?? "{}"),
        );
        setActiveTheme(receivedTheme);
      } catch (e) {}
    }
  } catch (e) {}

  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <MobileProvider>
          <Chakra theme={getTheme(activeTheme)}>
            <LayoutComponent>{children}</LayoutComponent>
          </Chakra>
        </MobileProvider>
      </PageContextProvider>
    </React.StrictMode>
  );
});
