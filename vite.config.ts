import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";
import * as child_process from "node:child_process";

const APP_FQDN = "open-gsio.seemueller.workers.dev";

export default defineConfig(({ command }) => {
  const customPlugins = [
    {
      name: "sitemap-generator",
      buildStart(options) {
        if (command === "build") {
          child_process.execSync("./scripts/generate_sitemap.js " + APP_FQDN);
          console.log("Generated Sitemap -> public/sitemap.xml");
          child_process.execSync("./scripts/generate_robots_txt.js " + APP_FQDN);
          console.log("Generated robots.txt -> public/robots.txt");
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
    build: {
      emitAssets: false,
      sourcemap: false,
      minify: true,
      target: ["es2020", "edge88", "firefox78", "chrome87", "safari13"],
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              // creating a chunk to react routes deps. Reducing the vendor chunk size
              if (id.includes('shiki/dist/wasm')) {
                return '@wasm-bundle';
              }

              if (id.includes('katex') || id.includes('marked') || id.includes('shiki')) {
                return '@resources-bundle';
              }


              if (id.includes('chakra') || id.includes('emotion-react')) {
                return '@gui-bundle';
              }


              if (id.includes('react-dom') || id.includes('vike') || id.includes('mobx') || id.includes('framer-motion')) {
                return '@logic-bundle';
              }
              return 'vendor';
            }
          }
        }
      },
      cssMinify: true
    },
  };
});
