import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { applySerializedInventory, categoriesData, palette } from "@shared/song-data";
import abbrs from "./abbrs.json";
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

type AppendSection = {
  name: string;
  unlocked: "full" | "partial" | "locked";
};
type Section = {
  title: string;
  items: {
    name: string;
    unlocked: "full" | "partial" | "locked";
    appends: AppendSection[];
  }[];
};

const getColorForUnlockStatus = (status: "full" | "partial" | "locked") => {
  switch (status) {
    case "full":
      return palette.pure;
    case "partial":
      return palette.far;
    case "locked":
      return palette.arcaea;
  }
};

const generateSectionsFromInventory = (inventory: Map<string, boolean>): Section[] => {
  const sections: Section[] = [];

  for (const category of categoriesData) {
    const section: Section = {
      title: category.title,
      items: [],
    };

    for (const pack of category.packs) {
      const packKey = `pack__${pack.textId}`;
      const isPackUnlocked = inventory.get(packKey) ?? false;

      let allAppendsUnlocked = true;
      const appendStatuses = pack.appends.map((append): AppendSection => {
        const appendKey = `pack__${append.textId}`;
        const isAppendUnlocked = inventory.get(appendKey) ?? false;
        if (!isAppendUnlocked) {
          allAppendsUnlocked = false;
        }
        return {
          name: abbrs[appendKey as keyof typeof abbrs],
          unlocked: isAppendUnlocked ? "partial" : "locked",
        };
      });

      let unlocked: "full" | "partial" | "locked" = "locked";
      if (appendStatuses.length === 0) {
        unlocked = isPackUnlocked ? "full" : "locked";
      } else {
        if (isPackUnlocked && allAppendsUnlocked) {
          unlocked = "full";
          for (const appendStatus of appendStatuses) {
            appendStatus.unlocked = "full";
          }
        } else if (isPackUnlocked) {
          unlocked = "partial";
        } else {
          unlocked = "locked";
        }
      }

      section.items.push({
        name: abbrs[packKey as keyof typeof abbrs],
        unlocked,
        appends: appendStatuses,
      });
    }
    sections.push(section);
  }
  return sections;
};

const renderTemplate = (sections: Section[]) => {
  const fontSize = 24;
  const topGap = fontSize;
  const sectionGap = fontSize * 0.5;
  const template = div(
    {
      style: toStyles({
        display: "flex",
        flexDirection: "column",
        fontFamily: "Exo",
        fontSize: `${fontSize}px`,
        width: "100vw",
        height: "100vh",
      }),
    },
    sections.map((section, i) =>
      div(
        {
          style: toStyles({
            display: "flex",
            flexDirection: "row",
            fontFamily: "Exo",
            fontSize: `${fontSize}px`,
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
              paddingTop: `${i === 0 ? topGap : sectionGap}px`,
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
              fontSize: `${fontSize * 0.9}px`,
              paddingTop: `${(i === 0 ? topGap : sectionGap) + fontSize * 0.1}px`,
              paddingRight: "20px",
              paddingLeft: "10px",
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              rowGap: `${fontSize * 0.4}px`,
            }),
          },
          section.items.map((item, i) =>
            div(
              {
                style: toStyles({
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                }),
              },
              span(
                {
                  style: toStyles({
                    display: "flex",
                    color: getColorForUnlockStatus(item.unlocked),
                    fontFamily: "Exo",
                    alignItems: "center",
                  }),
                },
                item.name,
                item.appends.length > 0
                  ? span(
                      {
                        style: toStyles({
                          fontSize: `${fontSize * 0.7}px`,
                          color: item.unlocked === "full" ? palette.pure : palette.arcaea,
                          paddingLeft: "4px",
                        }),
                      },
                      `(+`,
                      ...item.appends.flatMap((append, i) =>
                        i > 0
                          ? [
                              ", ",
                              span(
                                {
                                  style: toStyles({
                                    color: getColorForUnlockStatus(append.unlocked),
                                  }),
                                },
                                append.name,
                              ),
                            ]
                          : [
                              span(
                                {
                                  style: toStyles({
                                    color: getColorForUnlockStatus(append.unlocked),
                                  }),
                                },
                                append.name,
                              ),
                            ],
                      ),
                      `)`,
                    )
                  : null,
              ),
              i < section.items.length - 1
                ? span(
                    {
                      style: toStyles({
                        whiteSpace: "pre",
                        color: palette.arcaea,
                      }),
                    },
                    " / ",
                  )
                : null,
            ),
          ),
        ),
      ),
    ),
    div(
      {
        style: toStyles({
          display: "flex",
          flexDirection: "row",
          fontFamily: "Exo",
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

  return template;
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

    const sections = generateSectionsFromInventory(map);

    const template = renderTemplate(sections);

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
