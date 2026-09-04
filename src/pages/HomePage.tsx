import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, Sparkles, TrendingUp, Clock, Flame, Crown } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { AnimeCard } from '@/components/AnimeCard';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingGrid } from '@/components/LoadingGrid';
import { EmptyState } from '@/components/EmptyState';
import { anichin, type HomepageData, type AnimeItem } from '@/services/anichin';
import { cn } from '@/lib/utils';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABEL: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
  friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};
const todayKey = () => DAYS[(new Date().getDay() + 6) % 7]; // JS: 0=Sunday → index 6

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [schedule, setSchedule] = useState<Record<string, AnimeItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(todayKey());
  const [activeBoard, setActiveBoard] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [home, sched] = await Promise.all([
        anichin.homepage(),
        anichin.schedule().catch(() => ({})),
      ]);
      setData(home);
      setSchedule(sched as Record<string, AnimeItem[]>);
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const popularToday = data?.popularToday || data?.popular || [];
  const latest = data?.latest || data?.ongoing || [];
  const recommendation = data?.recommendation || data?.recommend || [];
  const leaderboard = data?.leaderboard || {};
  const boardEntries = leaderboard[activeBoard] || [];
  const currentSchedule = schedule[activeDay] || [];

  return (
    <>
      <Helmet>
        <title>shinime - Watch Donghua Online Free</title>
        <meta name="description" content="Watch the latest donghua (Chinese anime) series and episodes for free on shinime. High-quality streaming with no ads." />
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
                <span>Your Gateway to Donghua</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                Stream Your Favorite
                <span className="text-gradient block mt-2">Donghua Series</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Discover thousands of donghua titles, from classic series to the latest releases. All in one place, completely free.
              </p>
            </div>
          </div>
        </section>

        <div className="container max-w-7xl mx-auto px-4 space-y-16">
          {/* Error State with Retry */}
          {error && !loading && (
            <EmptyState type="error" description={error} onRetry={fetchData} />
          )}

          {/* Popular Today */}
          {!error && (
            <section>
              <SectionHeader title="Popular Today" href="/latest" />
              {loading ? (
                <LoadingGrid count={6} />
              ) : popularToday.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                  {popularToday.slice(0, 12).map((anime: AnimeItem, index: number) => (
                    <AnimeCard key={anime.id + index} anime={anime} index={index} showEpisode />
                  ))}
                </div>
              ) : (
                <EmptyState type="donghua" />
              )}
            </section>
          )}

          {/* Latest Release */}
          {!error && (
            <section>
              <SectionHeader title="Latest Release" href="/latest" />
              {loading ? (
                <LoadingGrid count={6} />
              ) : latest.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                  {latest.slice(0, 12).map((anime: AnimeItem, index: number) => (
                    <AnimeCard key={anime.id + index} anime={anime} index={index} showEpisode />
                  ))}
                </div>
              ) : (
                <EmptyState type="donghua" />
              )}
            </section>
          )}

          {/* Recommendation */}
          {!error && recommendation.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-accent" />
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  Recommendation
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                {recommendation.slice(0, 12).map((anime: AnimeItem, index: number) => (
                  <AnimeCard key={anime.id + index} anime={anime} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Leaderboard */}
          {!error && boardEntries.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-6 h-6 text-accent" />
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  Popular Donghua
                </h2>
              </div>

              {/* Board Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
                {(['weekly', 'monthly', 'alltime'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setActiveBoard(range)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                      activeBoard === range
                        ? "bg-accent text-accent-foreground shadow-glow"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {range === 'weekly' ? 'Weekly' : range === 'monthly' ? 'Monthly' : 'All Time'}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {boardEntries.slice(0, 10).map((entry: AnimeItem, index: number) => (
                  <a
                    key={entry.id + index}
                    href={`#/donghua/${entry.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border/50 hover:border-accent hover:bg-accent/5 transition-all group"
                  >
                    <span className={cn(
                      "w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-sm font-bold",
                      index === 0 ? "bg-yellow-400/20 text-yellow-400" :
                      index === 1 ? "bg-gray-400/20 text-gray-300" :
                      index === 2 ? "bg-orange-400/20 text-orange-400" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {entry.rank || index + 1}
                    </span>
                    <img
                      src={entry.poster || entry.image_cover || '/placeholder.svg'}
                      alt={entry.title}
                      loading="lazy"
                      className="w-10 h-14 rounded-md object-cover bg-muted"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold truncate group-hover:text-accent transition-colors">
                        {entry.title}
                      </h3>
                      {entry.rating && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ★ {entry.rating}
                        </p>
                      )}
                    </div>
                    {entry.genres && entry.genres.length > 0 && (
                      <div className="hidden md:flex gap-1.5">
                        {entry.genres.slice(0, 2).map((g) => (
                          <span key={g} className="px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
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
                  Donghua Schedule
                </h2>
              </div>

              {/* Day Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
                {DAYS.map((day) => {
                  const isToday = day === todayKey();
                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                        activeDay === day
                          ? "bg-accent text-accent-foreground shadow-glow"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {DAY_LABEL[day]}
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
                    <AnimeCard key={anime.id + index} anime={anime} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No scheduled donghua for {DAY_LABEL[activeDay]}</p>
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
          <p className="mt-2">Made with ❤️ for donghua fans</p>
        </div>
      </footer>
    </>
  );
}
