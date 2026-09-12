// ============================================================
// GET /api/anichin/stream?id=<slug-episode-N> — Streaming Episode
// Powered by Oploverz Anime Engine
// ============================================================
import {
  CORS_HEADERS,
  json,
  fetchDataJson,
  fmtStreamUrls,
  fmtDownloads,
  BASE_URL,
} from "../_anime.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).set(CORS_HEADERS).end();
  if (req.method !== "GET")
    return json(res, { status: 405, message: "Method not allowed" }, 405);

  const rawId = (req.query.id || "").trim();
  let animeSlug = (req.query.anime || "").trim();
  let epNum = (req.query.ep || "").trim();

  // Parsing slug dan episode number dari id
  if (rawId) {
    const cleanId = rawId
      .replace(/^https?:\/\/[^\/]+/i, "")
      .replace(/^\/?(watch|series|donghua|anime)\//i, "")
      .replace(/^\/+|\/+$/g, "");

    const mEp = cleanId.match(/^(.*?)[-_]episode[-_](\d+)$/i);
    if (mEp) {
      animeSlug = animeSlug || mEp[1];
      epNum = epNum || mEp[2];
    } else {
      const mSlash = cleanId.match(/^(.*?)\/(?:episode\/)?(\d+)$/i);
      if (mSlash) {
        animeSlug = animeSlug || mSlash[1];
        epNum = epNum || mSlash[2];
      } else if (!epNum && /^\d+$/.test(cleanId)) {
        epNum = cleanId;
      } else if (!animeSlug) {
        animeSlug = cleanId;
      }
    }
  }

  if (!animeSlug) {
    return json(res, { status: 400, message: "Anime slug diperlukan" }, 400);
  }
  if (!epNum) epNum = "1";

  try {
    const decoded = await fetchDataJson(
      `/series/${animeSlug}/episode/${epNum}`,
      `${BASE_URL}/series/${animeSlug}`
    );

    if (!decoded || (!decoded.episode && !decoded.streamUrl)) {
      return json(
        res,
        { status: 404, message: `Episode tidak ditemukan: ${animeSlug} ep ${epNum}` },
        404
      );
    }

    const ep = decoded.episode || {};
    const streamUrls = fmtStreamUrls(ep.streamUrl || decoded.streamUrl || []);
    const downloadUrls = fmtDownloads(ep.downloadUrl || decoded.downloadUrl || []);

    const servers = streamUrls.map((s) => ({
      server: s.label || "HD",
      embed_url: s.url,
    }));

    const defaultStream = servers[0]?.embed_url || null;

    // Grouping download links berdasarkan quality
    const downloads = {};
    downloadUrls.forEach((d) => {
      const q = d.quality || "Default";
      if (!downloads[q]) downloads[q] = [];
      downloads[q].push({
        host: d.host || "Direct Download",
        url: d.url,
      });
    });

    const seriesTitle = ep.series?.title || decoded.series?.title || animeSlug;
    const currentNum = Number(ep.episodeNumber || epNum);

    // Navigasi episode dari daftar episode
    const allList = decoded.allEpisodes?.data || decoded.allEpisodes || decoded.episodes?.data || decoded.episodes || [];
    let prevEp = null;
    let nextEp = null;

    if (Array.isArray(allList) && allList.length) {
      const nums = allList
        .map((e) => Number(e.episodeNumber))
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);
      const currIdx = nums.indexOf(currentNum);
      if (currIdx > 0) prevEp = nums[currIdx - 1];
      if (currIdx >= 0 && currIdx < nums.length - 1) nextEp = nums[currIdx + 1];
    } else {
      if (currentNum > 1) prevEp = currentNum - 1;
      nextEp = currentNum + 1;
    }

    const episodeIdentifier = `${animeSlug}-episode-${currentNum}`;

    return json(res, {
      status: 200,
      data: {
        id: episodeIdentifier,
        title: `${seriesTitle} Episode ${currentNum}`,
        series_title: seriesTitle,
        episode_number: currentNum,
        default_stream: defaultStream,
        servers,
        downloads,
        navigation: {
          prev: prevEp ? `${animeSlug}-episode-${prevEp}` : null,
          prevUrl: prevEp ? `/watch/${animeSlug}/${animeSlug}-episode-${prevEp}` : null,
          all: `/donghua/${animeSlug}`,
          next: nextEp ? `${animeSlug}-episode-${nextEp}` : null,
          nextUrl: nextEp ? `/watch/${animeSlug}/${animeSlug}-episode-${nextEp}` : null,
        },
        url: `/watch/${animeSlug}/${episodeIdentifier}`,
      },
    });
  } catch (err) {
    return json(res, { status: err.status || 500, message: err.message }, err.status || 500);
  }
}
