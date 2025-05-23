import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";
import * as child_process from "node:child_process";

export default defineConfig(({ command }) => {
  const customPlugins = [
    {
      name: "sitemap-generator",
      buildStart(options) {
        if (command === "build") {
          child_process.execSync("./scripts/gen_sitemap.js");
          console.log("Generated Sitemap -> public/sitemap.xml");
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
      emitAssets: true,

      sourcemap: false,
      target: ["es2020", "edge88", "firefox78", "chrome87", "safari13"],
      minify: "terser",
      terserOptions: {
        compress: {
          passes: 4,
          arrows: true,
          drop_console: true,
          drop_debugger: true,
          sequences: true,
        },
        mangle: {},
        ecma: 2020,
        enclose: false,
        keep_classnames: false,
        keep_fnames: false,
        ie8: false,
        module: true,
        nameCache: null,
        safari10: false,
        toplevel: true,
      },

      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes("node_modules")) {
              if (
                id.includes("shiki/dist/wasm") ||
                id.endsWith("wasm-inlined.mjs")
              ) {
                return "@wasm";
              }

              if (
                id.includes("katex") ||
                id.includes("marked") ||
                id.includes("shiki")
              ) {
                return "@code";
              }

              if (id.includes("react-dom") || id.includes("vike")) {
                return "@logic";
              }

              if (id.includes("mobx") || id.includes("framer-motion")) {
                return "@framework";
              }
            }
          },
        },
      },
      cssMinify: true,
    },
  };
});
