// ============================================================
// api/_anichin.js — Core scraper Anichin (donghua) + helpers
// Dipakai semua endpoint api/anichin/*.js
// ============================================================
import * as cheerio from "cheerio";

export const BASE_URL = "https://anichin.cafe";
export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function json(res, data, status = 200) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300"); // cache 5 menit di CDN
  return res.status(data?.status && status === 200 ? data.status : status).json(data);
}

export function decodeBase64(str) {
  try {
    return Buffer.from(str, "base64").toString("utf-8");
  } catch {
    return str;
  }
}

export async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9,id;q=0.8" },
  });
  if (!res.ok) {
    const err = new Error(`Upstream ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.text();
}

/** slug seri dari URL episode/seri apa pun → dipakai sebagai "id" donghua */
export function slugFromUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url, BASE_URL);
    const parts = u.pathname.split("/").filter(Boolean);
    // https://anichin.cafe/seri/<slug>/ → parts = [seri, slug]
    if (parts[0] === "seri") return parts[1] || "";
    // episode: /perfect-world-episode-285-subtitle-indonesia/ → slug seri tidak diketahui;
    // gunakan full path sebagai id unik (detail page menangani keduanya)
    return parts.join("/");
  } catch {
    return String(url).replace(/^\/+|\/+$/g, "");
  }
}

/** normalisasi card .bsx → struktur AnimeItem kompatibel UI lama */
export function parseBsxCard($, el) {
  const a = $(el).find("a").first();
  const link = a.attr("href") || "";
  const rawTitle =
    $(el).find(".tt h2, .tt").first().text().trim() ||
    a.attr("title")?.split(" Episode ")[0]?.trim() ||
    a.attr("title")?.trim() ||
    $(el).find(".title").text().trim();
  if (!rawTitle || !link) return null;
  const title = rawTitle.split("\n")[0].replace(/\t+/g, " ").trim();
  const episode =
    $(el).find(".bt .epx").text().trim() ||
    (a.attr("title") || "").match(/Episode\s+(\d+)/i)?.[1] ||
    "";
  const type = $(el).find(".typez").first().text().trim() || "Donghua";
  const thumbnail = $(el).find("img").attr("src") || $(el).find("img").attr("data-src") || null;
  return {
    id: slugFromUrl(link),
    title,
    episode: episode ? Number(String(episode).replace(/\D/g, "")) || episode : undefined,
    episodeLabel: episode,
    type,
    poster: thumbnail,
    image_cover: thumbnail,
    url: link,
  };
}

/** parse list .bsx dalam container */
export function parseBsxList($, container) {
  const items = [];
  container.find(".bsx").each((_, el) => {
    const item = parseBsxCard($, el);
    if (item) items.push(item);
  });
  return items;
}
