// ============================================================
// GET /api/anichin/home — Popular Today, Latest, Recommendation, Leaderboard
// Powered by Oploverz Anime Engine
// ============================================================
import {
  CORS_HEADERS,
  json,
  fetchDataJson,
  fmtSeries,
  fmtEpisodeCard,
  BASE_URL,
} from "../_anime.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET")
    return json(res, { status: 405, message: "Method not allowed" }, 405);

  try {
    const decoded = await fetchDataJson("/", `${BASE_URL}/`);
    if (!decoded) {
      throw new Error("Gagal mengambil data beranda anime");
    }

    const trendingRaw = decoded.trending?.data || [];
    const recentlyRaw = decoded.recently?.data || [];
    const latestEpisodesRaw = decoded.latestEpisodes?.data || [];

    const popularToday = trendingRaw.map(fmtSeries).filter(Boolean);
    const recommendation = recentlyRaw.map(fmtSeries).filter(Boolean);
    const latest = latestEpisodesRaw.map(fmtEpisodeCard).filter(Boolean);

    // Leaderboards
    const leaderboard = {
      weekly: popularToday.slice(0, 10).map((item, idx) => ({ ...item, rank: String(idx + 1) })),
      monthly: recommendation.slice(0, 10).map((item, idx) => ({ ...item, rank: String(idx + 1) })),
      alltime: [...popularToday]
        .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
        .map((item, idx) => ({ ...item, rank: String(idx + 1) })),
    };

    // Genres mapping
    const genreMap = new Map();
    [...trendingRaw, ...recentlyRaw].forEach((s) => {
      (s.genres || []).forEach((g) => {
        const name = typeof g === "string" ? g : g?.name;
        const slug = typeof g === "string" ? g.toLowerCase().replace(/\s+/g, "-") : g?.slug || name?.toLowerCase();
        if (name && slug && !genreMap.has(slug)) {
          genreMap.set(slug, { id: slug, title: name });
        }
      });
    });

    // Tambah genre anime umum jika belum lengkap
    const defaultGenres = [
      "Action", "Adventure", "Comedy", "Drama", "Fantasy",
      "Isekai", "Magic", "Mystery", "Romance", "Sci-Fi",
      "Shounen", "Slice of Life", "Sports", "Supernatural"
    ];
    defaultGenres.forEach((name) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (!genreMap.has(slug)) {
        genreMap.set(slug, { id: slug, title: name });
      }
    });

    return json(res, {
      status: 200,
      data: {
        popularToday,
        latest: latest.length ? latest : popularToday.slice(0, 12),
        recommendation,
        leaderboard,
        genres: Array.from(genreMap.values()),
      },
    });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
