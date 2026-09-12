// ============================================================
// GET /api/anichin/search?q=...&page=1 — Search Anime
// Powered by Oploverz Anime Engine
// ============================================================
import {
  CORS_HEADERS,
  json,
  getAllSeries,
  fmtSeries,
} from "../_anime.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET")
    return json(res, { status: 405, message: "Method not allowed" }, 405);

  const query = (req.query.q || "").trim();
  if (!query)
    return json(res, { status: 400, message: "Query pencarian diperlukan" }, 400);

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = 20;
    const qLower = query.toLowerCase();

    const all = await getAllSeries();

    // Filter anime
    const matched = all.filter((s) => {
      const title = (s.title || "").toLowerCase();
      const jp = (s.japaneseTitle || "").toLowerCase();
      const slug = (s.slug || "").toLowerCase();
      const desc = (s.description || "").toLowerCase();
      return (
        title.includes(qLower) ||
        jp.includes(qLower) ||
        slug.includes(qLower) ||
        desc.includes(qLower)
      );
    });

    // Urutkan relevansi: judul diawali query > judul mengandung query > lainnya
    matched.sort((a, b) => {
      const aTitle = (a.title || "").toLowerCase();
      const bTitle = (b.title || "").toLowerCase();
      const aStarts = aTitle.startsWith(qLower);
      const bStarts = bTitle.startsWith(qLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    const startIndex = (page - 1) * perPage;
    const items = matched
      .slice(startIndex, startIndex + perPage)
      .map(fmtSeries)
      .filter(Boolean);

    const hasNextPage = startIndex + perPage < matched.length;

    return json(res, {
      status: 200,
      data: {
        query,
        page,
        total: matched.length,
        hasNextPage,
        items,
      },
    });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
