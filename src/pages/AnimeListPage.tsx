import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Film, Tv, Clapperboard, Video, Filter } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { AnimeCard } from '@/components/AnimeCard';
import { LoadingGrid } from '@/components/LoadingGrid';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { mobinime, type AnimeItem, type AnimeType, type Genre } from '@/services/mobinime';
import { cn } from '@/lib/utils';

const TYPE_INFO: Record<AnimeType, { title: string; icon: React.ElementType; description: string }> = {
  series: { 
    title: 'Anime Series', 
    icon: Tv,
    description: 'Ongoing and completed anime series'
  },
  movie: { 
    title: 'Anime Movies', 
    icon: Film,
    description: 'Feature-length anime films'
  },
  ova: { 
    title: 'OVA / ONA', 
    icon: Clapperboard,
    description: 'Original Video Animation and Original Net Animation'
  },
  'live-action': { 
    title: 'Live Action', 
    icon: Video,
    description: 'Live-action adaptations of anime and manga'
  },
};

export default function AnimeListPage() {
  const { type = 'series' } = useParams<{ type: AnimeType }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const genre = searchParams.get('genre') || '';
  
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showGenreFilter, setShowGenreFilter] = useState(false);

  const typeInfo = TYPE_INFO[type as AnimeType] || TYPE_INFO.series;
  const Icon = typeInfo.icon;

  const fetchGenres = useCallback(async () => {
    try {
      const data = await mobinime.genreList();
      setGenres(data || []);
    } catch (err) {
      console.error('Failed to fetch genres:', err);
    }
  }, []);

  const fetchAnimeList = useCallback(async (pageNum: number, isNew = false) => {
    try {
      if (isNew) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const data = await mobinime.animeList(type as AnimeType, {
        page: pageNum.toString(),
        count: '20',
        genre: genre,
      });

      if (isNew) {
        setAnimeList(data || []);
      } else {
        setAnimeList((prev) => [...prev, ...(data || [])]);
      }

      setHasMore((data || []).length === 20);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [type, genre]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    setPage(0);
    setAnimeList([]);
    fetchAnimeList(0, true);
  }, [type, genre, fetchAnimeList]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAnimeList(nextPage);
  };

  const handleGenreChange = (genreSlug: string) => {
    if (genreSlug) {
      setSearchParams({ genre: genreSlug });
    } else {
      setSearchParams({});
    }
    setShowGenreFilter(false);
  };

  const selectedGenre = genres.find(
    (g) => g.title.toLowerCase().replace(/\s+/g, '-') === genre
  );

  return (
    <>
      <Helmet>
        <title>{typeInfo.title}{selectedGenre ? ` - ${selectedGenre.title}` : ''} - shinime</title>
        <meta name="description" content={`Browse ${typeInfo.description.toLowerCase()} on shinime. Watch anime online for free.`} />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="py-8 border-b border-border/50 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="w-6 h-6 text-accent" />
              <h1 className="text-2xl md:text-3xl font-bold">{typeInfo.title}</h1>
            </div>
            <p className="text-muted-foreground">{typeInfo.description}</p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowGenreFilter(!showGenreFilter)}
                className={cn(
                  "gap-2",
                  selectedGenre && "border-accent text-accent"
                )}
              >
                <Filter className="w-4 h-4" />
                {selectedGenre ? selectedGenre.title : 'Filter by Genre'}
              </Button>

              {selectedGenre && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGenreChange('')}
                  className="text-muted-foreground"
                >
                  Clear filter
                </Button>
              )}
            </div>

            {/* Genre Filter Panel */}
            {showGenreFilter && genres.length > 0 && (
              <div className="mt-4 p-4 bg-card rounded-xl border border-border/50 scale-in">
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => {
                    const slug = g.title.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <button
                        key={g.id}
                        onClick={() => handleGenreChange(slug)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm transition-colors",
                          genre === slug
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {g.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Anime Grid */}
          {loading ? (
            <LoadingGrid count={12} />
          ) : error ? (
            <EmptyState 
              type="error" 
              description={error} 
              onRetry={() => fetchAnimeList(0, true)}
            />
          ) : animeList.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {animeList.map((anime, index) => (
                  <AnimeCard key={`${anime.id}-${index}`} anime={anime} index={index} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState type="anime" />
          )}
        </div>
      </main>
    </>
  );
}
