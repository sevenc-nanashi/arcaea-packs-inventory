import path from "node:path";
import vueI18n from "@intlify/unplugin-vue-i18n/vite";
import vue from "@vitejs/plugin-vue";
import uno from "unocss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    fs: {
      allow: [path.resolve(import.meta.dirname, "../..")],
    },
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@shared/song-data": path.resolve(
        import.meta.dirname,
        "../../packages/song-data/src/index.ts",
      ),
    },
  },
  plugins: [
    vue(),
    uno(),
    vueI18n({
      include: path.join(import.meta.dirname, "./src/locales/*.yml"),
    }),
  ],
});
