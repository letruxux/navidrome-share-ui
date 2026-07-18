import Elysia, { status } from "elysia";
import * as cheerio from "cheerio";

const app = new Elysia();

export interface ShareInfo {
  id: string;
  description: string;
  downloadable: boolean;
  tracks: {
    id: string;
    title: string;
    artist: string;
    album: string;
    updatedAt: string;
    duration: number;
  }[];
  shareUrl: string;
}

app.get("/extract", async (c) => {
  const { url } = c.query;
  console.log(url);
  if (!url) return status(400, { message: "Missing URL" });
  const html = await fetch(url).then((r) => r.text());
  const $ = cheerio.load(html);
  let shareInfo: ShareInfo | null = null;
  $("script").each((i, el) => {
    const inner = ($(el).html() || "").trim();
    if (inner.startsWith("window.__SHARE_INFO__")) {
      const foundShareInfo = JSON.parse(
        JSON.parse(inner.replace("window.__SHARE_INFO__ = ", "")),
      );
      shareInfo = foundShareInfo;
    }
  });
  console.log(shareInfo);
  if (!shareInfo) return status(404, { message: "Share not found" });
  return status(200, { shareInfo: { ...shareInfo, shareUrl: url } });
});

Bun.serve({
  port: 3006,
  fetch: app.fetch,
});
