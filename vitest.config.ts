import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const coreRoot = resolve(__dirname, "node_modules/@learning-platform/core");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@learning-platform/core/curriculum-runtime": resolve(coreRoot, "dist/curriculum-runtime.esm.js")
    }
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"]
  }
});
