export * from "./songData";
export * from "./unlockLogic";
export { default as inventoryKeys } from "./inventoryKeys.json";
export { default as inventory } from "./inventory.json";
export * from "./bitField";
export * from "./inventorySerialization";
export * from "./palette";

import inventoryKeys from "./inventoryKeys.json";
import { latestInventoryKeys } from "./inventorySerialization";

if (typeof process !== "undefined" && process.env.ARCAEA_PACKS_INVENTORY_SKIP_CHECK !== "1") {
  const missing = latestInventoryKeys.filter((key) => !inventoryKeys.includes(key));
  if (inventoryKeys.length !== latestInventoryKeys.length || missing.length > 0) {
    console.error("Missing inventory keys:", missing);
    throw new Error("inventoryKeys.json is out of date. Please inform the developer to update it.");
  }
}
