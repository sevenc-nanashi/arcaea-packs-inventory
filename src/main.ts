import { createApp } from "vue";
import "./style.css";
import "@fontsource/exo/400.css";
import "@fontsource/exo/700.css";
import "virtual:uno.css";
import { createI18n } from "vue-i18n";
import App from "./App.vue";

import en from "./locales/en.yml";
import ja from "./locales/ja.yml";

const i18n = createI18n({
  locale: navigator.language.split("-")[0],
  fallbackLocale: "en",
  messages: {
    en,
    ja,
  },
});
createApp(App).use(i18n).mount("#app");
