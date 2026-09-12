import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { AnimeCard } from '@/components/AnimeCard';
import { LoadingGrid } from '@/components/LoadingGrid';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { anichin, type AnimeItem } from '@/services/anichin';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState<number | null>(null);

  const fetchResults = useCallback(async (pageNum: number, isNewSearch = false) => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(null);
      return;
    }

    try {
      if (isNewSearch) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const data = await anichin.searchPaged(query, pageNum);
      const items = data.items || [];

      if (isNewSearch) {
        setResults(items);
      } else {
        setResults((prev) => [...prev, ...items]);
      }

      setHasMore(Boolean(data.hasNextPage));
      if (isNewSearch && items.length > 0) {
        setTotalResults(items.length);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Pencarian gagal';
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query]);

  useEffect(() => {
    setPage(1);
    setResults([]);
    fetchResults(1, true);
  }, [fetchResults]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(nextPage);
  };

  return (
    <>
      <Helmet>
        <title>{query ? `Hasil pencarian: "${query}" - shinime` : 'Search Anime - shinime'}</title>
        <meta
          name="description"
          content={`Hasil pencarian anime untuk "${query}" di shinime. Tonton anime sub Indo online gratis.`}
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20 pb-16 bg-[#09090b] text-foreground">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="py-8 border-b border-white/[0.08] mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
                <Search className="w-4 h-4 text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {query ? `Pencarian: "${query}"` : 'Cari Anime'}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {query
                ? totalResults !== null
                  ? `Ditemukan hasil yang cocok untuk kata kunci "${query}"`
                  : 'Mencari...'
                : 'Ketik judul anime yang ingin kamu cari.'}
            </p>
          </div>

          {/* No Query State */}
          {!query && (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-card border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold mb-1 text-white">Ketik Kata Kunci</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                Masukkan judul anime yang ingin ditonton pada kotak pencarian di atas.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && query && (
            <EmptyState
              type="error"
              description={error}
              onRetry={() => fetchResults(1, true)}
            />
          )}

          {/* Loading */}
          {loading && <LoadingGrid count={12} />}

          {/* No Results */}
          {!loading && !error && query && results.length === 0 && (
            <EmptyState
              type="search"
              title="Anime tidak ditemukan"
              description={`Tidak ditemukan anime yang cocok dengan "${query}". Coba kata kunci lain.`}
            />
          )}

          {/* Results Grid */}
          {!loading && !error && results.length > 0 && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {results.map((anime: AnimeItem, index: number) => (
                  <AnimeCard
                    key={`${anime.id || anime.slug}-${index}`}
                    anime={anime}
                    index={index}
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
