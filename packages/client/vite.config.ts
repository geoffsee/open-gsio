import * as child_process from 'node:child_process';

import react from '@vitejs/plugin-react';
import { plugin as vike } from 'vike/plugin';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
// eslint-disable-next-line import/no-unresolved
import { configDefaults } from 'vitest/config';

import { getColorThemes } from './src/layout/theme/color-themes';

const prebuildPlugin = () => ({
  name: 'prebuild',
  config(config, { command }) {
    if (command === 'build') {
      console.log('Generate PWA Assets -> public/');
      child_process.execSync('bun generate:pwa:assets');
      console.log('Generated Sitemap -> public/sitemap.xml');
      child_process.execSync('bun generate:sitemap');
      console.log('Generated Sitemap -> public/sitemap.xml');
      child_process.execSync('bun run generate:robotstxt');
      console.log('Generated robots.txt -> public/robots.txt');
      child_process.execSync('bun run generate:fonts');
      console.log('Copied fonts -> public/static/fonts');
    }
  },
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
// const PROJECT_SOURCES_HASH = sha512Dir('./src');
//
// console.log({ PROJECT_SOURCES_HASH });

const buildId = crypto.randomUUID();

export default defineConfig(({ command }) => {
  return {
    mode: 'production',
    plugins: [
      prebuildPlugin(),
      react(),
      vike({
        prerender: true,
        disableAutoFullBuild: false,
      }),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        minify: true,
        disable: false,
        filename: 'service-worker.js',
        devOptions: {
          enabled: false,
          navigateFallback: 'index.html',
          suppressWarnings: true,
          type: 'module',
        },
        manifest: {
          name: `open-gsio`,
          short_name: 'open-gsio',
          display: 'standalone',
          description: `open-gsio client`,
          theme_color: getColorThemes().at(0)?.colors.text.accent,
          background_color: getColorThemes().at(0)?.colors.background.primary,
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },

        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
          navigateFallbackDenylist: [/^\/api\//],
          maximumFileSizeToCacheInBytes: 25000000,
          cacheId: buildId,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
        },
      }),
      // PWA plugin saves money on data transfer by caching assets on the client
      /*
                For safari, use this script in the console to unregister the service worker.
                await navigator.serviceWorker.getRegistrations()
                   .then(registrations => {
                    registrations.map(r => {
                    r.unregister()
                    })
                })
             */
    ],
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
      navigateFallbackDenylist: [/^\/api\//],
      maximumFileSizeToCacheInBytes: 25000000,
      cacheId: buildId,
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },
    server: {
      port: 3000,
      proxy: {
        // proxies requests in development
        '/api': {
          target: 'http://localhost:3003',
        },
        '/fonts': {
          target: 'http://localhost:3003/fonts',
        },
      },
    },
    esbuild: {
      // drop: ["console"]
    },
    build: {
      emitAssets: true,
      sourcemap: false,
      minify: 'esbuild',
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13'],
      cssMinify: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      registerNodeLoader: false,
      setupFiles: ['./src/test/setup.ts'],
      exclude: [...configDefaults.exclude, 'dist/**'],
      reporters: process.env.GITHUB_ACTIONS ? ['dot', 'github-actions', 'html'] : ['dot', 'html'],
      coverage: {
        // you can include other reporters, but 'json-summary' is required, json is recommended
        reporter: ['json-summary', 'json', 'html'],
        reportsDirectory: 'coverage',
        // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
        reportOnFailure: true,
      },
    },
  };
});
