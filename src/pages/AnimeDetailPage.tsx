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
    } catch (err: any) {
      setError(err.message);
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
        <main className="min-h-screen pt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </main>
      </>
    );
  }

  if (error || !anime) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20">
          <div className="container mx-auto px-4 py-12">
            <EmptyState
              type="error"
              description={error || 'Donghua not found'}
              onRetry={fetchDetail}
            />
            <div className="text-center mt-4">
              <Button asChild variant="outline">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const imageUrl = anime.image_cover || anime.imageCover || anime.poster || anime.thumbnail || '/placeholder.svg';

  // Episodes dari source baru sudah ascending; tampilkan terbaru di atas untuk list, ascending untuk grid
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
  const type = anime.type || meta.type || 'Donghua';

  return (
    <>
      <Helmet>
        <title>{anime.title} - shinime</title>
        <meta name="description" content={description || `Watch ${anime.title} donghua online for free on shinime.`} />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20">
        {/* Hero Banner */}
        <div className="relative min-h-[60vh] md:min-h-[50vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={imageUrl}
              alt={anime.title}
              loading="lazy"
              className="w-full h-full object-cover blur-xl scale-110 opacity-30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
          </div>

          <div className="container max-w-7xl mx-auto px-4 h-full relative z-10">
            <div className="h-full flex items-end pb-8 pt-8 md:pt-0">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 fade-in w-full">
                {/* Poster */}
                <div className="w-40 sm:w-48 md:w-56 flex-shrink-0 mx-auto md:mx-0 mt-4 md:mt-0">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-card border border-border/50 bg-muted">
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
                <div className="flex-1 pb-4">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Link>

                  <h1 className="text-2xl md:text-4xl font-bold mb-2">
                    {anime.title}
                  </h1>

                  {/* Alternative Title */}
                  {anime.other_title && (
                    <p className="text-sm text-muted-foreground mb-3 italic">
                      {anime.other_title}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    {anime.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{anime.rating}</span>
                      </div>
                    )}
                    {year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{year}</span>
                      </div>
                    )}
                    {status && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{status}</span>
                      </div>
                    )}
                    {type && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span className="capitalize">{type}</span>
                      </div>
                    )}
                    {totalEpisodes > 0 && (
                      <div className="flex items-center gap-1">
                        <Layers className="w-4 h-4" />
                        <span>{totalEpisodes} Episodes</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {genres.map((genre) => (
                        <GenreBadge key={genre} genre={genre} variant="filled" />
                      ))}
                    </div>
                  )}

                  {/* Extra metadata */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground mb-5">
                    {studio && <span>Studio: <span className="text-foreground">{studio}</span></span>}
                    {network && <span>Network: <span className="text-foreground">{network}</span></span>}
                    {season && <span>Season: <span className="text-foreground">{season}</span></span>}
                    {duration && <span>Duration: <span className="text-foreground">{duration}</span></span>}
                  </div>

                  {/* Watch Button */}
                  {episodes.length > 0 && (
                    <Button
                      asChild
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow"
                    >
                      <Link to={`/watch/${encodeURIComponent(anime.id)}/${encodeURIComponent(episodes[episodes.length - 1].id)}`}>
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Watch Latest Episode
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container max-w-7xl mx-auto px-4 py-8">
          {/* Synopsis */}
          {description && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed max-w-4xl">
                {description}
              </p>
            </section>
          )}

          {/* Latest Episodes */}
          {latestEpisodes.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Latest Episodes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {latestEpisodes.map((ep: Episode) => (
                  <Link
                    key={ep.id}
                    to={`/watch/${encodeURIComponent(anime.id)}/${encodeURIComponent(ep.id)}`}
                    className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-accent hover:bg-accent/5 transition-all"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-semibold text-sm">
                      {ep.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                        {ep.title || `Episode ${ep.number}`}
                      </p>
                      {ep.date && (
                        <p className="text-xs text-muted-foreground mt-0.5">{ep.date}</p>
                      )}
                    </div>
                    <Play className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All Episodes */}
          {episodes.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">
                Episodes ({episodes.length})
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {episodes.map((episode: Episode, index: number) => (
                  <Link
                    key={episode.id}
                    to={`/watch/${encodeURIComponent(anime.id)}/${encodeURIComponent(episode.id)}`}
                    className={cn(
                      "group relative flex items-center justify-center p-3 rounded-lg bg-card border border-border/50 hover:border-accent hover:bg-accent/10 transition-all opacity-0 slide-up"
                    )}
                    style={{ animationDelay: `${Math.min(index, 30) * 0.02}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-accent" />
                    </div>
                    <span className="font-medium text-sm group-hover:opacity-0 transition-opacity">
                      {episode.number || index + 1}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* No Episodes State */}
          {episodes.length === 0 && (
            <EmptyState
              type="donghua"
              title="No episodes available"
              description="Episodes for this donghua are not available yet."
            />
          )}
        </div>
      </main>
    </>
  );
}
