import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AppendData, makePackInventoryKey, PackData } from "../src";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const categoriesPath = path.join(root, "src", "categories.json");
const keysOutputPath = path.join(root, "src", "inventoryKeys.json");
const mapOutputPath = path.join(root, "src", "inventory.json");

const categories = JSON.parse(await readFile(categoriesPath, "utf8"));

const inventory = new Map<string, PackData | AppendData>();
for (const category of categories) {
  for (const pack of category.packs) {
    inventory.set(makePackInventoryKey(pack.text_id), pack);
    for (const append of pack.appends) {
      inventory.set(makePackInventoryKey(`${pack.text_id}__${append.text_id}`), append);
    }
  }
}

await writeFile(keysOutputPath, JSON.stringify([...inventory.keys()], null, 2) + "\n", "utf8");
await writeFile(
  mapOutputPath,
  JSON.stringify(Object.fromEntries(inventory), null, 2) + "\n",
  "utf8",
);
console.log(`Wrote ${inventory.size} inventory keys`);
