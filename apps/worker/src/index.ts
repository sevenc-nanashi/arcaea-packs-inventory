import { zValidator } from "@hono/zod-validator";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import van from "mini-van-plate/van-plate";
import { ImageResponse, loadGoogleFont } from "workers-og";
import * as z from "zod";

import {
  applySerializedInventoryWithName,
  categoriesData,
  palette,
  SongData,
  inventory,
  parseSerializedInventoryWithName,
} from "@arcaea-packs-inventory/song-data";

import abbrs from "./abbrs.json";
const app = new Hono();

const { div, span, meta } = van.tags;

const toStyles = (style: Record<string, string | number>) => {
  return Object.entries(style)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      return `${kebabKey}: ${value};`;
    })
    .join(" ");
};

const songsBasedPacks = ["extend1", "extend2", "extend3", "extend4", "memoryarchive"];

app.get("/", async (c) => {
  const url = new URL(c.req.url);
  let html = await env.ASSETS.fetch(c.req.raw).then((res) => res.text());
  const query = url.searchParams.get("i");
  const maybeInventory = parseSerializedInventoryWithName(query ?? "");
  const title = maybeInventory.name
    ? `${maybeInventory.name}'s Arcaea Packs Inventory`
    : "Arcaea Packs Inventory";
  const description = maybeInventory.name
    ? `Check out ${maybeInventory.name}'s Arcaea packs inventory!`
    : "Share your Arcaea inventory at a glance.";
  let dynamicMeta = [
    meta({
      name: "arcaea-packs-inventory:data",
      content: JSON.stringify({ deployId: env.VERSION_METADATA.id }),
    }),
    meta({ name: "theme-color", content: "#34333e" }),
    meta({ property: "og:type", content: "website" }),
    meta({ property: "og:url", content: "https://arcinv.sevenc7c.com" }),
    meta({ property: "og:title", content: title }),
    meta({ property: "og:description", content: description }),
    meta({ name: "twitter:title", content: title }),
    meta({ name: "twitter:description", content: description }),
    meta({ name: "description", content: description }),
  ];
  if (query) {
    const imageUrl = new URL("/image", "https://arcinv.sevenc7c.com");
    imageUrl.searchParams.set("inventory", query);
    imageUrl.searchParams.set("cache", env.VERSION_METADATA.id);
    dynamicMeta.push(
      meta({ property: "og:image:width", content: "1200" }),
      meta({ property: "og:image:height", content: "630" }),
      meta({ name: "twitter:card", content: "summary_large_image" }),
      meta({ property: "og:image", content: imageUrl.toString() }),
      meta({ name: "twitter:image", content: imageUrl.toString() }),
    );
  }

  return c.html(html.replace("</head>", `${dynamicMeta.map((el) => el.render()).join("")}</head>`));
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
    lockedSongs:
      | {
          unlocked: number;
          all: number;
        }
      | undefined;
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

const generateSectionsFromInventory = (currentInventory: Map<string, boolean>): Section[] => {
  const sections: Section[] = [];

  for (const category of categoriesData) {
    const section: Section = {
      title: category.title,
      items: [],
    };

    for (const pack of category.packs) {
      const packKey = `pack__${pack.textId}`;
      const isPackUnlocked = currentInventory.get(packKey) ?? false;

      let allAppendsUnlocked = true;
      const appendStatuses = pack.appends.map((append): AppendSection => {
        const appendKey = `pack__${append.textId}`;
        const isAppendUnlocked = currentInventory.get(appendKey) ?? false;
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

      let lockedSongs = undefined;
      if (songsBasedPacks.includes(pack.textId)) {
        const songsInPack = Object.entries(inventory).filter(([key, value]) => {
          if (!key.startsWith("song__")) {
            return false;
          }
          const song = value as unknown as SongData;
          return song.pack === pack.textId && !song.packAppend;
        });
        const lockedSongsCount = songsInPack.filter(([key]) => {
          const isUnlocked = currentInventory.get(key) ?? false;
          return !isUnlocked;
        }).length;
        lockedSongs = {
          unlocked: songsInPack.length - lockedSongsCount,
          all: songsInPack.length,
        };
      }

      section.items.push({
        name: abbrs[packKey as keyof typeof abbrs],
        unlocked,
        appends: appendStatuses,
        lockedSongs,
      });
    }
    sections.push(section);
  }
  return sections;
};

const SectionTitle = (
  title: string,
  index: number,
  fontSize: number,
  topGap: number,
  sectionGap: number,
) =>
  div(
    {
      style: toStyles({
        display: "flex",
        textAlign: "right",
        width: "20vw",
        height: "100%",
        paddingTop: `${index === 0 ? topGap : sectionGap}px`,
        paddingLeft: "20px",
        paddingRight: "10px",
        color: "#FFFFFF",
        fontSize: `${fontSize}px`,
        fontFamily: "Exo-bold",
        background: palette.arcaea,
      }),
    },
    title,
  );

const AppendLabel = (append: AppendSection) =>
  span(
    {
      style: toStyles({
        color: getColorForUnlockStatus(append.unlocked),
      }),
    },
    append.name,
  );

const AppendList = (item: Section["items"][number], fontSize: number) => {
  if (item.appends.length === 0) {
    return null;
  }
  return span(
    {
      style: toStyles({
        fontSize: `${fontSize * 0.7}px`,
        color: item.unlocked === "full" ? palette.pure : palette.arcaea,
        paddingLeft: "4px",
      }),
    },
    `(+`,
    ...item.appends.flatMap((append, index) =>
      index > 0 ? [", ", AppendLabel(append)] : [AppendLabel(append)],
    ),
    `)`,
  );
};

const SongsList = (item: Section["items"][number], fontSize: number) => {
  if (!item.lockedSongs) {
    return null;
  }
  return span(
    {
      style: toStyles({
        fontSize: `${fontSize * 0.7}px`,
        color: item.unlocked === "full" ? palette.pure : palette.arcaea,
        paddingLeft: "4px",
      }),
    },
    `(${item.lockedSongs.unlocked}/${item.lockedSongs.all})`,
  );
};

const ItemRow = (item: Section["items"][number], index: number, total: number, fontSize: number) =>
  div(
    {
      style: toStyles({
        height: `${fontSize}px`,
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
      AppendList(item, fontSize),
      SongsList(item, fontSize),
    ),
    index < total - 1
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
  );

const SectionItems = (
  items: Section["items"],
  index: number,
  fontSize: number,
  topGap: number,
  sectionGap: number,
) =>
  div(
    {
      style: toStyles({
        display: "flex",
        width: "80vw",
        flexWrap: "wrap",
        fontSize: `${fontSize * 0.9}px`,
        paddingTop: `${(index === 0 ? topGap : sectionGap) + fontSize * 0.1}px`,
        paddingRight: "20px",
        paddingLeft: "10px",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        rowGap: `${fontSize * 0.4}px`,
      }),
    },
    items.map((item, itemIndex) => ItemRow(item, itemIndex, items.length, fontSize)),
  );

const SectionRow = (
  section: Section,
  index: number,
  fontSize: number,
  topGap: number,
  sectionGap: number,
) =>
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
    SectionTitle(section.title, index, fontSize, topGap, sectionGap),
    SectionItems(section.items, index, fontSize, topGap, sectionGap),
  );

const FooterRow = (name: string | undefined, generatedAt: string | undefined, fontSize: number) => {
  const trimmedName = (name ?? "").trim();
  const footerParts = [
    trimmedName ? `${trimmedName}` : null,
    generatedAt ? `${generatedAt}` : null,
    "arcinv.sevenc7c.com",
  ].filter(Boolean);
  const footerText = footerParts.join(" / ");
  return div(
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
    div(
      {
        style: toStyles({
          display: "flex",
          width: "80vw",
          backgroundColor: "#FFFFFF",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          paddingRight: "20px",
          paddingBottom: "12px",
          fontSize: `${fontSize * 0.6}px`,
          color: palette.arcaea,
        }),
      },
      footerText,
    ),
  );
};

const renderTemplate = (
  sections: Section[],
  name: string | undefined,
  generatedAt: string | undefined,
) => {
  const fontSize = 26;
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
    sections.map((section, index) => SectionRow(section, index, fontSize, topGap, sectionGap)),
    FooterRow(name, generatedAt, fontSize),
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
    const { name, generatedAt } = applySerializedInventoryWithName(map, serializedInventory);

    const sections = generateSectionsFromInventory(map);

    const template = renderTemplate(sections, name, generatedAt);

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
