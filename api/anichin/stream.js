// ============================================================
// GET /api/anichin/stream?id=<episode-path|url> — Streaming episode
// Return: embed utama, multi-server (decoded base64), downloads, nav
// ============================================================
import { CORS_HEADERS, json, fetchHtml, decodeBase64, BASE_URL, slugFromUrl } from "../_anichin.js";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET") return json(res, { status: 405, message: "Method not allowed" }, 405);

  const id = (req.query.id || "").trim();
  if (!id) return json(res, { status: 400, message: "URL/path episode diperlukan" }, 400);

  try {
    const cleanUrl = id.startsWith("http")
      ? id
      : `${BASE_URL}/${id.replace(/^\/+|\/+$/g, "")}/`;

    const html = await fetchHtml(cleanUrl);
    const $ = cheerio.load(html);

    const title = $("h1.entry-title").text().trim();
    if (!title) return json(res, { status: 404, message: "Episode tidak ditemukan" }, 404);

    // Embed utama (iframe pertama)
    const defaultStream =
      $(".player-embed iframe, .video-content iframe, .mobius iframe, iframe").first().attr("src") ||
      null;

    // Multi-server dari select.mirror (value = base64 iframe HTML)
    const servers = [];
    $("select.mirror option").each((_, el) => {
      const name = $(el).text().trim();
      const rawVal = $(el).attr("value");
      if (!rawVal || !name || /^select/i.test(name)) return;
      const decoded = decodeBase64(rawVal);
      const matchSrc = decoded.match(/src=["']([^"']+)["']/i);
      const iframeSrc = matchSrc ? matchSrc[1] : decoded.startsWith("http") ? decoded : null;
      if (iframeSrc) servers.push({ server: name, embed_url: iframeSrc });
    });

    // Downloads per kualitas
    const downloads = {};
    $(".soraurlx").each((_, el) => {
      const quality = $(el).find("strong").first().text().trim() || "unknown";
      const links = [];
      $(el).find("a").each((__, linkEl) => {
        const host = $(linkEl).text().trim();
        const url = $(linkEl).attr("href");
        if (url && host) links.push({ host, url });
      });
      if (links.length) downloads[quality] = links;
    });

    // Navigasi episode
    const nav = {
      prev: $(".naveps .nvs a[rel='prev']").attr("href") || null,
      all: $(".naveps .nvsc a, .naveps .all a").attr("href") || null,
      next: $(".naveps .nvs a[rel='next']").attr("href") || null,
    };

    // Judul seri + nomor episode dari judul halaman
    const epMatch = title.match(/Episode\s+(\d+)/i);
    const seriesTitle = title.split(/\s+Episode\s+\d+/i)[0].trim();

    return json(res, {
      status: 200,
      data: {
        id: slugFromUrl(cleanUrl),
        title,
        series_title: seriesTitle,
        episode_number: epMatch ? Number(epMatch[1]) : null,
        default_stream: defaultStream,
        servers,
        downloads,
        navigation: {
          prev: nav.prev ? slugFromUrl(nav.prev) : null,
          prevUrl: nav.prev,
          all: nav.all,
          next: nav.next ? slugFromUrl(nav.next) : null,
          nextUrl: nav.next,
        },
        url: cleanUrl,
      },
    });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
