import type { Config } from 'vike/types';

// https://vike.dev/config
export default {
  passToClient: ['pageProps', 'urlPathname'],
} satisfies Config;
