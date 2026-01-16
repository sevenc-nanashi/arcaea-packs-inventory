import { defineStore } from "pinia";
import {
  applySerializedInventoryWithName,
  inventoryKeys,
  makePackInventoryKey,
  makeSongInventoryKey,
  serializeInventoryWithName,
} from "@shared/song-data";

export const packItselfKey = "_itself";
export const beyondKey = (name: string) => `${name}__beyond`;
const STORAGE_KEY = "arcaea-packs-inventory";
const USER_NAME_KEY = "arcaea-packs-inventory:user-name";

const isBrowser = typeof window !== "undefined";

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const readPersistedInventory = (): Record<string, boolean> | undefined => {
  if (!isBrowser) {
    return undefined;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, boolean>;
    }
  } catch {
    console.warn("Failed to parse persisted inventory");
  }
  return undefined;
};

const readPersistedUserName = () => {
  if (!isBrowser) {
    return "";
  }
  return window.localStorage.getItem(USER_NAME_KEY) ?? "";
};

const persistInventory = (inventory: Map<string, boolean>) => {
  if (!isBrowser) {
    return;
  }
  const payload: Record<string, boolean> = {};
  for (const key of inventoryKeys) {
    payload[key] = Boolean(inventory.get(key));
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const persistUserName = (name: string) => {
  if (!isBrowser) {
    return;
  }
  if (!name) {
    window.localStorage.removeItem(USER_NAME_KEY);
    return;
  }
  window.localStorage.setItem(USER_NAME_KEY, name);
};

const createInventoryMap = () => {
  const inventory = new Map<string, boolean>();
  for (const key of inventoryKeys) {
    inventory.set(key, false);
  }
  const persisted = readPersistedInventory();
  if (persisted) {
    for (const key of inventoryKeys) {
      if (Object.prototype.hasOwnProperty.call(persisted, key)) {
        inventory.set(key, Boolean(persisted[key]));
      }
    }
  }
  return inventory;
};

export const useUnlockableContentsStore = defineStore("unlockableContents", {
  state: () => ({
    inventory: createInventoryMap(),
    userName: readPersistedUserName(),
  }),
  actions: {
    setUserName(name: string) {
      this.userName = name;
      persistUserName(name.trim());
    },
    hasPack(packId: string) {
      const maybeValue = this.inventory.get(makePackInventoryKey(packId));
      if (maybeValue === undefined) {
        throw new Error(`Unknown pack: ${packId}`);
      }
      return maybeValue;
    },
    hasSong(songId: string) {
      const maybeValue = this.inventory.get(makeSongInventoryKey(songId));
      if (maybeValue === undefined) {
        throw new Error(`Unknown song: ${songId}`);
      }
      return maybeValue;
    },
    setHasPack(packId: string, value: boolean) {
      this.inventory.set(makePackInventoryKey(packId), value);
      persistInventory(this.inventory);
    },
    setHasSong(songId: string, value: boolean) {
      this.inventory.set(makeSongInventoryKey(songId), value);
      persistInventory(this.inventory);
    },
    export() {
      return serializeInventoryWithName(this.userName, this.inventory, formatLocalDate(new Date()));
    },
    hydrate(serialized: string) {
      const { ok, name } = applySerializedInventoryWithName(this.inventory, serialized);
      if (ok) {
        persistInventory(this.inventory);
        if (name !== undefined && name.trim()) {
          this.setUserName(name);
        }
      } else {
        console.warn("Failed to hydrate inventory from export data");
      }
    },
  },
});
