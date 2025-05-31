import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import {defineConfig} from "vite";
import * as child_process from "node:child_process";
import {VitePWA} from 'vite-plugin-pwa';
import { configDefaults } from 'vitest/config';

const APP_FQDN = "open-gsio.seemueller.workers.dev";

export default defineConfig(({command}) => {
    const customPlugins = [
        {
            name: "sitemap-generator",
            buildStart(options) {
                if (command === "build") {
                    child_process.execSync("./scripts/generate_sitemap.js " + APP_FQDN);
                    console.log("Generated Sitemap -> public/sitemap.xml");
                    child_process.execSync("./scripts/generate_robots_txt.js " + APP_FQDN);
                    console.log("Generated robots.txt -> public/robots.txt");
                    child_process.execSync("cp -r node_modules/katex/dist/fonts public/static/fonts");
                    console.log("Copied KaTeX fonts -> public/static/fonts");

                }
            },
        },
    ];
    return {
        mode: "production",
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
            VitePWA({
                registerType: 'autoUpdate',
                devOptions: {
                    enabled: false,
                },
                manifest: {
                    name: "open-gsio",
                    short_name: "open-gsio",
                    description: "Free and open-source platform for conversational AI."
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                    navigateFallbackDenylist: [/^\/api\//],
                }
            })
        ],
        server: {
            port: 3000,
            proxy: {
                // proxies requests to worker backend
                "/api": {
                    target: "http://localhost:3001",
                },
                "/fonts": {
                    target: "http://localhost:3001/fonts",
                },
            },
        },
        esbuild: {
            drop: ["console"]
        },
        build: {
            emitAssets: false,
            sourcemap: false,
            minify: "esbuild",
            target: ["es2020", "edge88", "firefox78", "chrome87", "safari13"],
            cssMinify: true
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./src/test/setup.ts'],
            exclude: [...configDefaults.exclude, 'workers/**', 'dist/**'],
            coverage: {
                provider: 'v8',
                reporter: ['text', 'json', 'html'],
                exclude: ['node_modules/', 'src/test/']
            }
        }
    };
});
