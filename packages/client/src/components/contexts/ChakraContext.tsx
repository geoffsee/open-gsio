import { ChakraProvider, cookieStorageManagerSSR, localStorageManager } from '@chakra-ui/react';

export function Chakra({ cookies, children, theme }) {
  const colorModeManager =
    typeof cookies === 'string'
      ? cookieStorageManagerSSR('color_state', cookies)
      : localStorageManager;

  return (
    <ChakraProvider colorModeManager={colorModeManager} theme={theme}>
      {children}
    </ChakraProvider>
  );
}
