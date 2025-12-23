import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  X
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { mobinime, type AnimeItem, type Episode } from '@/services/mobinime';
import { cn } from '@/lib/utils';

export default function StreamPage() {
  const { animeId, episodeId } = useParams<{ animeId: string; episodeId: string }>();
  const navigate = useNavigate();
  
  const [anime, setAnime] = useState<AnimeItem | null>(null);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [streamLoading, setStreamLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [quality, setQuality] = useState<string>('HD');
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);

  const fetchAnimeDetail = useCallback(async () => {
    if (!animeId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await mobinime.detail(animeId);
      setAnime(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [animeId]);

  const fetchStream = useCallback(async () => {
    if (!animeId || !episodeId) return;

    try {
      setStreamLoading(true);
      setStreamError(null);
      const url = await mobinime.stream(animeId, episodeId, { quality });
      setStreamUrl(url);
    } catch (err: any) {
      setStreamError(err.message);
    } finally {
      setStreamLoading(false);
    }
  }, [animeId, episodeId, quality]);

  useEffect(() => {
    fetchAnimeDetail();
  }, [fetchAnimeDetail]);

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cinemaMode) {
        setCinemaMode(false);
      }
      if (e.key === 'ArrowLeft' && prevEpisode && !e.ctrlKey && !e.metaKey) {
        navigate(`/watch/${animeId}/${prevEpisode.id}`);
      }
      if (e.key === 'ArrowRight' && nextEpisode && !e.ctrlKey && !e.metaKey) {
        navigate(`/watch/${animeId}/${nextEpisode.id}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Sort episodes ascending
  const episodes = [...(anime?.episodes || [])].sort((a, b) => (a.number || 0) - (b.number || 0));
  const currentEpisodeIndex = episodes.findIndex((ep: Episode) => ep.id === episodeId);
  const currentEpisode = episodes[currentEpisodeIndex];
  const prevEpisode = episodes[currentEpisodeIndex - 1];
  const nextEpisode = episodes[currentEpisodeIndex + 1];

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
  };

  // Check if URL is an embed URL (iframe) vs direct video
  const isEmbedUrl = streamUrl && (
    streamUrl.includes('embed') || 
    streamUrl.includes('player') || 
    streamUrl.includes('iframe') ||
    !streamUrl.match(/\.(mp4|m3u8|webm)/)
  );

  // Validate stream URL
  const isValidStreamUrl = streamUrl && (
    streamUrl.startsWith('http://') || 
    streamUrl.startsWith('https://')
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-b from-background to-background/95">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading anime...</p>
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
            <EmptyState 
              type="error" 
              description={error} 
              onRetry={fetchAnimeDetail}
            />
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

  // Build title as a plain string to avoid Helmet errors
  const episodeNumber = currentEpisode?.number || currentEpisodeIndex + 1;
  const pageTitle = anime?.title 
    ? `${anime.title} - Episode ${episodeNumber} - shinime`
    : 'Watch Anime - shinime';
  const pageDescription = anime?.title
    ? `Watch ${anime.title} Episode ${episodeNumber} online for free on shinime.`
    : 'Watch anime online for free on shinime.';

  // Get poster image with fallback
  const posterImage = anime?.image_cover || anime?.imageCover || anime?.poster || anime?.thumbnail;

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
          {/* Back Link - Hidden in cinema mode */}
          {!cinemaMode && (
            <Link
              to={`/anime/${animeId}`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-md px-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to {anime?.title}
            </Link>
          )}

          {/* Video Player Container */}
          <div className={cn(
            "relative z-50 transition-all duration-300",
            cinemaMode ? "mb-4" : "mb-6",
            // Sticky on mobile when not in cinema mode
            !cinemaMode && "sm:relative"
          )}>
            {/* Cinema Mode Toggle */}
            <div className={cn(
              "absolute top-3 right-3 z-10 flex items-center gap-2",
              streamLoading && "hidden"
            )}>
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
            ) : streamError || !isValidStreamUrl ? (
              <div className="aspect-video bg-card rounded-none sm:rounded-xl flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load video</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-md text-sm">
                  {streamError || 'Invalid stream URL'}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={fetchStream} variant="outline" className="gap-2">
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => setQuality(quality === 'HD' ? 'SD' : 'HD')} 
                    variant="outline"
                  >
                    Try {quality === 'HD' ? 'SD' : 'HD'} Quality
                  </Button>
                  {streamUrl && (
                    <Button asChild variant="outline" className="gap-2">
                      <a href={streamUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Open in New Tab
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ) : isEmbedUrl ? (
              // Use iframe for embed URLs
              <div className="aspect-video bg-black rounded-none sm:rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src={streamUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  title={`${anime?.title} - Episode ${currentEpisode?.number || currentEpisodeIndex + 1}`}
                />
              </div>
            ) : (
              // Use video player for direct video URLs
              <div className="rounded-none sm:rounded-xl overflow-hidden shadow-2xl">
                <VideoPlayer
                  src={streamUrl}
                  poster={posterImage}
                  title={`Episode ${episodeNumber}`}
                  onQualityChange={handleQualityChange}
                  qualities={['HD', 'SD']}
                  currentQuality={quality}
                />
              </div>
            )}
          </div>

          {/* External Link for embed - Hidden in cinema mode on mobile */}
          {!streamLoading && !streamError && isEmbedUrl && isValidStreamUrl && (
            <div className={cn(
              "mb-4 flex justify-end",
              cinemaMode && "hidden sm:flex"
            )}>
              <a
                href={streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-md px-2 py-1"
              >
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </a>
            </div>
          )}

          {/* Episode Info & Navigation */}
          <div className={cn(
            "flex flex-col gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-300",
            cinemaMode 
              ? "bg-card/50 backdrop-blur-sm border-border/30" 
              : "bg-card border-border/50"
          )}>
            {/* Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold truncate">
                  {anime?.title}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Episode {currentEpisode?.number || currentEpisodeIndex + 1}
                  {currentEpisode?.title && (
                    <span className="hidden sm:inline"> — {currentEpisode.title}</span>
                  )}
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="default"
                  disabled={!prevEpisode}
                  onClick={() => prevEpisode && navigate(`/watch/${animeId}/${prevEpisode.id}`)}
                  className="flex-1 sm:flex-none h-11 sm:h-10 gap-1 sm:gap-2 focus:ring-2 focus:ring-accent"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Prev</span>
                </Button>

                <Button
                  variant={showEpisodes ? "secondary" : "outline"}
                  size="default"
                  onClick={() => setShowEpisodes(!showEpisodes)}
                  className="flex-1 sm:flex-none h-11 sm:h-10 gap-1 sm:gap-2 focus:ring-2 focus:ring-accent"
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="sm:inline">Episodes</span>
                </Button>

                <Button
                  variant="outline"
                  size="default"
                  disabled={!nextEpisode}
                  onClick={() => nextEpisode && navigate(`/watch/${animeId}/${nextEpisode.id}`)}
                  className="flex-1 sm:flex-none h-11 sm:h-10 gap-1 sm:gap-2 focus:ring-2 focus:ring-accent"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>

            {/* Keyboard shortcuts hint */}
            {!cinemaMode && (
              <p className="text-xs text-muted-foreground hidden lg:block">
                Tip: Use ← → arrow keys to navigate episodes, Esc to exit cinema mode
              </p>
            )}
          </div>

          {/* Episode List */}
          {showEpisodes && (
            <div className={cn(
              "mt-4 p-4 sm:p-5 rounded-xl border animate-fade-in",
              cinemaMode 
                ? "bg-card/50 backdrop-blur-sm border-border/30" 
                : "bg-card border-border/50"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">All Episodes</h2>
                <span className="text-sm text-muted-foreground">
                  {episodes.length} episodes
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {episodes.map((episode: Episode, index: number) => (
                  <Link
                    key={episode.id}
                    to={`/watch/${animeId}/${episode.id}`}
                    className={cn(
                      "flex items-center justify-center p-2.5 sm:p-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
                      episode.id === episodeId
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
