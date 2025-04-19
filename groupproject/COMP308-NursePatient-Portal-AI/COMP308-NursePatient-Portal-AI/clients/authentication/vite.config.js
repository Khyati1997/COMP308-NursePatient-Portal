// clients/authentication/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "authenticationApp",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/mf-wrapper.jsx", // ✅ must point to wrapper
      },
      shared: ["react", "react-dom", "@apollo/client", "graphql"],
    }),
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
