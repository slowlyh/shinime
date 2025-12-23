import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { AnimeCard } from '@/components/AnimeCard';
import { LoadingGrid } from '@/components/LoadingGrid';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { mobinime, type AnimeItem } from '@/services/mobinime';

const SUGGESTIONS = [
  'Naruto',
  'One Piece',
  'Attack on Titan',
  'Demon Slayer',
  'Jujutsu Kaisen',
  'My Hero Academia',
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchResults = useCallback(async (pageNum: number, isNewSearch = false) => {
    if (!query) return;

    try {
      setLoading(true);
      setError(null);
      const data = await mobinime.search(query, { page: pageNum.toString(), count: '20' });
      
      if (isNewSearch) {
        setResults(data || []);
      } else {
        setResults((prev) => [...prev, ...(data || [])]);
      }
      
      setHasMore((data || []).length === 20);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query) {
      setPage(0);
      setResults([]);
      fetchResults(0, true);
    } else {
      setResults([]);
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
        <meta name="description" content={`Search results for "${query}" on shinime. Find your favorite anime series, movies, and OVAs.`} />
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
            // Empty search - show suggestions
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Start searching</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Enter a search term to find your favorite anime series, movies, and more.
              </p>
              
              {/* Suggestions */}
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
          ) : loading && results.length === 0 ? (
            <LoadingGrid count={12} />
          ) : error ? (
            <EmptyState 
              type="error" 
              description={error} 
              onRetry={() => fetchResults(0, true)}
            />
          ) : results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((anime, index) => (
                  <AnimeCard key={`${anime.id}-${index}`} anime={anime} index={index} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState 
              type="search" 
              title="No results found"
              description={`We couldn't find any anime matching "${query}". Try different keywords.`}
            />
          )}
        </div>
      </main>
    </>
  );
}
