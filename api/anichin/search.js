// ============================================================
// GET /api/anichin/search?q=...&page=1 — Search donghua
// ============================================================
import { CORS_HEADERS, json, fetchHtml, BASE_URL, slugFromUrl } from "../_anichin.js";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET") return json(res, { status: 405, message: "Method not allowed" }, 405);

  const query = (req.query.q || "").trim();
  if (!query) return json(res, { status: 400, message: "Query pencarian diperlukan" }, 400);

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const url =
      page > 1
        ? `${BASE_URL}/page/${page}/?s=${encodeURIComponent(query)}`
        : `${BASE_URL}/?s=${encodeURIComponent(query)}`;

    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const results = [];
    $(".listupd .bsx, .animpost, article.bs .bsx").each((_, el) => {
      const a = $(el).find("a").first();
      const link = a.attr("href") || "";
      const rawTitle =
        $(el).find(".tt h2, .tt, h2").first().text().trim() ||
        a.attr("title")?.trim() ||
        "";
      if (!link || !rawTitle) return;
      const title = rawTitle.split("\n")[0].replace(/\t+/g, " ").trim();
      const status = $(el).find(".bt .epx, .status").text().trim() || undefined;
      const type = $(el).find(".typez").first().text().trim() || "Donghua";
      const thumbnail = $(el).find("img").attr("src") || $(el).find("img").attr("data-src") || null;
      results.push({
        id: slugFromUrl(link),
        title,
        status,
        type,
        poster: thumbnail,
        image_cover: thumbnail,
        url: link,
      });
    });

    // dedup
    const seen = new Set();
    const items = results.filter((r) => !seen.has(r.id) && seen.add(r.id));

    const hasNextPage =
      $(".pagination .next, .hpage .r, .next, .pagination a:contains('Next')").length > 0 ||
      $(`.pagination a[href*="/page/${page + 1}/"]`).length > 0;

    return json(res, {
      status: 200,
      data: { query, page, hasNextPage, items },
    });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
