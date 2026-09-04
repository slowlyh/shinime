import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft,
  ChevronRight,
  List,
  Loader2,
  AlertCircle,
  ExternalLink,
  Moon,
  Sun,
  X,
  Download,
  Server,
  Tv,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { anichin, type StreamData, type AnimeItem, type Episode } from '@/services/anichin';
import { cn } from '@/lib/utils';

export default function StreamPage() {
  const { animeId, episodeId } = useParams<{ animeId: string; episodeId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<AnimeItem | null>(null);
  const [stream, setStream] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamLoading, setStreamLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [activeServer, setActiveServer] = useState<string>('');
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!animeId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await anichin.detail(decodeURIComponent(animeId));
      setDetail(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [animeId]);

  const fetchStream = useCallback(async () => {
    if (!episodeId) return;
    try {
      setStreamLoading(true);
      setStreamError(null);
      const data = await anichin.stream(decodeURIComponent(episodeId));
      setStream(data);
      // pilih server pertama yang valid, atau default_stream
      const first = data.servers?.find((s) => s.embed_url)?.embed_url || data.default_stream || '';
      setActiveServer(first);
    } catch (err: any) {
      setStreamError(err.message);
    } finally {
      setStreamLoading(false);
    }
  }, [episodeId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  // Episode list (ascending) dari detail
  const episodes = [...(detail?.episodes || [])].sort((a, b) => (a.number || 0) - (b.number || 0));
  const currentEpisodeIndex = episodes.findIndex((ep: Episode) => ep.id === decodeURIComponent(episodeId || ''));
  const currentEpisode = episodes[currentEpisodeIndex];
  const prevEpisode = episodes[currentEpisodeIndex - 1];
  const nextEpisode = episodes[currentEpisodeIndex + 1];

  // Navigasi juga pakai navigation dari stream API (fallback bila detail tidak punya list)
  const navPrevId = prevEpisode?.id || stream?.navigation?.prev || null;
  const navNextId = nextEpisode?.id || stream?.navigation?.next || null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cinemaMode) setCinemaMode(false);
      if (e.key === 'ArrowLeft' && navPrevId && !e.ctrlKey && !e.metaKey) {
        navigate(`/watch/${encodeURIComponent(animeId || '')}/${encodeURIComponent(navPrevId)}`);
      }
      if (e.key === 'ArrowRight' && navNextId && !e.ctrlKey && !e.metaKey) {
        navigate(`/watch/${encodeURIComponent(animeId || '')}/${encodeURIComponent(navNextId)}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const episodeNumber =
    stream?.episode_number || currentEpisode?.number || currentEpisodeIndex + 1;
  const seriesTitle = stream?.series_title || detail?.title || 'Donghua';

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-b from-background to-background/95">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading donghua...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-background to-background/95">
          <div className="container mx-auto px-4 py-12">
            <EmptyState type="error" description={error} onRetry={fetchDetail} />
            <div className="text-center mt-4">
              <Button asChild variant="outline">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const pageTitle = `${seriesTitle} - Episode ${episodeNumber} - shinime`;
  const pageDescription = `Watch ${seriesTitle} Episode ${episodeNumber} donghua online for free on shinime.`;
  const downloadQualities = stream?.downloads ? Object.keys(stream.downloads) : [];

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      {/* Cinema Mode Overlay */}
      {cinemaMode && (
        <div
          className="fixed inset-0 bg-black/90 z-40 transition-opacity duration-300"
          onClick={() => setCinemaMode(false)}
        />
      )}

      {!cinemaMode && <Navbar />}

      <main className={cn(
        "min-h-screen transition-all duration-300",
        cinemaMode
          ? "pt-0 bg-black"
          : "pt-16 sm:pt-20 pb-12 bg-gradient-to-b from-background via-background to-muted/20"
      )}>
        <div className={cn(
          "mx-auto px-4 transition-all duration-300",
          cinemaMode ? "max-w-[1400px] py-4" : "max-w-5xl"
        )}>
          {/* Back Link */}
          {!cinemaMode && (
            <Link
              to={`/donghua/${animeId}`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-md px-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to {seriesTitle}
            </Link>
          )}

          {/* Player Container */}
          <div className="relative z-50 mb-6">
            {/* Cinema Toggle */}
            <div className={cn("absolute top-3 right-3 z-10 flex items-center gap-2", streamLoading && "hidden")}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCinemaMode(!cinemaMode)}
                className="bg-background/80 backdrop-blur-sm hover:bg-background/90 gap-2 text-xs sm:text-sm"
              >
                {cinemaMode ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span className="hidden sm:inline">Exit Cinema</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span className="hidden sm:inline">Cinema Mode</span>
                  </>
                )}
              </Button>
              {cinemaMode && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setCinemaMode(false)}
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {streamLoading ? (
              <div className="aspect-video bg-card rounded-none sm:rounded-xl flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent animate-spin mb-3" />
                <p className="text-muted-foreground text-sm">Loading video...</p>
              </div>
            ) : streamError || !activeServer ? (
              <div className="aspect-video bg-card rounded-none sm:rounded-xl flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load video</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-md text-sm">
                  {streamError || 'Stream URL not found for this episode.'}
                </p>
                <Button onClick={fetchStream} variant="outline" className="gap-2">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="aspect-video bg-black rounded-none sm:rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src={activeServer}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  title={`${seriesTitle} - Episode ${episodeNumber}`}
                />
              </div>
            )}
          </div>

          {/* Server Selector */}
          {!streamLoading && stream?.servers && stream.servers.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold">Video Servers</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {stream.servers.map((srv) => (
                  <button
                    key={srv.server}
                    onClick={() => srv.embed_url && setActiveServer(srv.embed_url)}
                    disabled={!srv.embed_url}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
                      srv.embed_url === activeServer
                        ? "bg-accent text-accent-foreground shadow-glow"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                  >
                    {srv.server}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Downloads */}
          {!streamLoading && downloadQualities.length > 0 && (
            <div className="mb-4 rounded-xl bg-card border border-border/50 overflow-hidden">
              <button
                onClick={() => setShowDownloads(!showDownloads)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-semibold">
                    Download Links ({downloadQualities.length} qualities)
                  </h3>
                </div>
                <ChevronRight className={cn("w-4 h-4 transition-transform", showDownloads && "rotate-90")} />
              </button>
              {showDownloads && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  {downloadQualities.map((quality) => (
                    <div key={quality} className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-bold min-w-[52px] text-center">
                        {quality}
                      </span>
                      {stream?.downloads?.[quality].map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {link.host}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Episode Info & Navigation */}
          <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold truncate">{seriesTitle}</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Episode {episodeNumber}
                  {currentEpisode?.title && (
                    <span className="hidden sm:inline"> — {currentEpisode.title}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  disabled={!navPrevId}
                  onClick={() => navPrevId && navigate(`/watch/${encodeURIComponent(animeId || '')}/${encodeURIComponent(navPrevId)}`)}
                  className="flex-1 sm:flex-none h-11 sm:h-10 gap-1 sm:gap-2"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Prev</span>
                </Button>

                <Button
                  variant={showEpisodes ? "secondary" : "outline"}
                  onClick={() => setShowEpisodes(!showEpisodes)}
                  className="flex-1 sm:flex-none h-11 sm:h-10 gap-1 sm:gap-2"
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="sm:inline">Episodes</span>
                </Button>

                <Button
                  variant="outline"
                  disabled={!navNextId}
                  onClick={() => navNextId && navigate(`/watch/${encodeURIComponent(animeId || '')}/${encodeURIComponent(navNextId)}`)}
                  className="flex-1 sm:flex-none h-11 sm:h-10 gap-1 sm:gap-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>

            {/* Bila detail tidak punya episode list (mis. direct link), pakai nav dari API */}
            {episodes.length === 0 && (navPrevId || navNextId) && (
              <p className="text-xs text-muted-foreground">
                Episode list tersedia di halaman donghua.
                <Link to={`/donghua/${animeId}`} className="text-accent hover:underline ml-1">
                  Lihat semua episode
                </Link>
              </p>
            )}

            {!cinemaMode && (
              <p className="text-xs text-muted-foreground hidden lg:block">
                Tip: Use ← → arrow keys to navigate episodes, Esc to exit cinema mode
              </p>
            )}
          </div>

          {/* Episode List */}
          {showEpisodes && episodes.length > 0 && (
            <div className="mt-4 p-4 sm:p-5 rounded-xl bg-card border border-border/50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">All Episodes</h2>
                <span className="text-sm text-muted-foreground">{episodes.length} episodes</span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {episodes.map((episode: Episode, index: number) => (
                  <Link
                    key={episode.id}
                    to={`/watch/${encodeURIComponent(animeId || '')}/${encodeURIComponent(episode.id)}`}
                    className={cn(
                      "flex items-center justify-center p-2.5 sm:p-2 rounded-lg text-sm font-medium transition-all duration-200",
                      episode.id === decodeURIComponent(episodeId || '')
                        ? "bg-accent text-accent-foreground scale-105 shadow-md"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105"
                    )}
                  >
                    {episode.number || index + 1}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
