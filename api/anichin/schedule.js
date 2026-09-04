// ============================================================
// GET /api/anichin/schedule — Jadwal tayang Senin–Minggu
// ============================================================
import { CORS_HEADERS, json, fetchHtml, BASE_URL, slugFromUrl } from "../_anichin.js";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET") return json(res, { status: 405, message: "Method not allowed" }, 405);

  try {
    const html = await fetchHtml(`${BASE_URL}/schedule/`);
    const $ = cheerio.load(html);

    const schedule = {};
    // .schedulepage berisi h3 hari + list .bsx; juga dukung .day wrapper
    $(".schedulepage, .schedule-day, .days").each((_, el) => {
      const day =
        $(el).find("h3, h2, .day-title").first().text().trim() ||
        $(el).attr("data-day") ||
        "";
      if (!day) return;
      const key = day.toLowerCase();
      const items = [];
      $(el).find(".bsx").each((__, itemEl) => {
        const a = $(itemEl).find("a").first();
        const link = a.attr("href") || "";
        const rawTitle =
          $(itemEl).find(".tt h2, .tt").first().text().trim() ||
          a.attr("title")?.trim() ||
          "";
        if (!link || !rawTitle) return;
        const title = rawTitle.split("\n")[0].replace(/\t+/g, " ").trim();
        const time = $(itemEl).find(".bt .epx").text().trim();
        const thumbnail =
          $(itemEl).find("img").attr("src") || $(itemEl).find("img").attr("data-src") || null;
        items.push({
          id: slugFromUrl(link),
          title,
          time,
          poster: thumbnail,
          image_cover: thumbnail,
          url: link,
        });
      });
      schedule[key] = items;
    });

    return json(res, { status: 200, data: schedule });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
