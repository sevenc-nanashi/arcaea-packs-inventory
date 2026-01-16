import fs from "fs/promises";
import { inventory } from "@arcaea-packs-inventory/song-data";

const currentAbbrs = await fs
  .readFile("./src/abbrs.json", "utf-8")
  .then((data) => JSON.parse(data) as Record<string, string>);

for (const [key, value] of Object.entries(inventory)) {
  if (key.startsWith("song__")) {
    continue;
  }
  if (!(key in currentAbbrs)) {
    console.warn(`Missing abbr for key: ${key}`);
    currentAbbrs[key] = value.title;
  }
}

await fs.writeFile("./src/abbrs.json", JSON.stringify(currentAbbrs, null, 2) + "\n", "utf-8");
