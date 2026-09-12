// ============================================================
// GET /api/anichin/latest?page=1 — Latest Release & Anime List
// Powered by Oploverz Anime Engine
// ============================================================
import {
  CORS_HEADERS,
  json,
  fetchDataJson,
  getAllSeries,
  fmtSeries,
  fmtEpisodeCard,
  BASE_URL,
} from "../_anime.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET")
    return json(res, { status: 405, message: "Method not allowed" }, 405);

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = 24;

    // Untuk page 1, coba ambil episode terbaru yang rilis dari beranda
    if (page === 1 && req.query.type !== "series") {
      const homeData = await fetchDataJson("/", `${BASE_URL}/`);
      const eps = homeData?.latestEpisodes?.data || [];
      if (eps.length) {
        const items = eps.map(fmtEpisodeCard).filter(Boolean);
        return json(res, {
          status: 200,
          data: {
            page: 1,
            hasNextPage: true,
            items,
          },
        });
      }
    }

    // Paginasi dari katalog lengkap anime
    const all = await getAllSeries();
    const startIndex = (page - 1) * perPage;
    const rawItems = all.slice(startIndex, startIndex + perPage);
    const items = rawItems.map(fmtSeries).filter(Boolean);
    const hasNextPage = startIndex + perPage < all.length;

    return json(res, {
      status: 200,
      data: {
        page,
        hasNextPage,
        items,
      },
    });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
