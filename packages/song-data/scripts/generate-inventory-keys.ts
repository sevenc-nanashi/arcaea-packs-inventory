import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const categoriesPath = path.join(root, "src", "categories.json");
const outputPath = path.join(root, "src", "inventoryKeys.json");

const categories = JSON.parse(await readFile(categoriesPath, "utf8"));

const makeInventoryKey = (textId) => ["pack", textId].join("__");

const inventoryKeys = [];
for (const category of categories) {
  for (const pack of category.packs) {
    inventoryKeys.push(makeInventoryKey(pack.text_id));
    for (const append of pack.appends) {
      inventoryKeys.push(makeInventoryKey(`${pack.text_id}__${append.text_id}`));
    }
  }
}

await writeFile(outputPath, JSON.stringify(inventoryKeys, null, 2) + "\n", "utf8");
console.log(`Wrote ${inventoryKeys.length} keys to ${path.relative(process.cwd(), outputPath)}`);
