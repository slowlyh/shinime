// ============================================================
// GET /api/anichin/home — Popular Today, Latest, Recommendation, Leaderboard
// ============================================================
import {
  CORS_HEADERS, json, fetchHtml, parseBsxList, parseBsxCard, slugFromUrl, BASE_URL,
} from "../_anichin.js";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET") return json(res, { status: 405, message: "Method not allowed" }, 405);

  try {
    const html = await fetchHtml(`${BASE_URL}/`);
    const $ = cheerio.load(html);

    // Popular Today — section dengan class hothome
    const popularToday = parseBsxList($, $(".releases.hothome").parent());

    // Latest Release — heading berisi "Latest Release"
    const latest = parseBsxList(
      $,
      $('.releases h3, .releases').filter((_, el) => $(el).text().trim() === "Latest Release").closest(".bixbox, .excstf, body").first()
    );

    // Recommendation — section dengan tab genre
    const recommendation = [];
    $('.releases').filter((_, el) => $(el).text().includes("Recommendation")).each((__, rel) => {
      $(rel).parent().find(".bsx").each((_, el) => {
        const item = parseBsxCard($, el);
        if (item) recommendation.push(item);
      });
    });
    // dedup by id
    const seen = new Set();
    const recDedup = recommendation.filter((r) => !seen.has(r.id) && seen.add(r.id));

    // Leaderboard — div.serieslist.wpop-<range>
    const parseWpop = (range) => {
      const items = [];
      $(`.serieslist.wpop-${range} li, .wpop-${range} li`).each((_, el) => {
        const rank = $(el).find(".ctr").text().trim();
        const a = $(el).find(".leftseries h4 a, h4 a, .series").first();
        const link = a.attr("href") || $(el).find("a").attr("href") || "";
        const title = a.text().trim() || $(el).find("h4").text().trim();
        const thumbnail = $(el).find("img").attr("src") || $(el).find("img").attr("data-src") || null;
        const rating = $(el).find(".numscore").first().text().trim() || null;
        const genres = [];
        $(el).find(".leftseries span a").each((_, g) => genres.push($(g).text().trim()));
        if (title && link) {
          items.push({
            id: slugFromUrl(link), rank, title, rating, genres,
            poster: thumbnail, image_cover: thumbnail, url: link,
          });
        }
      });
      return items;
    };

    const leaderboard = {
      weekly: parseWpop("weekly"),
      monthly: parseWpop("monthly"),
      alltime: parseWpop("alltime"),
    };

    // Genres (dari sidebar home) — list kecil
    const genres = [];
    $("ul.genre li a, .genre li a").each((_, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr("href") || "";
      if (title && href) genres.push({ id: slugFromUrl(href), title });
    });

    return json(res, {
      status: 200,
      data: {
        popularToday,
        latest: latest.length ? latest : popularToday.slice(0, 12),
        recommendation: recDedup,
        leaderboard,
        genres,
      },
    });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
