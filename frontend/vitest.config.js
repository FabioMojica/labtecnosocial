import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.js",
    css: true,
    restoreMocks: true,
    clearMocks: true,
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: ["src/main.jsx", "src/**/*.d.ts"],
    },
  },
});
