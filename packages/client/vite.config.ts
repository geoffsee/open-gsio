import * as child_process from 'node:child_process';

import react from '@vitejs/plugin-react';
import { plugin as vike } from 'vike/plugin';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
// eslint-disable-next-line import/no-unresolved
import { configDefaults } from 'vitest/config';

export default defineConfig(({ command }) => {
  const customPlugins = [
    {
      name: 'sitemap-generator',
      buildStart(options) {
        if (command === 'build') {
          child_process.execSync('bun run generate:sitemap');
          console.log('Generated Sitemap -> public/sitemap.xml');
          child_process.execSync('bun run generate:robotstxt');
          console.log('Generated robots.txt -> public/robots.txt');
          child_process.execSync('bun run generate:fonts');
          console.log('Copied fonts -> public/static/fonts');
        }
      },
    },
  ];
  return {
    mode: 'production',
    plugins: [
      ...customPlugins,
      vike({
        prerender: true,
      }),
      react(),
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
      // VitePWA({
      //     registerType: 'autoUpdate',
      //     devOptions: {
      //         enabled: false,
      //     },
      //     manifest: {
      //         name: "open-gsio",
      //         short_name: "open-gsio",
      //         description: "Assistant"
      //     },
      //     workbox: {
      //         globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      //         navigateFallbackDenylist: [/^\/api\//],
      //     }
      // })
    ],
    server: {
      port: 3000,
      proxy: {
        // proxies requests to server
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
