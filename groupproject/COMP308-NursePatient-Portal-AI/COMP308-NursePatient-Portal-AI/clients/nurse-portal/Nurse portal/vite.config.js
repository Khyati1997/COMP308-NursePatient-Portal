import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  //base: "/", // ✅ ensure remoteEntry.js is served from root
  plugins: [
    react(),
    federation({
      name: "nursePortalApp",
      filename: "remoteEntry.js", // ✅ file must appear at http://localhost:3002/remoteEntry.js
      exposes: {
        "./App": "./src/App",
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
