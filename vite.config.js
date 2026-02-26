import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        turno: path.resolve(__dirname, "html/turno.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "js/src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});