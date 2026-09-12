// ============================================================
// api/_anime.js — Oploverz Anime Scraper & Data Adapter
// Source data: https://oploverz.site / Oploverz Engine
// All returned items use internal slugs/routes without external URLs
// ============================================================
import * as cheerio from "cheerio";

export const BASE_URL = "https://oploverz.site";
export const BACKAPI = "https://backapi.oploverz.ac/uploads/";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function json(res, data, status = 200) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300"); // Cache 5 menit
  return res.status(data?.status && status === 200 ? data.status : status).json(data);
}

const HEADERS_HTML = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

const HEADERS_DATA = {
  accept: "*/*",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

const AD_DOMAINS = [
  "blogger.com",
  "blogspot.com",
  "paladindrama",
  "glamour",
  "mayhap",
  "histats",
  "slot",
  "casino",
  "mpo",
  "judol",
  "placehold.co",
  "comentario",
  "cloudflareinsights",
];

export function isClean(url = "") {
  if (!url) return false;
  const lower = url.toLowerCase();
  return !AD_DOMAINS.some((d) => lower.includes(d));
}

// ─── SVELTEKIT __data.json DECODER ────────────────────────────
export function decodeSvelteFlat(raw) {
  if (!raw || !Array.isArray(raw.nodes)) return null;
  const dataNode = raw.nodes.find((n) => n?.type === "data" && Array.isArray(n.data));
  if (!dataNode) return null;

  const arr = dataNode.data;

  function resolve(idx) {
    if (idx === null || idx === undefined) return null;
    const val = arr[idx];
    if (val === null || val === undefined) return val;
    if (typeof val !== "object") return val;
    if (Array.isArray(val)) return val.map((i) => resolve(i));
    const result = {};
    for (const [k, v] of Object.entries(val)) result[k] = resolve(v);
    return result;
  }

  return resolve(0);
}

// ─── HTTP HELPERS ─────────────────────────────────────────────
export async function fetchDataJson(path, referer) {
  const endpoint = `${BASE_URL}${path === "/" ? "" : path}/__data.json?x-sveltekit-invalidated=001`;
  const res = await fetch(endpoint, {
    headers: { ...HEADERS_DATA, Referer: referer || `${BASE_URL}/` },
  });
  if (!res.ok) return null;
  const raw = await res.json();
  return decodeSvelteFlat(raw);
}

export async function fetchHTML(path) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: HEADERS_HTML });
  if (!res.ok) return "";
  return res.text();
}

export function fullPosterUrl(path) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http")) return path;
  return `${BACKAPI}${path}`;
}

export function fmtStreamUrls(streamUrl = []) {
  return (streamUrl || [])
    .filter((s) => s?.url && isClean(s.url))
    .map((s) => ({ label: s.source || s.label || "HD", url: s.url }));
}

export function fmtDownloads(downloadUrl = []) {
  return (downloadUrl || []).flatMap((fmt) =>
    (fmt?.resolutions || []).flatMap((res) =>
      (res?.download_links || [])
        .filter((l) => l?.url && isClean(l.url))
        .map((l) => ({
          format: fmt.format || null,
          quality: res.quality || "HD",
          host: l.host || "Download",
          url: l.url,
        }))
    )
  );
}

// ─── FORMATTERS (Uses slug ONLY, no external scraper URLs) ────
export function fmtSeries(s) {
  if (!s?.slug) return null;
  const poster = fullPosterUrl(s.poster);
  const totalEps = s.totalEpisodes || (Array.isArray(s.episodes) ? s.episodes.length : undefined);
  return {
    id: s.slug,
    slug: s.slug,
    title: s.title || s.slug,
    other_title: s.japaneseTitle || undefined,
    status: s.status || "Ongoing",
    type: s.releaseType || "Anime",
    rating: s.score ? String(s.score) : undefined,
    score: s.score || undefined,
    poster,
    image_cover: poster,
    imageCover: poster,
    thumbnail: poster,
    genres: (s.genres || []).map((g) => (typeof g === "string" ? g : g?.name)).filter(Boolean),
    studio: s.studio?.name || undefined,
    season: s.season?.name || undefined,
    year: s.releaseDate ? s.releaseDate.slice(0, 4) : undefined,
    totalEpisode: totalEps,
    totalEpisodes: totalEps,
    description: s.description || undefined,
    url: `/donghua/${s.slug}`, // internal route compatible with frontend
  };
}

export function fmtEpisodeCard(ep) {
  if (!ep) return null;
  const seriesSlug = ep.series?.slug || "";
  const epNum = ep.episodeNumber || 1;
  const poster = fullPosterUrl(ep.series?.poster);
  return {
    id: seriesSlug,
    slug: seriesSlug,
    title: ep.series?.title || seriesSlug,
    episode: Number(epNum) || epNum,
    episodeLabel: `Episode ${epNum}`,
    type: "Anime",
    poster,
    image_cover: poster,
    imageCover: poster,
    thumbnail: poster,
    releasedAt: ep.releasedAt || undefined,
    streamUrls: fmtStreamUrls(ep.streamUrl),
    downloadUrls: fmtDownloads(ep.downloadUrl),
    url: `/watch/${seriesSlug}/${seriesSlug}-episode-${epNum}`,
  };
}

// In-memory cache for allSeries list
let allSeriesCache = { at: 0, items: [] };
const ALL_SERIES_TTL = 15 * 60 * 1000; // 15 menit

export async function getAllSeries() {
  if (allSeriesCache.items.length && Date.now() - allSeriesCache.at < ALL_SERIES_TTL) {
    return allSeriesCache.items;
  }
  try {
    const decoded = await fetchDataJson("/series", `${BASE_URL}/`);
    const list = decoded?.allSeries?.data || [];
    if (list.length) {
      allSeriesCache = { at: Date.now(), items: list };
      return list;
    }
  } catch {}
  return allSeriesCache.items;
}
