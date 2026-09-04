import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { AnimeCard } from '@/components/AnimeCard';
import { LoadingGrid } from '@/components/LoadingGrid';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { anichin, type AnimeItem } from '@/services/anichin';

const SUGGESTIONS = [
  'Battle Through The Heavens',
  'Perfect World',
  'Soul Land',
  'Throne of Seal',
  'Renegade Immortal',
  'Martial Universe',
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchResults = useCallback(async (pageNum: number, isNewSearch = false) => {
    if (!query) return;

    try {
      setLoading(true);
      setError(null);
      const data = await anichin.searchPaged(query, pageNum);

      if (isNewSearch) {
        setResults(data.items || []);
      } else {
        setResults((prev) => [...prev, ...(data.items || [])]);
      }
      setHasMore(Boolean(data.hasNextPage));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query) {
      setPage(1);
      setResults([]);
      fetchResults(1, true);
    } else {
      setResults([]);
      setHasMore(false);
    }
  }, [query, fetchResults]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(nextPage);
  };

  return (
    <>
      <Helmet>
        <title>{query ? `Search: ${query}` : 'Search'} - shinime</title>
        <meta name="description" content={`Search results for "${query}" on shinime. Find your favorite donghua series.`} />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="py-8 border-b border-border/50 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SearchIcon className="w-6 h-6 text-accent" />
              <h1 className="text-2xl md:text-3xl font-bold">Search Results</h1>
            </div>
            {query && (
              <p className="text-muted-foreground">
                Showing results for "<span className="text-foreground font-medium">{query}</span>"
              </p>
            )}
          </div>

          {/* Results */}
          {!query ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Start searching</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Enter a search term to find your favorite donghua series and more.
              </p>

              <div className="max-w-lg mx-auto">
                <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <Link
                      key={suggestion}
                      to={`/search?q=${encodeURIComponent(suggestion)}`}
                      className="px-4 py-2 rounded-full bg-muted/50 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {suggestion}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <EmptyState type="error" description={error} onRetry={() => fetchResults(page, true)} />
          ) : loading && results.length === 0 ? (
            <LoadingGrid count={12} />
          ) : results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                {results.map((item: AnimeItem, index: number) => (
                  <AnimeCard key={item.id + '-' + index} anime={item} index={index} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="px-8 gap-2"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
              {!hasMore && (
                <p className="text-center text-muted-foreground text-sm mt-10">
                  End of results
                </p>
              )}
            </>
          ) : (
            <EmptyState
              type="search"
              description={`No donghua found for "${query}". Try a different keyword.`}
            />
          )}
        </div>
      </main>
    </>
  );
}
