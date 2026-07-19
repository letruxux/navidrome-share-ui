import { staticPlugin } from "@elysiajs/static";
import Elysia, { status } from "elysia";
import * as cheerio from "cheerio";
import type { ShareInfo } from "./types";

const app = new Elysia();

await app.use(
  staticPlugin({
    assets: "client/dist",
    prefix: "/",
  }),
);

app.get("/", () => Bun.file("client/dist/index.html"));

app.get("/api/extract", async (c) => {
  const { url } = c.query;
  if (!url) return status(400, { message: "Missing URL" });
  const html = await fetch(url).then((r) => r.text());
  const $ = cheerio.load(html);
  let shareInfo: ShareInfo | null = null;
  $("script").each((_, el) => {
    const inner = ($(el).html() || "").trim();
    if (inner.startsWith("window.__SHARE_INFO__")) {
      const foundShareInfo = JSON.parse(
        JSON.parse(inner.replace("window.__SHARE_INFO__ = ", "")),
      ) as ShareInfo;
      shareInfo = foundShareInfo;
    }
  });
  if (shareInfo === null) return status(404, { message: "Share not found" });
  return status(200, { shareInfo: { ...(shareInfo as ShareInfo), shareUrl: url } });
});

Bun.serve({
  port: process.env.PORT ? Number(process.env.PORT) : 3006,
  fetch: app.fetch,
});
