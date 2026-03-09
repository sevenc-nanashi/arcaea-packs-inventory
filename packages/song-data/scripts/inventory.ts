import { writeFile } from "node:fs/promises";
import path from "node:path";

import { CategoryData, SongData } from "../src";
import categories from "../src/categories.json";
import englishTitles from "../src/englishTitles.json";
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
    index: number;
    text_id: string;
    title: string;
    appends: {
      index: number;
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
let nextInventoryIndex = Math.max(...songList.map((song) => song.index), -1) + 1;

const ensureIndex = (index: number | undefined): number => {
  if (index !== undefined) {
    return index;
  }
  const current = nextInventoryIndex;
  nextInventoryIndex += 1;
  return current;
};

const normalizedCategoryList = categoryList.map((category) => ({
  ...category,
  packs: category.packs.map((pack) => ({
    ...pack,
    index: ensureIndex(pack.index),
    appends: pack.appends.map((append) => ({
      ...append,
      index: ensureIndex(append.index),
    })),
  })),
}));

const inventory = new Map<
  string,
  | BaseCategoryData["packs"][number]
  | BaseCategoryData["packs"][number]["appends"][number]
  | BaseSongData
>();
for (const category of normalizedCategoryList) {
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

await writeFile(
  keysOutputPath,
  JSON.stringify(
    [...inventory.keys()].sort((a, b) => inventory.get(a)!.index - inventory.get(b)!.index),
    null,
    2,
  ) + "\n",
  "utf8",
);
await writeFile(
  mapOutputPath,
  JSON.stringify(Object.fromEntries(inventory), null, 2) + "\n",
  "utf8",
);
const categoriesData = normalizedCategoryList.map(
  (category): CategoryData => ({
    textId: category.text_id,
    title: category.title,
    packs: category.packs.map((pack) => {
      const lockedSongs =
        lockedSongPackIds.has(pack.text_id) && !pack.appends.length
          ? songList
              .filter((song) => song.pack === pack.text_id && !song.pack_append)
              .map((song) => ({
                textId: song.text_id,
                titles: {
                  ja: song.title,
                  en: englishTitles[song.text_id] || song.title,
                },
              }))
          : [];
      return {
        index: pack.index,
        textId: pack.text_id,
        title: pack.title,
        appends: pack.appends.map((append) => ({
          index: append.index,
          textId: `${pack.text_id}__${append.text_id}`,
          title: append.title,
        })),
        lockedSongs,
      };
    }),
  }),
);
const songsData = songList.map(
  (song): SongData => ({
    index: song.index,
    textId: song.text_id,
    titles: {
      ja: song.title,
      en: englishTitles[song.text_id] || song.title,
    },
    pack: song.pack,
    packAppend: song.pack_append ?? undefined,
    hasEternal: song.has_eternal,
    hasBeyond: song.has_beyond,
  }),
);
await writeFile(categoriesDataOutputPath, JSON.stringify(categoriesData, null, 2) + "\n", "utf8");
await writeFile(songsDataOutputPath, JSON.stringify(songsData, null, 2) + "\n", "utf8");
console.log(`Wrote ${inventory.size} inventory keys`);
