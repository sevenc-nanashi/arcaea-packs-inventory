import { defineStore } from "pinia";
import {
  applySerializedInventory,
  inventoryKeys,
  makeInventoryKey,
  serializeInventory,
} from "@shared/song-data";

export const packItselfKey = "_itself";
export const beyondKey = (name: string) => `${name}__beyond`;
const STORAGE_KEY = "arcaea-packs-inventory";

const isBrowser = typeof window !== "undefined";

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
  }),
  actions: {
    hasPack(packId: string) {
      const maybeValue = this.inventory.get(makeInventoryKey(packId));
      if (maybeValue === undefined) {
        throw new Error(`Unknown pack: ${packId}`);
      }
      return maybeValue;
    },
    setHasPack(packId: string, value: boolean) {
      this.inventory.set(makeInventoryKey(packId), value);
      persistInventory(this.inventory);
    },
    export() {
      return serializeInventory(this.inventory);
    },
    hydrate(serialized: string) {
      if (applySerializedInventory(this.inventory, serialized)) {
        persistInventory(this.inventory);
      } else {
        console.warn("Failed to hydrate inventory from export data");
      }
    },
  },
});
