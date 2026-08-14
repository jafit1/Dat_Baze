import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  // Visual editing relies on stable source markers in the development preview.
  // Keep the JSX location transform out of production builds.
  plugins: [react(), tailwindcss(), process.env.NODE_ENV === "development" && jsxLocPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    // Keep the dev preview host explicit; do not use `true` here in production.
    allowedHosts: [
      "3000-i9164wvqb8j4tigmtms05-f21c7557.sg1.manus.computer",
      ".manus.computer",
      "localhost",
      "127.0.0.1",
    ],
  },
});
