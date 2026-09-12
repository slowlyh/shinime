// ============================================================
// GET /api/anichin/detail?id=<slug> — Detail Anime & Episode List
// Powered by Oploverz Anime Engine
// ============================================================
import {
  CORS_HEADERS,
  json,
  fetchDataJson,
  fullPosterUrl,
  BASE_URL,
} from "../_anime.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET")
    return json(res, { status: 405, message: "Method not allowed" }, 405);

  const rawId = (req.query.id || "").trim();
  if (!rawId)
    return json(res, { status: 400, message: "ID/slug anime diperlukan" }, 400);

  // Bersihkan slug dari prefix path atau URL
  const slug = rawId
    .replace(/^https?:\/\/[^\/]+/i, "")
    .replace(/^\/?(donghua|anime|series)\//i, "")
    .replace(/^\/+|\/+$/g, "");

  try {
    const decoded = await fetchDataJson(`/series/${slug}`, `${BASE_URL}/`);
    if (!decoded || !decoded.series) {
      return json(res, { status: 404, message: `Anime tidak ditemukan: ${slug}` }, 404);
    }

    const s = decoded.series || {};
    const eps = decoded.episodes || {};
    const epList = eps.data || eps || [];
    const poster = fullPosterUrl(s.poster);

    const genres = (s.genres || [])
      .map((g) => (typeof g === "string" ? g : g?.name))
      .filter(Boolean);

    const episodes = (Array.isArray(epList) ? epList : [])
      .map((ep, idx) => {
        const epNum = ep.episodeNumber || idx + 1;
        return {
          id: `${slug}-episode-${epNum}`,
          number: Number(epNum),
          title: ep.title || `Episode ${epNum}`,
          date: ep.releasedAt
            ? new Date(ep.releasedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "",
          url: `/watch/${slug}/${slug}-episode-${epNum}`,
        };
      })
      .filter((ep) => ep.number)
      .sort((a, b) => a.number - b.number);

    const metadata = {
      status: s.status || "Ongoing",
      type: s.releaseType || "TV",
      studio: s.studio?.name || "-",
      season: s.season?.name || "-",
      duration: s.duration || "24 min",
      released: s.releaseDate ? s.releaseDate.slice(0, 10) : "-",
      score: s.score ? String(s.score) : "-",
      total_episodes: String(s.totalEpisodes || episodes.length),
    };

    return json(res, {
      status: 200,
      data: {
        id: slug,
        slug,
        title: s.title || slug,
        other_title: s.japaneseTitle || null,
        poster,
        image_cover: poster,
        imageCover: poster,
        thumbnail: poster,
        rating: s.score ? String(s.score) : null,
        score: s.score || null,
        synopsis: s.description || "",
        description: s.description || "",
        content: s.description || "",
        genres,
        status: s.status || "Ongoing",
        year: s.releaseDate ? s.releaseDate.slice(0, 4) : null,
        type: s.releaseType || "Anime",
        metadata,
        episodes,
        totalEpisodes: s.totalEpisodes || episodes.length,
        url: `/donghua/${slug}`,
      },
    });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
