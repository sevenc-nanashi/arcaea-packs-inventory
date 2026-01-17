import vueI18n from "@intlify/unplugin-vue-i18n/vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import license from "rollup-plugin-license";
import uno from "unocss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    fs: {
      allow: [path.resolve(import.meta.dirname, "../..")],
    },
    proxy: {
      "/image": "http://localhost:8787",
    },
    allowedHosts: true,
  },
  plugins: [
    vue(),
    uno(),
    vueI18n({
      include: path.join(import.meta.dirname, "./src/locales/*.yml"),
    }),
    {
      name: "add-license-banner",
      generateBundle(_, bundle) {
        const banner = `/** Check THIRD_PARTY_NOTICES.txt for license details. */`;
        for (const file of Object.values(bundle)) {
          if (file.type === "chunk") {
            file.code = `${banner}\n${file.code}`;
          }
        }
      },
    },
    license({
      cwd: process.cwd(),

      thirdParty: {
        output: {
          file: path.join(import.meta.dirname, "dist", "THIRD_PARTY_NOTICES.txt"),
          encoding: "utf-8",
        },
      },
    }),
  ],
});
