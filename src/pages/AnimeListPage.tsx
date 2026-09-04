import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Tv, Filter } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { AnimeCard } from '@/components/AnimeCard';
import { LoadingGrid } from '@/components/LoadingGrid';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { anichin, type AnimeItem, type Genre } from '@/services/anichin';
import { cn } from '@/lib/utils';

// Anichin fokus donghua — kategori "type" lama (series/movie/ova)
// disederhanakan: semua route /anime/list/* dan /latest menampilkan
// daftar donghua dengan genre filter dari source.
export default function AnimeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genre = searchParams.get('genre') || '';

  const [items, setItems] = useState<AnimeItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showGenreFilter, setShowGenreFilter] = useState(false);

  const fetchGenres = useCallback(async () => {
    try {
      const data = await anichin.genreList();
      setGenres(data || []);
    } catch {
      // genre opsional — abaikan
    }
  }, []);

  const fetchList = useCallback(async (pageNum: number, isNew = false) => {
    try {
      if (isNew) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const data = await anichin.latest(pageNum);
      const list = data.items || [];

      if (isNew) {
        setItems(genre ? list : list);
      } else {
        setItems((prev) => [...prev, ...list]);
      }
      setHasMore(Boolean(data.hasNextPage));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [genre]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    setPage(1);
    setItems([]);
    fetchList(1, true);
  }, [fetchList]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchList(nextPage);
  };

  const handleGenreChange = (genreSlug: string) => {
    if (genreSlug) setSearchParams({ genre: genreSlug });
    else setSearchParams({});
    setShowGenreFilter(false);
  };

  const selectedGenre = genres.find(
    (g) => g.title.toLowerCase().replace(/\s+/g, '-') === genre
  );

  // Filter client-side by genre label (anichin card tidak membawa genre; untuk
  // filter presisi gunakan search). Kartu latest tetap ditampilkan.
  const visibleItems = selectedGenre
    ? items.filter((a: AnimeItem) =>
        (a as any).genres?.some((g: string) => g.toLowerCase().replace(/\s+/g, '-') === genre)
      ) || items
    : items;

  return (
    <>
      <Helmet>
        <title>{selectedGenre ? `${selectedGenre.title} Donghua` : 'Latest Donghua'} - shinime</title>
        <meta name="description" content={`Browse the latest donghua releases${selectedGenre ? ` in ${selectedGenre.title}` : ''} on shinime. Watch donghua online for free.`} />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="py-8 border-b border-border/50 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Tv className="w-6 h-6 text-accent" />
              <h1 className="text-2xl md:text-3xl font-bold">
                {selectedGenre ? `${selectedGenre.title} Donghua` : 'Latest Donghua'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {selectedGenre
                ? `Donghua in the ${selectedGenre.title} genre`
                : 'Latest donghua releases updated regularly'}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowGenreFilter(!showGenreFilter)}
                className={cn("gap-2", selectedGenre && "border-accent text-accent")}
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

            {showGenreFilter && genres.length > 0 && (
              <div className="mt-4 p-4 bg-card rounded-xl border border-border/50 scale-in">
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => {
                    const slug = g.title.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <button
                        key={g.id + g.title}
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

          {/* Grid */}
          {loading ? (
            <LoadingGrid count={12} />
          ) : error ? (
            <EmptyState type="error" description={error} onRetry={() => fetchList(1, true)} />
          ) : visibleItems.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {visibleItems.map((anime: AnimeItem, index: number) => (
                  <AnimeCard key={`${anime.id}-${index}`} anime={anime} index={index} showEpisode />
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
            <EmptyState type="donghua" />
          )}
        </div>
      </main>
    </>
  );
}
