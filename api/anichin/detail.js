// ============================================================
// GET /api/anichin/detail?id=<slug|url> — Detail donghua + episode list
// id bisa: slug seri ("perfect-world") atau full URL
// ============================================================
import { CORS_HEADERS, json, fetchHtml, BASE_URL, slugFromUrl } from "../_anichin.js";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET") return json(res, { status: 405, message: "Method not allowed" }, 405);

  const id = (req.query.id || "").trim();
  if (!id) return json(res, { status: 400, message: "ID donghua diperlukan" }, 400);

  try {
    // id berbentuk slug seri → /seri/<slug>/ ; id berbentuk path lengkap → pakai apa adanya
    const cleanUrl = id.startsWith("http")
      ? id
      : id.includes("/")
        ? `${BASE_URL}/${id.replace(/^\/+|\/+$/g, "")}/`
        : `${BASE_URL}/seri/${id.replace(/^\/+|\/+$/g, "")}/`;

    const html = await fetchHtml(cleanUrl);
    const $ = cheerio.load(html);

    const title = $("h1.entry-title").text().trim();
    if (!title) return json(res, { status: 404, message: "Donghua tidak ditemukan" }, 404);

    const thumbnail =
      $(".thumb img, .wp-post-image").first().attr("src") ||
      $(".thumb img").attr("data-src") ||
      $('meta[property="og:image"]').attr("content") ||
      null;

    const synopsis = $(".synp .entry-content, .entry-content-single").first().text().trim() ||
      $('meta[name="description"]').attr("content") ||
      "";

    const rating = $(".rating strong, .num, .ratingval").first().text().trim() || null;

    const genres = [];
    $(".genxed a").each((_, el) => genres.push($(el).text().trim()));

    // metadata dari .info-content .spe span
    const metadata = {};
    $(".info-content .spe span, .spe span").each((_, el) => {
      const raw = $(el).text().replace(/\s+/g, " ").trim();
      const m = raw.match(/^([A-Za-z ]+?):\s*(.+)$/);
      if (m) {
        const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
        metadata[key] = m[2].trim();
      }
    });

    const status = metadata.status || null;
    const year = metadata.released?.match(/\d{4}/)?.[0] || metadata.season || null;
    const type = metadata.type || "Donghua";
    const otherTitle =
      $(".alternative .tl, .alter .tl, h2.alt").first().text().replace(/^Alternative:\s*/i, "").trim() ||
      null;

    // Episode list (.eplister li) — urut terbaru dulu di source; kita balik ke ascending
    const episodes = [];
    $(".eplister li, .eplister ul li").each((_, el) => {
      const a = $(el).find("a");
      const epLink = a.attr("href");
      if (!epLink) return;
      const number = parseInt($(el).find(".epl-num").text().trim(), 10) || null;
      const title = $(el).find(".epl-title").text().trim() || "";
      const date = $(el).find(".epl-date").text().trim() || "";
      const sub = $(el).find(".epl-sub .status").text().trim() || "";
      episodes.push({
        id: slugFromUrl(epLink),          // path episode, dipakai route /watch
        number: number ?? episodes.length + 1,
        title,
        date,
        sub,
        url: epLink,
      });
    });
    episodes.sort((a, b) => (a.number || 0) - (b.number || 0));

    return json(res, {
      status: 200,
      data: {
        id: slugFromUrl(cleanUrl),
        title,
        other_title: otherTitle,
        thumbnail,
        poster: thumbnail,
        image_cover: thumbnail,
        rating,
        synopsis,
        genres,
        status,
        year,
        type,
        metadata,
        episodes,
        totalEpisodes: episodes.length,
        total_episodes: episodes.length,
        url: cleanUrl,
      },
    });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
