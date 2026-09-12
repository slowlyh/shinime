import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tv, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { AnimeCard } from '@/components/AnimeCard';
import { LoadingGrid } from '@/components/LoadingGrid';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { anichin, type AnimeItem } from '@/services/anichin';

export default function AnimeListPage() {
  const [items, setItems] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchList = useCallback(async (pageNum: number, isNew = false) => {
    try {
      if (isNew) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const data = await anichin.latest(pageNum);
      const list = data.items || [];

      if (isNew) {
        setItems(list);
      } else {
        setItems((prev) => [...prev, ...list]);
      }
      setHasMore(Boolean(data.hasNextPage));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat anime';
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

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

  return (
    <>
      <Helmet>
        <title>Latest Anime - shinime</title>
        <meta
          name="description"
          content="Jelajahi rilisan anime terbaru dan tonton streaming gratis di shinime. Selalu update setiap hari."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20 pb-16 bg-[#09090b] text-foreground">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="py-8 border-b border-white/[0.08] mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
                <Tv className="w-4 h-4 text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Rilis Anime Terbaru
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Daftar episode anime yang baru diperbarui secara real-time.
            </p>
          </div>

          {/* Error State */}
          {error && (
            <EmptyState
              type="error"
              description={error}
              onRetry={() => fetchList(1, true)}
            />
          )}

          {/* Loading */}
          {loading && <LoadingGrid count={12} />}

          {/* Empty State */}
          {!loading && !error && items.length === 0 && (
            <EmptyState
              type="anime"
              title="Belum ada anime"
              description="Daftar anime belum tersedia saat ini."
            />
          )}

          {/* Anime Grid */}
          {!loading && !error && items.length > 0 && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {items.map((anime: AnimeItem, index: number) => (
                  <AnimeCard
                    key={`${anime.id || anime.slug}-${index}`}
                    anime={anime}
                    index={index}
                    showEpisode
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    variant="outline"
                    className="border-white/[0.12] bg-card hover:bg-muted text-xs font-semibold px-6 py-2"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Memuat...
                      </>
                    ) : (
                      'Muat Lebih Banyak'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
