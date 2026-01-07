import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import checker from "vite-plugin-checker"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
    checker({
      typescript: false, // Disables the type checker completely
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
