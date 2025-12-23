import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { AnimeCard } from '@/components/AnimeCard';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingGrid } from '@/components/LoadingGrid';
import { EmptyState } from '@/components/EmptyState';
import { InformationCard } from '@/components/InformationCard';
import { mobinime, type HomepageData, type AnimeItem } from '@/services/mobinime';
import { cn } from '@/lib/utils';

// API returns schedule with numeric keys: 1=Sunday, 2=Monday, etc.
const DAY_MAP: Record<number, string> = {
  1: 'Sunday',
  2: 'Monday',
  3: 'Tuesday',
  4: 'Wednesday',
  5: 'Thursday',
  6: 'Friday',
  7: 'Saturday',
};

// Get API day index from JS day (0=Sunday becomes 1)
const getApiDayIndex = (jsDay: number): number => jsDay + 1;

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(getApiDayIndex(new Date().getDay()));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mobinime.homepage();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get recommended anime (API returns as 'recommend')
  const recommendedAnime = data?.recommend || data?.recommended || data?.popular || [];
  
  // Get ongoing anime
  const ongoingAnime = data?.ongoing || [];
  
  // Get schedule for active day (API uses numeric keys)
  const scheduleData = data?.schedule || {};
  const currentSchedule = scheduleData[activeDay.toString()] || [];
  
  // Get information/announcements
  const information = data?.information || [];

  return (
    <>
      <Helmet>
        <title>shinime - Watch Anime Online Free</title>
        <meta name="description" content="Watch the latest anime series, movies, and OVAs for free on shinime. High-quality streaming with no ads." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20 pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
          <div className="container max-w-7xl mx-auto px-4 py-12 md:py-20 relative">
            <div className="max-w-3xl mx-auto text-center fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Your Gateway to Anime</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                Stream Your Favorite
                <span className="text-gradient block mt-2">Anime Series</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Discover thousands of anime titles, from classic series to the latest releases. All in one place, completely free.
              </p>
            </div>
          </div>
        </section>

        <div className="container max-w-7xl mx-auto px-4 space-y-16">
          {/* Information / Announcements */}
          {information.length > 0 && (
            <section className="space-y-3">
              {information.map((info, index) => (
                <InformationCard
                  key={info.id || index}
                  title={info.title}
                  description={info.desc || ''}
                />
              ))}
            </section>
          )}

          {/* Error State with Retry */}
          {error && !loading && (
            <EmptyState 
              type="error" 
              description={error} 
              onRetry={fetchData}
            />
          )}

          {/* Recommended Section */}
          {!error && (
            <section>
              <SectionHeader 
                title="Recommended For You" 
                href="/anime/list/series"
              />
              {loading ? (
                <LoadingGrid count={6} />
              ) : recommendedAnime.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                  {recommendedAnime.slice(0, 12).map((anime: AnimeItem, index: number) => (
                    <AnimeCard key={anime.id} anime={anime} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyState type="anime" />
              )}
            </section>
          )}

          {/* Ongoing Section */}
          {!error && ongoingAnime.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-accent" />
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  Ongoing Anime
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                {ongoingAnime.slice(0, 12).map((anime: AnimeItem, index: number) => (
                  <AnimeCard key={anime.id} anime={anime} index={index} showEpisode />
                ))}
              </div>
            </section>
          )}

          {/* Schedule Section */}
          {!error && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-accent" />
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  Anime Schedule
                </h2>
              </div>

              {/* Day Tabs - API uses 1-7 for Sunday-Saturday */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
                {[1, 2, 3, 4, 5, 6, 7].map((dayIndex) => {
                  const isToday = dayIndex === getApiDayIndex(new Date().getDay());
                  return (
                    <button
                      key={dayIndex}
                      onClick={() => setActiveDay(dayIndex)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                        activeDay === dayIndex
                          ? "bg-accent text-accent-foreground shadow-glow"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {DAY_MAP[dayIndex]}
                      {isToday && (
                        <span className="ml-2 text-xs opacity-70">(Today)</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {loading ? (
                <LoadingGrid count={6} />
              ) : currentSchedule.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                  {currentSchedule.map((anime: AnimeItem, index: number) => (
                    <AnimeCard key={anime.id} anime={anime} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No scheduled anime for {DAY_MAP[activeDay]}</p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Shinime. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ for anime fans</p>
        </div>
      </footer>
    </>
  );
}
