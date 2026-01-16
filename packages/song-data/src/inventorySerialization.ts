import { BitField } from "./bitField";
import { categoriesData } from "./songData";
import inventoryKeysMap from "./inventoryKeys.json";

const separator = "__";

export const makePackInventoryKey = (textId: string) => ["pack", textId].join(separator);

export const latestInventoryKeys = categoriesData.flatMap((category) =>
  category.packs.flatMap((pack) => [
    makePackInventoryKey(pack.textId),
    ...pack.appends.map((append) => makePackInventoryKey(append.textId)),
  ]),
);

const inventoryKeyIndex = new Map<string, number>(
  latestInventoryKeys.map((key, index) => [key, index]),
);

export const serializeInventory = (inventory: ReadonlyMap<string, boolean>) => {
  const field = new BitField(latestInventoryKeys.length);
  for (const [key, value] of inventory) {
    if (!value) {
      continue;
    }
    const index = inventoryKeyIndex.get(key);
    if (index !== undefined) {
      field.set(index, true);
    }
  }
  return field.serialize();
};

export const applySerializedInventory = (inventory: Map<string, boolean>, serialized: string) => {
  if (!serialized) {
    return false;
  }
  try {
    const field = BitField.deserialize(serialized, latestInventoryKeys.length);
    for (const key of inventoryKeysMap) {
      const index = inventoryKeyIndex.get(key);
      if (index !== undefined) {
        inventory.set(key, field.get(index));
      }
    }
    return true;
  } catch {
    return false;
  }
};
