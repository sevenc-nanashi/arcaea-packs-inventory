import { defineConfig, presetIcons, presetWind4, transformerDirectives } from "unocss";
import { presetAttributify } from "unocss/preset-attributify";
import { palette } from "@arcaea-packs-inventory/song-data";

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons(),
    presetAttributify({
      prefixedOnly: true,
    }),
  ],
  transformers: [transformerDirectives()],
  theme: {
    font: {
      sans: "var(--font-sans)",
      en: "Exo, Kazesawa, sans-serif",
      ja: "'Kazesawa', sans-serif",
    },
    colors: palette,
  },
  rules: [
    [
      /^align-content-(start|center|end|between|around|evenly)$/,
      ([, v]) => ({
        "align-content": v
          .replace("between", "space-between")
          .replace("around", "space-around")
          .replace("evenly", "space-evenly"),
      }),
    ],
  ],
});
