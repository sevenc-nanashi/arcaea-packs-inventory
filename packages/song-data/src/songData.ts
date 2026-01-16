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
};
export type AppendData = {
  textId: string;
  title: string;
};

export type SongData = {
  index: number;
  textId: string;
  title: string;
  pack: string;
  packAppend?: string | null;
  hasEternal: boolean;
  hasBeyond: boolean;
};

export const songsData = songsDataJson as SongData[];
export const categoriesData = categoriesDataJson as CategoryData[];

export type PackKey = CategoryData["textId"];
