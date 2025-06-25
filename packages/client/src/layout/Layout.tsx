import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';

import { Chakra } from '../components/contexts/ChakraContext';
import { MobileProvider } from '../components/contexts/MobileContext';
import { PageContextProvider } from '../renderer/usePageContext';
import userOptionsStore from '../stores/UserOptionsStore';

import LayoutComponent from './LayoutComponent';
import { getTheme } from './theme/color-themes';

export { Layout };

const Layout = observer(({ pageContext, children }) => {
  const [activeTheme, setActiveTheme] = useState<string>('darknight');

  useEffect(() => {
    if (userOptionsStore.theme !== activeTheme) {
      setActiveTheme(userOptionsStore.theme);
    }
  }, [userOptionsStore.theme]);

  try {
    if (pageContext?.headersOriginal) {
      const headers = new Headers(pageContext.headersOriginal);

      const cookies = headers.get('cookie');

      const userPreferencesCookie = cookies
        ?.split('; ')
        .find(row => row.startsWith('user_preferences='))
        ?.split('=')[1];

      try {
        const { theme: receivedTheme } = JSON.parse(atob(userPreferencesCookie ?? '{}'));
        setActiveTheme(receivedTheme);
      } catch (e) {
        // Ignore parsing errors for user preferences cookie
      }
    }
  } catch (e) {
    // Ignore errors when accessing headers or cookies
  }

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
