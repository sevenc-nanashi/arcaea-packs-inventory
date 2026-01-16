import type { SongData } from "./songData";

export const isBeyondUnlockedByDefault = (song: SongData) => {
  if (!song.hasBeyond) {
    return null;
  }
  if (["undertale", "final", "black", "lucent"].includes(song.pack)) {
    return true;
  }
  return false;
};
