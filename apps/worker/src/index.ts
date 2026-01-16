import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { applySerializedInventory, palette } from "@shared/song-data";
import * as z from "zod";
import { ImageResponse, loadGoogleFont } from "workers-og";
import van from "mini-van-plate/van-plate";
const app = new Hono();

const { div, span } = van.tags;

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

type Section = {
  title: string;
  items: { name: string; unlocked: "full" | "partial" | "locked" }[];
};

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

    const sections: Section[] = [
      {
        title: "Section 1",
        items: [
          {
            name: "Test 1",
            unlocked: "full",
          },
          { name: "Test 2", unlocked: "partial" },
          { name: "Test 3", unlocked: "locked" },
        ],
      },
      {
        title: "Section 2",
        items: [
          {
            name: "Test 1",
            unlocked: "full",
          },
          { name: "Test 2", unlocked: "partial" },
          { name: "Test 3", unlocked: "locked" },
        ],
      },
    ];

    const topGap = 10;
    const template = div(
      {
        style: toStyles({
          display: "flex",
          flexDirection: "column",
          fontFamily: "Exo",
          fontSize: "20px",
          width: "100vw",
          height: "100vh",
        }),
      },
      sections.map((section) =>
        div(
          {
            style: toStyles({
              display: "flex",
              flexDirection: "row",
              fontFamily: "Exo",
              fontSize: "20px",
              width: "100vw",
            }),
          },
          div(
            {
              style: toStyles({
                display: "flex",
                textAlign: "right",
                width: "20vw",
                height: "100%",
                paddingTop: `${topGap}px`,
                paddingLeft: "20px",
                paddingRight: "10px",
                color: "#FFFFFF",
                fontFamily: "Exo-bold",
                background: palette.arcaea,
              }),
            },
            section.title,
          ),
          div(
            {
              style: toStyles({
                display: "flex",
                width: "80vw",
                flexWrap: "wrap",
                paddingTop: `${topGap}px`,
                paddingRight: "20px",
                paddingLeft: "10px",
                backgroundColor: "#FFFFFF",
              }),
            },
            section.items
              .flatMap((item, i) => [
                i > 0 &&
                  span(
                    {
                      style: toStyles({
                        color: palette.arcaea,
                        paddingLeft: "10px",
                        paddingRight: "10px",
                      }),
                    },
                    " / ",
                  ),
                span(
                  {
                    style: toStyles({
                      display: "flex",
                      color:
                        item.unlocked === "full"
                          ? palette.pure
                          : item.unlocked === "partial"
                            ? palette.far
                            : palette.arcaea,
                      fontFamily: "Exo",
                      fontSize: "18px",
                    }),
                  },
                  item.name,
                ),
              ])
              .filter(Boolean),
          ),
        ),
      ),
      div(
        {
          style: toStyles({
            display: "flex",
            flexDirection: "row",
            fontFamily: "Exo",
            fontSize: "20px",
            width: "100vw",
            flexGrow: 1,
          }),
        },
        div({
          style: toStyles({
            display: "flex",
            textAlign: "right",
            width: "20vw",
            background: palette.arcaea,
          }),
        }),
        div({
          style: toStyles({
            display: "flex",
            width: "80vw",
            backgroundColor: "#FFFFFF",
          }),
        }),
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
        {
          name: "Exo-bold",
          data: await loadGoogleFont({
            family: "Exo",
            weight: 700,
          }),
        },
      ],
    });
  },
);

export default app;
