import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { applySerializedInventory, palette } from "@shared/song-data";
import * as z from "zod";
import { ImageResponse, loadGoogleFont } from "workers-og";
import van from "mini-van-plate/van-plate";
const app = new Hono();

const { div } = van.tags;

const toStyles = (style: Record<string, string | number>) => {
  return Object.entries(style)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      return `${kebabKey}: ${value};`;
    })
    .join(" ");
};

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
  async (c) => {
    const { inventory: serializedInventory } = c.req.valid("query");
    const map = new Map();
    applySerializedInventory(map, serializedInventory);
    const template = div(
      {
        style: toStyles({
          display: "flex",
          fontFamily: "Exo",
          width: "100%",
          height: "100%",
        }),
      },
      div(
        {
          style: toStyles({
            display: "flex",
            height: "100%",
            padding: "20px",
            color: "#FFFFFF",
            background: palette.colors.arcaea,
          }),
        },
        "My Rhythm Game",
      ),
      div(
        {
          style: toStyles({
            display: "flex",
            width: 200,
            height: 200,
            backgroundColor: "#FFFFFF",
          }),
        },
        "A",
      ),
    ).render();

    return new ImageResponse(template, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Exo",
          data: await loadGoogleFont({
            family: "Exo",
          }),
        },
      ],
    });
  },
);

export default app;
