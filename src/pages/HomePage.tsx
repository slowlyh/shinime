import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Calendar, TrendingUp, Flame, Crown, Play } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { AnimeCard } from '@/components/AnimeCard';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingGrid } from '@/components/LoadingGrid';
import { EmptyState } from '@/components/EmptyState';
import { anichin, type HomepageData, type AnimeItem } from '@/services/anichin';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABEL: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};
const todayKey = () => DAYS[(new Date().getDay() + 6) % 7];

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load content';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const popularToday = data?.popularToday || data?.popular || [];
  const latest = data?.latest || data?.ongoing || [];
  const leaderboard = data?.leaderboard || {};
  const boardEntries = leaderboard[activeBoard] || [];
  const currentSchedule = schedule[activeDay] || [];

  return (
    <>
      <Helmet>
        <title>shinime - Watch Anime Online Free</title>
        <meta
          name="description"
          content="Nonton streaming anime sub Indo terlengkap dan episode terbaru gratis di shinime. Kualitas HD tanpa buffering."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20 pb-16 bg-[#09090b] text-foreground">
        {/* Minimalist Dark Hero */}
        <section className="relative overflow-hidden border-b border-white/[0.06] py-14 md:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,92,252,0.12),transparent_60%)]" />
          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-5 tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Anime Streaming Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Stream Anime Terbaru <span className="text-gradient">Tanpa Hambatan</span>
            </h1>

            <p className="mt-3.5 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Koleksi ribuan judul anime ongoing, movie, dan serial legendaris dengan subtitle Indonesia dan server cepat.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                to="/latest"
                className="px-5 py-2.5 rounded-lg bg-accent text-white text-xs sm:text-sm font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Menonton</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="container max-w-7xl mx-auto px-4 space-y-14 mt-10">
          {/* Error State */}
          {error && !loading && (
            <EmptyState type="error" description={error} onRetry={fetchData} />
          )}

          {/* Popular Today */}
          {!error && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Populer Hari Ini
                  </h2>
                </div>
                <Link
                  to="/latest"
                  className="text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
                >
                  Lihat Semua →
                </Link>
              </div>

              {loading ? (
                <LoadingGrid count={6} />
              ) : popularToday.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {popularToday.slice(0, 12).map((anime: AnimeItem, index: number) => (
                    <AnimeCard key={anime.id + index} anime={anime} index={index} showEpisode />
                  ))}
                </div>
              ) : (
                <EmptyState type="anime" />
              )}
            </section>
          )}

          {/* Latest Episodes */}
          {!error && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Episode Terbaru
                  </h2>
                </div>
                <Link
                  to="/latest"
                  className="text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
                >
                  Semua Rilis →
                </Link>
              </div>

              {loading ? (
                <LoadingGrid count={6} />
              ) : latest.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {latest.slice(0, 12).map((anime: AnimeItem, index: number) => (
                    <AnimeCard key={anime.id + index} anime={anime} index={index} showEpisode />
                  ))}
                </div>
              ) : (
                <EmptyState type="anime" />
              )}
            </section>
          )}

          {/* Leaderboard & Release Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            {/* Leaderboard Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Top Anime
                  </h3>
                </div>

                <div className="flex gap-1 bg-card p-0.5 rounded-lg border border-white/[0.06] text-xs">
                  {(['weekly', 'monthly', 'alltime'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveBoard(tab)}
                      className={cn(
                        'px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer',
                        activeBoard === tab
                          ? 'bg-accent text-white'
                          : 'text-muted-foreground hover:text-white'
                      )}
                    >
                      {tab === 'alltime' ? 'All Time' : tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {boardEntries.slice(0, 6).map((entry, idx) => (
                  <Link
                    key={entry.id || idx}
                    to={`/anime/${entry.id || entry.slug}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-white/[0.05] bg-card/60 hover:bg-card hover:border-white/[0.12] transition-all group"
                  >
                    <span
                      className={cn(
                        'w-6 text-center font-bold text-sm',
                        idx === 0
                          ? 'text-amber-400'
                          : idx === 1
                          ? 'text-neutral-300'
                          : idx === 2
                          ? 'text-amber-600'
                          : 'text-muted-foreground'
                      )}
                    >
                      {idx + 1}
                    </span>

                    <img
                      src={entry.poster || entry.image_cover || '/placeholder.svg'}
                      alt={entry.title}
                      className="w-10 h-14 object-cover rounded bg-muted/40 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-accent transition-colors">
                        {entry.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {entry.type || 'Anime'} {entry.score ? `• ⭐ ${entry.score}` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Schedule Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Jadwal Rilis Anime
                  </h3>
                </div>
              </div>

              {/* Day Pills */}
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border',
                      activeDay === day
                        ? 'bg-accent text-white border-accent'
                        : 'bg-card border-white/[0.06] text-muted-foreground hover:text-white hover:border-white/[0.15]'
                    )}
                  >
                    {DAY_LABEL[day]}
                  </button>
                ))}
              </div>

              {/* Day Anime List */}
              <div className="space-y-2">
                {currentSchedule.length > 0 ? (
                  currentSchedule.map((anime, idx) => (
                    <Link
                      key={anime.id || idx}
                      to={`/anime/${anime.id || anime.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-white/[0.05] bg-card/60 hover:bg-card hover:border-white/[0.12] transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={anime.poster || anime.image_cover || '/placeholder.svg'}
                          alt={anime.title}
                          className="w-9 h-12 object-cover rounded bg-muted/40 shrink-0"
                        />
                        <span className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-accent transition-colors">
                          {anime.title}
                        </span>
                      </div>
                      {anime.time && (
                        <span className="text-[11px] font-mono text-muted-foreground ml-2 shrink-0">
                          {anime.time}
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center border border-dashed border-white/[0.08] rounded-lg text-xs text-muted-foreground">
                    Tidak ada jadwal tayang untuk hari {DAY_LABEL[activeDay]}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Footer */}
        <footer className="mt-20 border-t border-white/[0.08] py-8 text-center text-xs text-muted-foreground">
          <p>© 2026 shinime — Minimalist Anime Streaming Platform</p>
        </footer>
      </main>
    </>
  );
}
