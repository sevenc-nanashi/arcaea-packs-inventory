import { inventoryKeys } from ".";
import { BitField } from "./bitField";
import inventoryKeysMap from "./inventoryKeys.json";

const separator = "__";

export const makePackInventoryKey = (textId: string) => ["pack", textId].join(separator);

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

const decodeMaybeUriComponent = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const isLikelyDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const serializeInventoryWithName = (
  name: string,
  inventory: ReadonlyMap<string, boolean>,
  generatedAt?: string,
) => {
  const serialized = serializeInventory(inventory);
  const trimmedName = name.trim();
  let date = (generatedAt ?? "").trim();
  if (!trimmedName && !date) {
    return serialized;
  }
  if (!date) {
    date = new Date().toISOString().slice(0, 10);
  }
  if (!serialized) {
    return serialized;
  }
  const version = serialized[0];
  const base64 = serialized.slice(1);
  if (!version) {
    return serialized;
  }
  return `${version}${encodeURIComponent(trimmedName)},${date},${base64}`;
};

export const parseSerializedInventoryWithName = (serializedWithName: string) => {
  if (!serializedWithName.startsWith("1")) {
    return {
      name: undefined as string | undefined,
      generatedAt: undefined as string | undefined,
      serialized: "",
    };
  }
  const firstCommaIndex = serializedWithName.indexOf(",", 1);
  const secondCommaIndex =
    firstCommaIndex === -1 ? -1 : serializedWithName.indexOf(",", firstCommaIndex + 1);
  if (firstCommaIndex === -1 || secondCommaIndex === -1) {
    return {
      name: undefined as string | undefined,
      generatedAt: undefined as string | undefined,
      serialized: "",
    };
  }
  const rawName = serializedWithName.slice(1, firstCommaIndex);
  const date = serializedWithName.slice(firstCommaIndex + 1, secondCommaIndex);
  const base64 = serializedWithName.slice(secondCommaIndex + 1);
  if (!isLikelyDate(date)) {
    return {
      name: undefined as string | undefined,
      generatedAt: undefined as string | undefined,
      serialized: "",
    };
  }
  return {
    name: decodeMaybeUriComponent(rawName) || undefined,
    generatedAt: date,
    serialized: `1${base64}`,
  };
};

export const applySerializedInventoryWithName = (
  inventory: Map<string, boolean>,
  serializedWithName: string,
) => {
  const { name, generatedAt, serialized } = parseSerializedInventoryWithName(serializedWithName);
  const ok = applySerializedInventory(inventory, serialized);
  return { ok, name, generatedAt };
};

export const serializeInventoryWithMeta = serializeInventoryWithName;
export const parseSerializedInventoryWithMeta = parseSerializedInventoryWithName;
export const applySerializedInventoryWithMeta = applySerializedInventoryWithName;
