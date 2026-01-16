import path from "node:path";
import vueI18n from "@intlify/unplugin-vue-i18n/vite";
import yaml from "@rollup/plugin-yaml";
import vue from "@vitejs/plugin-vue";
import uno from "unocss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
server: {
allowedHosts: true
},
  plugins: [
    vue(),
    uno(),
    yaml(),
    vueI18n({
      include: path.join(import.meta.dirname, "./src/locales/*.yml"),
    }),
  ],
});
