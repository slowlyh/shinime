import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Tag, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { EmptyState } from '@/components/EmptyState';
import { mobinime, type Genre } from '@/services/mobinime';
import { cn } from '@/lib/utils';

// Fun gradient colors for genres
const GRADIENT_COLORS = [
  'from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30',
  'from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30',
  'from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30',
  'from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30',
  'from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30',
  'from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30',
  'from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30',
  'from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30',
];

export default function GenreListPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenres = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mobinime.genreList();
      setGenres(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  return (
    <>
      <Helmet>
        <title>Anime Genres - shinime</title>
        <meta name="description" content="Browse anime by genre on shinime. Find action, romance, comedy, horror, and more anime genres." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="py-8 border-b border-border/50 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="w-6 h-6 text-accent" />
              <h1 className="text-2xl md:text-3xl font-bold">Anime Genres</h1>
            </div>
            <p className="text-muted-foreground">
              Browse anime by your favorite genres
            </p>
          </div>

          {/* Genres Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <EmptyState 
              type="error" 
              description={error}
              onRetry={fetchGenres}
            />
          ) : genres.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {genres.map((genre, index) => {
                const slug = genre.title.toLowerCase().replace(/\s+/g, '-');
                const gradientClass = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                
                return (
                  <Link
                    key={genre.id}
                    to={`/anime/list/series?genre=${slug}`}
                    className={cn(
                      "group relative flex items-center justify-between p-4 rounded-xl bg-gradient-to-br border border-border/50 transition-all duration-300 hover-glow opacity-0 slide-up",
                      gradientClass
                    )}
                    style={{ animationDelay: `${index * 0.03}s`, animationFillMode: 'forwards' }}
                  >
                    <span className="font-medium text-foreground group-hover:text-accent transition-colors">
                      {genre.title}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState 
              type="anime" 
              title="No genres found"
              description="Genre list is not available at the moment."
            />
          )}
        </div>
      </main>
    </>
  );
}
