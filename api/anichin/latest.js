// ============================================================
// GET /api/anichin/latest?page=1 — Latest Release + pagination
// ============================================================
import { CORS_HEADERS, json, fetchHtml, parseBsxList, BASE_URL } from "../_anichin.js";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET") return json(res, { status: 405, message: "Method not allowed" }, 405);

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // Halaman depan memuat latest di .listupd pertama (Latest Release);
    // halaman /page/N memuat .listupd utama
    let items = [];
    if (page === 1) {
      $('.releases').filter((_, el) => $(el).text().trim() === "Latest Release").each((__, rel) => {
        items.push(...parseBsxList($, $(rel).closest(".bixbox, body")));
      });
      if (!items.length) items = parseBsxList($, $(".listupd").first());
    } else {
      items = parseBsxList($, $(".listupd").first());
    }

    const hasNextPage =
      $(".pagination .next, .hpage .r, .pagination a:contains('Next'), .next").length > 0 ||
      // anichin: pagination numeric — cek ada link ke page+1
      $(`.pagination a[href*="/page/${page + 1}/"]`).length > 0;

    return json(res, {
      status: 200,
      data: { page, hasNextPage, items },
    });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
