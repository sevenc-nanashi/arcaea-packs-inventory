import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { applySerializedInventory } from "@shared/song-data";
import * as z from "zod";

const app = new Hono();

app.get("/", (c) => {
  // TODO: render html
  return c.text("Hello, World!");
});

app.get(
  "/image",
  zValidator(
    "query",
    z.object({
      inventory: z.string(),
    }),
  ),
  (c) => {
    const { inventory: serializedInventory } = c.req.valid("query");
    const map = new Map();
    applySerializedInventory(map, serializedInventory);
		console.log(map);

    return c.text("Image generation not implemented", { status: 501 });
  },
);

export default app;
