import categoriesDataJson from "./categoriesData.json";
import songsDataJson from "./songsData.json";
export type CategoryData = {
  textId: string;
  title: string;
  packs: PackData[];
};
export type PackData = {
  textId: string;
  title: string;
  appends: AppendData[];
  lockedSongs: LockedSongData[];
};
export type AppendData = {
  textId: string;
  title: string;
};
export type LockedSongData = {
  textId: string;
  titles: {
    en: string;
    ja: string;
  };
};

export type SongData = {
  index: number;
  textId: string;
  titles: {
    en: string;
    ja: string;
  };
  pack: string;
  packAppend?: string | null;
  hasEternal: boolean;
  hasBeyond: boolean;
};

export const songsData = songsDataJson as SongData[];
export const categoriesData = categoriesDataJson as CategoryData[];

export type PackKey = CategoryData["textId"];
