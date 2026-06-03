import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        projects: resolve(__dirname, "projects/index.html"),
        about: resolve(__dirname, "about/index.html"),
        contact: resolve(__dirname, "contact/index.html"),
      },
    },
    assetsInclude: ["**/*.jpg", "**/*.jpeg", "**/*.webp", "**/*.png", "**/*.svg"],
    copyPublicDir: true,
  },
});
