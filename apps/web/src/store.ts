import { defineStore } from "pinia";
import {
  applySerializedInventory,
  inventoryKeys,
  inventoryKeysMap,
  makeInventoryKey,
  serializeInventory,
} from "@shared/song-data";

export const packItselfKey = "_itself";
export const beyondKey = (name: string) => `${name}__beyond`;
const STORAGE_KEY = "arcaea-packs-inventory";

if (inventoryKeys.some((key) => !inventoryKeysMap.includes(key))) {
  if (import.meta.env.DEV) {
    if (confirm("inventoryKeys.json is out of date. Download the updated version?")) {
      const updatedKeys = inventoryKeysMap.slice();
      for (const key of inventoryKeys) {
        if (!updatedKeys.includes(key)) {
          updatedKeys.push(key);
        }
      }
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(updatedKeys, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "inventoryKeys.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  } else {
    alert("Warning: inventoryKeys.json is out of date. Please inform the developer to update it.");
    throw new Error("inventoryKeys.json is out of date. Please inform the developer to update it.");
  }
}

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
  for (const key of inventoryKeysMap) {
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
