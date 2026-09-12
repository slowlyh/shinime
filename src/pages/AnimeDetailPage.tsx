import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, Star, Clock, Tag, Calendar, ChevronLeft, Loader2, Layers } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { GenreBadge } from '@/components/GenreBadge';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { anichin, type AnimeItem, type Episode } from '@/services/anichin';
import { cn } from '@/lib/utils';

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AnimeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await anichin.detail(id);
      setAnime(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat anime';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-[#09090b]">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </main>
      </>
    );
  }

  if (error || !anime) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-[#09090b]">
          <div className="container mx-auto px-4 py-12">
            <EmptyState
              type="error"
              title="Anime tidak ditemukan"
              description={error || 'Anime yang kamu cari tidak tersedia.'}
              onRetry={fetchDetail}
            />
            <div className="text-center mt-4">
              <Button asChild variant="outline" className="border-white/[0.1] bg-card text-xs">
                <Link to="/">Kembali ke Beranda</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const imageUrl =
    anime.image_cover || anime.imageCover || anime.poster || anime.thumbnail || '/placeholder.svg';

  const episodes = [...(anime.episodes || [])];
  const latestEpisodes = [...episodes].reverse().slice(0, 8);

  const description = anime.synopsis || anime.content || anime.description;
  const genres = anime.genres || [];
  const totalEpisodes = anime.totalEpisodes || anime.totalEpisode || episodes.length;
  const meta = anime.metadata || {};
  const status = anime.status || meta.status;
  const year = anime.year || meta.released?.match(/\d{4}/)?.[0];
  const studio = meta.studio;
  const season = meta.season;
  const duration = meta.duration;
  const network = meta.network;
  const type = anime.type || meta.type || 'Anime';

  return (
    <>
      <Helmet>
        <title>{anime.title} - shinime</title>
        <meta
          name="description"
          content={description || `Nonton streaming anime ${anime.title} sub Indo online gratis di shinime.`}
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20 bg-[#09090b] text-foreground pb-16">
        {/* Hero Banner */}
        <div className="relative min-h-[50vh] overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0">
            <img
              src={imageUrl}
              alt={anime.title}
              loading="lazy"
              className="w-full h-full object-cover blur-2xl scale-110 opacity-20"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
          </div>

          <div className="container max-w-7xl mx-auto px-4 h-full relative z-10">
            <div className="h-full flex items-end pb-8 pt-6">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
                {/* Poster */}
                <div className="w-36 sm:w-44 md:w-52 shrink-0 mx-auto md:mx-0">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.1] bg-card shadow-2xl">
                    <img
                      src={imageUrl}
                      alt={anime.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 pb-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white mb-3 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Beranda
                  </Link>

                  <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-2">
                    {anime.title}
                  </h1>

                  {/* Alternative Title */}
                  {anime.other_title && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 italic">
                      {anime.other_title}
                    </p>
                  )}

                  {/* Meta Info Badges */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                    {anime.rating && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/60 border border-white/[0.08] text-white">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{anime.rating}</span>
                      </div>
                    )}
                    {year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{year}</span>
                      </div>
                    )}
                    {status && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{status}</span>
                      </div>
                    )}
                    {type && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="capitalize">{type}</span>
                      </div>
                    )}
                    {totalEpisodes > 0 && (
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{totalEpisodes} Episode</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {genres.map((genre) => (
                        <GenreBadge key={genre} genre={genre} variant="outline" />
                      ))}
                    </div>
                  )}

                  {/* Extra metadata */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground mb-5">
                    {studio && (
                      <span>
                        Studio: <span className="text-white font-medium">{studio}</span>
                      </span>
                    )}
                    {network && (
                      <span>
                        Network: <span className="text-white font-medium">{network}</span>
                      </span>
                    )}
                    {season && (
                      <span>
                        Musim: <span className="text-white font-medium">{season}</span>
                      </span>
                    )}
                    {duration && (
                      <span>
                        Durasi: <span className="text-white font-medium">{duration}</span>
                      </span>
                    )}
                  </div>

                  {/* Watch Button */}
                  {episodes.length > 0 && (
                    <Button
                      asChild
                      size="default"
                      className="bg-accent hover:bg-accent/90 text-white font-semibold text-xs sm:text-sm px-6 shadow-lg shadow-accent/20"
                    >
                      <Link
                        to={`/watch/${encodeURIComponent(anime.id)}/${encodeURIComponent(
                          episodes[episodes.length - 1].id
                        )}`}
                      >
                        <Play className="w-4 h-4 mr-2 fill-white" />
                        Tonton Episode Terbaru
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container max-w-7xl mx-auto px-4 py-10 space-y-10">
          {/* Synopsis */}
          {description && (
            <section className="border-b border-white/[0.06] pb-8">
              <h2 className="text-base font-bold text-white mb-3">Sinopsis</h2>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-4xl">
                {description}
              </p>
            </section>
          )}

          {/* Latest Episodes Quick Bar */}
          {latestEpisodes.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-white mb-4">Episode Terakhir Dirilis</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {latestEpisodes.map((ep: Episode) => (
                  <Link
                    key={ep.id}
                    to={`/watch/${encodeURIComponent(anime.id)}/${encodeURIComponent(ep.id)}`}
                    className="group flex items-center gap-3 p-2.5 rounded-lg bg-card border border-white/[0.06] hover:border-accent/40 hover:bg-muted/40 transition-all"
                  >
                    <div className="w-9 h-9 shrink-0 rounded bg-accent/15 text-accent flex items-center justify-center font-bold text-xs">
                      {ep.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-accent transition-colors">
                        {ep.title || `Episode ${ep.number}`}
                      </p>
                      {ep.date && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{ep.date}</p>
                      )}
                    </div>
                    <Play className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All Episodes Grid */}
          {episodes.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-white mb-4">
                Daftar Semua Episode ({episodes.length})
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {episodes.map((episode: Episode, index: number) => (
                  <Link
                    key={episode.id}
                    to={`/watch/${encodeURIComponent(anime.id)}/${encodeURIComponent(episode.id)}`}
                    className={cn(
                      'group relative flex items-center justify-center p-2.5 rounded-md bg-card border border-white/[0.06] hover:border-accent hover:bg-accent/15 transition-all text-xs font-semibold text-neutral-200'
                    )}
                  >
                    <span>{episode.number || index + 1}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* No Episodes State */}
          {episodes.length === 0 && (
            <EmptyState
              type="anime"
              title="Episode belum tersedia"
              description="Episode untuk anime ini belum tersedia."
            />
          )}
        </div>
      </main>
    </>
  );
}
