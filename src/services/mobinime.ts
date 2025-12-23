import { supabase } from '@/integrations/supabase/client';

export interface AnimeItem {
  id: string;
  title: string;
  other_title?: string;
  poster?: string;
  thumbnail?: string;
  imageCover?: string;
  image_cover?: string; // API returns this on homepage
  rating?: string;
  status?: string;
  type?: string;
  year?: string;
  tahun?: string;
  genres?: string[];
  categories?: Array<{ id: string; title: string }>;
  description?: string;
  content?: string;
  episodes?: Episode[];
  totalEpisode?: number;
  totalEpisodes?: number;
  episode?: number;
}

export interface Episode {
  id: string;
  number: number;
  title?: string;
  thumbnail?: string;
}

export interface Genre {
  id: string;
  title: string;
}

export interface ScheduleData {
  [key: string]: AnimeItem[];
}

export interface Information {
  id?: string;
  title?: string;
  desc?: string;
}

export interface HomepageData {
  recommend?: AnimeItem[];
  recommended?: AnimeItem[];
  ongoing?: AnimeItem[];
  schedule?: ScheduleData;
  information?: Information[];
  latest?: AnimeItem[];
  popular?: AnimeItem[];
}

export type AnimeType = 'series' | 'movie' | 'ova' | 'live-action';

const ANIME_TYPES: Record<AnimeType, string> = {
  series: '1',
  movie: '3',
  ova: '2',
  'live-action': '4',
};

async function proxyRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke('mobinime-proxy', {
    body: { endpoint, method, body },
  });

  if (error) {
    console.error('Proxy request error:', error);
    throw new Error(error.message || 'Network Error');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

class MobinimeService {
  async homepage(): Promise<HomepageData> {
    try {
      const data = await proxyRequest('/pages/homepage', 'GET');
      return data;
    } catch (error: any) {
      console.error('Homepage error:', error);
      throw new Error(error.message || 'Failed to fetch homepage');
    }
  }

  async animeList(
    type: AnimeType,
    options: { page?: string; count?: string; genre?: string } = {}
  ): Promise<AnimeItem[]> {
    const { page = '0', count = '15', genre = '' } = options;

    try {
      if (!ANIME_TYPES[type]) {
        throw new Error(`Available types: ${Object.keys(ANIME_TYPES).join(', ')}.`);
      }

      let gnr = '';
      if (genre) {
        const genres = await this.genreList();
        const found = genres.find(
          (g) => g.title.toLowerCase().replace(/\s+/g, '-') === genre.toLowerCase()
        );
        gnr = found?.id || '';
      }

      const data = await proxyRequest('/anime/list', 'POST', {
        perpage: count,
        startpage: page,
        userid: '',
        sort: '',
        genre: gnr,
        jenisanime: ANIME_TYPES[type],
      });

      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Anime list error:', error);
      throw new Error(error.message || 'Failed to fetch anime list');
    }
  }

  async genreList(): Promise<Genre[]> {
    try {
      const data = await proxyRequest('/anime/genre', 'GET');
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Genre list error:', error);
      throw new Error(error.message || 'Failed to fetch genres');
    }
  }

  async search(
    query: string,
    options: { page?: string; count?: string } = {}
  ): Promise<AnimeItem[]> {
    const { page = '0', count = '25' } = options;

    try {
      if (!query) throw new Error('Query is required.');

      const data = await proxyRequest('/anime/search', 'POST', {
        perpage: count,
        startpage: page,
        q: query,
      });

      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Search error:', error);
      throw new Error(error.message || 'Failed to search anime');
    }
  }

  async detail(id: string): Promise<AnimeItem> {
    try {
      const data = await proxyRequest('/anime/detail', 'POST', { id });
      return data;
    } catch (error: any) {
      console.error('Detail error:', error);
      throw new Error(error.message || 'Failed to fetch anime details');
    }
  }

  async stream(
    id: string,
    epsid: string,
    options: { quality?: string } = {}
  ): Promise<string> {
    const { quality = 'HD' } = options;

    try {
      if (!id || !epsid) throw new Error('Anime id & episode id is required.');

      const srv = await proxyRequest('/anime/get-server-list', 'POST', {
        id: epsid,
        animeId: id,
        jenisAnime: '1',
        userId: '',
      });

      const data = await proxyRequest('/anime/get-url-video', 'POST', {
        url: srv.serverurl,
        quality: quality,
        position: '0',
      });

      if (!data?.url) throw new Error('Stream url not found.');
      return data.url;
    } catch (error: any) {
      console.error('Stream error:', error);
      throw new Error(error.message || 'Failed to get stream URL');
    }
  }
}

export const mobinime = new MobinimeService();
