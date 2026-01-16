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
  plugins: [
    vue(),
    uno(),
    vueI18n({
      include: path.join(import.meta.dirname, "./src/locales/*.yml"),
    }),
  ],
});
