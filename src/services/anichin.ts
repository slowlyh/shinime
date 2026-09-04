// ============================================================
// services/anichin.ts — Data layer Anichin (donghua)
// Menggantikan services/mobinime.ts (API anime lama sudah mati).
// Bentuk interface PERSIS seperti mobinime.ts agar pages
// hanya perlu ganti import.
// ============================================================

const API_BASE = '/api/anichin';

export interface AnimeItem {
  id: string;
  title: string;
  other_title?: string;
  poster?: string;
  thumbnail?: string;
  imageCover?: string;
  image_cover?: string;
  rating?: string;
  status?: string;
  type?: string;
  year?: string;
  tahun?: string;
  genres?: string[];
  description?: string;
  content?: string;
  synopsis?: string;
  episodes?: Episode[];
  totalEpisode?: number;
  totalEpisodes?: number;
  episode?: number;
  episodeLabel?: string;
  time?: string;
  rank?: string;
  url?: string;
  metadata?: Record<string, string>;
}

export interface Episode {
  id: string;
  number: number;
  title?: string;
  thumbnail?: string;
  date?: string;
  sub?: string;
  url?: string;
}

export interface Genre {
  id: string;
  title: string;
}

export interface ScheduleData {
  [key: string]: AnimeItem[];
}

export interface LeaderboardEntry extends AnimeItem {}

export interface HomepageData {
  popularToday?: AnimeItem[];
  latest?: AnimeItem[];
  recommendation?: AnimeItem[];
  ongoing?: AnimeItem[];
  leaderboard?: {
    weekly?: LeaderboardEntry[];
    monthly?: LeaderboardEntry[];
    alltime?: LeaderboardEntry[];
  };
  genres?: Genre[];
  schedule?: ScheduleData;
  information?: Array<{ id?: string; title?: string; desc?: string }>;
  // kompatibilitas mapping lama
  recommend?: AnimeItem[];
  recommended?: AnimeItem[];
  popular?: AnimeItem[];
}

export interface LatestData {
  page: number;
  hasNextPage: boolean;
  items: AnimeItem[];
}

export interface SearchData {
  query: string;
  page: number;
  hasNextPage: boolean;
  items: AnimeItem[];
}

export interface StreamData {
  id: string;
  title: string;
  series_title?: string;
  episode_number?: number | null;
  default_stream?: string | null;
  servers?: Array<{ server: string; embed_url: string | null }>;
  downloads?: Record<string, Array<{ host: string; url: string }>>;
  navigation?: {
    prev?: string | null;
    prevUrl?: string | null;
    all?: string | null;
    next?: string | null;
    nextUrl?: string | null;
  };
  url?: string;
}

export type AnimeType = 'series' | 'movie' | 'ova' | 'live-action';

// Simple in-memory cache (TTL) untuk hindari request berulang
const cache = new Map<string, { at: number; data: any }>();
const TTL = 5 * 60 * 1000; // 5 menit

async function apiGet<T>(path: string): Promise<T> {
  const key = path;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data as T;

  const res = await fetch(`${API_BASE}${path}`);
  const json = await res.json();

  if (!res.ok || json.status !== 200) {
    throw new Error(json.message || 'Gagal mengambil data dari Anichin');
  }

  cache.set(key, { at: Date.now(), data: json.data });
  return json.data as T;
}

class AnichinService {
  async homepage(): Promise<HomepageData> {
    const d = await apiGet<any>('/home');
    // mapping agar key lama tetap tersedia (recommend/recommended/popular)
    return {
      ...d,
      recommend: d.recommendation || [],
      recommended: d.recommendation || [],
      popular: d.popularToday || [],
      ongoing: d.latest || [],
    };
  }

  async latest(page = 1): Promise<LatestData> {
    return apiGet<LatestData>(`/latest?page=${page}`);
  }

  // Kompatibilitas dengan AnimeListPage lama — "type" tidak relevan lagi
  // (anichin fokus donghua); genre filter via search page.
  async animeList(
    _type: AnimeType,
    options: { page?: string; count?: string; genre?: string } = {}
  ): Promise<AnimeItem[]> {
    const page = parseInt(options.page || '1', 10) || 1;
    const data = await this.latest(page);
    return data.items;
  }

  async search(query: string, options: { page?: string; count?: string } = {}): Promise<AnimeItem[]> {
    const page = parseInt(options.page || '1', 10) || 1;
    const data = await apiGet<SearchData>(
      `/search?q=${encodeURIComponent(query)}&page=${page}`
    );
    return data.items;
  }

  async searchPaged(
    query: string,
    page = 1
  ): Promise<SearchData> {
    return apiGet<SearchData>(`/search?q=${encodeURIComponent(query)}&page=${page}`);
  }

  async genreList(): Promise<Genre[]> {
    const d = await apiGet<any>('/home');
    return d.genres || [];
  }

  async schedule(): Promise<ScheduleData> {
    return apiGet<ScheduleData>('/schedule');
  }

  async detail(id: string): Promise<AnimeItem> {
    const d = await apiGet<AnimeItem>(`/detail?id=${encodeURIComponent(id)}`);
    return {
      ...d,
      description: d.synopsis || d.content || d.description,
      content: d.synopsis || d.content,
      categories: (d.genres || []).map((g, i) => ({ id: String(i), title: g })),
    } as AnimeItem;
  }

  async stream(episodeId: string): Promise<StreamData> {
    return apiGet<StreamData>(`/stream?id=${encodeURIComponent(episodeId)}`);
  }
}

export const anichin = new AnichinService();
