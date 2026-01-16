import { writeFile } from "node:fs/promises";
import path from "node:path";
import categories from "../src/categories.json";
import songs from "../src/songs.json";

type BaseSongData = {
  index: number;
  text_id: string;
  title: string;
  pack: string;
  pack_append: string | null;
  has_eternal: boolean;
  has_beyond: boolean;
};
type BaseCategoryData = {
  text_id: string;
  title: string;
  packs: {
    text_id: string;
    title: string;
    appends: {
      text_id: string;
      title: string;
    }[];
  }[];
};

const separator = "__";
const makePackInventoryKey = (textId: string) => ["pack", textId].join(separator);

const root = path.resolve(import.meta.dirname, "..");

const keysOutputPath = path.join(root, "src", "inventoryKeys.json");
const mapOutputPath = path.join(root, "src", "inventory.json");
const categoriesDataOutputPath = path.join(root, "src", "categoriesData.json");
const songsDataOutputPath = path.join(root, "src", "songsData.json");

const categoryList = categories as BaseCategoryData[];
const songList = songs as BaseSongData[];

const inventory = new Map<
  string,
  BaseCategoryData["packs"][number] | BaseCategoryData["packs"][number]["appends"][number]
>();
for (const category of categoryList) {
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
const categoriesData = categoryList.map((category) => ({
  textId: category.text_id,
  title: category.title,
  packs: category.packs.map((pack) => ({
    textId: pack.text_id,
    title: pack.title,
    appends: pack.appends.map((append) => ({
      textId: `${pack.text_id}__${append.text_id}`,
      title: append.title,
    })),
  })),
}));
const songsData = songList.map((song) => ({
  index: song.index,
  textId: song.text_id,
  title: song.title,
  pack: song.pack,
  packAppend: song.pack_append ?? undefined,
  hasEternal: song.has_eternal,
  hasBeyond: song.has_beyond,
}));
await writeFile(
  categoriesDataOutputPath,
  JSON.stringify(categoriesData, null, 2) + "\n",
  "utf8",
);
await writeFile(songsDataOutputPath, JSON.stringify(songsData, null, 2) + "\n", "utf8");
console.log(`Wrote ${inventory.size} inventory keys`);
