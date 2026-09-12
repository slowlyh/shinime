// ============================================================
// GET /api/anichin/schedule — Jadwal Rilis Anime Mingguan
// Powered by Oploverz Anime Engine
// ============================================================
import {
  CORS_HEADERS,
  json,
  fetchDataJson,
  fullPosterUrl,
  BASE_URL,
} from "../_anime.js";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET")
    return json(res, { status: 405, message: "Method not allowed" }, 405);

  try {
    const decoded = await fetchDataJson("/schedule", `${BASE_URL}/`);
    const sched = decoded?.schedule || {};

    const result = {};
    DAYS.forEach((day) => {
      const list = sched[day] || [];
      result[day] = list
        .map((entry) => {
          const s = entry.series || entry;
          if (!s?.slug) return null;
          const poster = fullPosterUrl(s.poster);
          return {
            id: s.slug,
            slug: s.slug,
            title: s.title || s.slug,
            time: entry.time || "",
            poster,
            image_cover: poster,
            imageCover: poster,
            thumbnail: poster,
            type: "Anime",
            status: s.status || "Ongoing",
            genres: (s.genres || [])
              .map((g) => (typeof g === "string" ? g : g?.name))
              .filter(Boolean),
            url: `/donghua/${s.slug}`,
          };
        })
        .filter(Boolean);
    });

    return json(res, { status: 200, data: result });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
