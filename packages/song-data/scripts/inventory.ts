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
const makeSongInventoryKey = (textId: string) => ["song", textId].join(separator);
const lockedSongPackIds = new Set(["extend1", "extend2", "extend3", "extend4", "memoryarchive"]);

const root = path.resolve(import.meta.dirname, "..");

const keysOutputPath = path.join(root, "src", "inventoryKeys.json");
const mapOutputPath = path.join(root, "src", "inventory.json");
const categoriesDataOutputPath = path.join(root, "src", "categoriesData.json");
const songsDataOutputPath = path.join(root, "src", "songsData.json");

const categoryList = categories as BaseCategoryData[];
const songList = songs as BaseSongData[];

const inventory = new Map<
  string,
  | BaseCategoryData["packs"][number]
  | BaseCategoryData["packs"][number]["appends"][number]
  | BaseSongData
>();
for (const category of categoryList) {
  for (const pack of category.packs) {
    inventory.set(makePackInventoryKey(pack.text_id), pack);
    for (const append of pack.appends) {
      inventory.set(makePackInventoryKey(`${pack.text_id}__${append.text_id}`), append);
    }
  }
}
for (const song of songList) {
  if (lockedSongPackIds.has(song.pack) && !song.pack_append) {
    inventory.set(makeSongInventoryKey(song.text_id), song);
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
  packs: category.packs.map((pack) => {
    const lockedSongs =
      lockedSongPackIds.has(pack.text_id) && !pack.appends.length
        ? songList
            .filter((song) => song.pack === pack.text_id && !song.pack_append)
            .map((song) => ({
              textId: song.text_id,
              title: song.title,
            }))
        : [];
    return {
      textId: pack.text_id,
      title: pack.title,
      appends: pack.appends.map((append) => ({
        textId: `${pack.text_id}__${append.text_id}`,
        title: append.title,
      })),
      lockedSongs,
    };
  }),
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
