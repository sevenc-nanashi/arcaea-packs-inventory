import { BitField } from "./bitField";
import { categoriesData } from "./songData";
import inventoryKeysMap from "./inventoryKeys.json";

const separator = "__";

export const makeInventoryKey = (textId: string) => ["pack", textId].join(separator);

export const inventoryKeys = categoriesData.flatMap((category) =>
  category.packs.flatMap((pack) => [
    makeInventoryKey(pack.textId),
    ...pack.appends.map((append) => makeInventoryKey(append.textId)),
  ]),
);

const inventoryKeyIndex = new Map<string, number>(inventoryKeys.map((key, index) => [key, index]));

export const serializeInventory = (inventory: ReadonlyMap<string, boolean>) => {
  const field = new BitField(inventoryKeys.length);
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
    const field = BitField.deserialize(serialized, inventoryKeys.length);
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
