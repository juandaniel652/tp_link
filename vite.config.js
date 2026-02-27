import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"), 
        turno: path.resolve(__dirname, "html/turno.html"),
        tecnico: path.resolve(__dirname, "html/tecnico.html"),
        cliente: path.resolve(__dirname, "html/cliente.html"),
        agenda: path.resolve(__dirname, "html/agenda.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "js/src"),
    },
  },
});