import { defineConfig, presetIcons, presetWind4, transformerDirectives } from "unocss";
import { presetAttributify } from "unocss/preset-attributify";
import { palette } from "@shared/song-data";

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
    font: palette.font,
    colors: palette.colors,
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
