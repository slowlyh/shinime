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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat anime';
      setError(msg);
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
      const first =
        data.servers?.find((s) => s.embed_url)?.embed_url || data.default_stream || '';
      setActiveServer(first);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat video stream';
      setStreamError(msg);
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
  const episodes = [...(detail?.episodes || [])].sort(
    (a, b) => (a.number || 0) - (b.number || 0)
  );
  const currentEpisodeIndex = episodes.findIndex(
    (ep: Episode) => ep.id === decodeURIComponent(episodeId || '')
  );
  const currentEpisode = episodes[currentEpisodeIndex];
  const prevEpisode = episodes[currentEpisodeIndex - 1];
  const nextEpisode = episodes[currentEpisodeIndex + 1];

  const navPrevId = prevEpisode?.id || stream?.navigation?.prev || null;
  const navNextId = nextEpisode?.id || stream?.navigation?.next || null;

  // Keyboard shortcuts
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
  const seriesTitle = stream?.series_title || detail?.title || 'Anime';

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-[#09090b]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs text-muted-foreground">Memuat anime...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-[#09090b]">
          <div className="container mx-auto px-4 py-12">
            <EmptyState type="error" description={error} onRetry={fetchDetail} />
            <div className="text-center mt-4">
              <Button asChild variant="outline" className="border-white/[0.1] bg-card text-xs">
                <Link to="/">Kembali ke Beranda</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const pageTitle = `${seriesTitle} Episode ${episodeNumber} - shinime`;
  const pageDescription = `Nonton anime ${seriesTitle} Episode ${episodeNumber} sub Indo online gratis di shinime.`;
  const downloadQualities = stream?.downloads ? Object.keys(stream.downloads) : [];

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      {/* Cinema Mode Backdrop */}
      {cinemaMode && (
        <div
          className="fixed inset-0 bg-black/95 z-40 transition-opacity"
          onClick={() => setCinemaMode(false)}
        />
      )}

      {!cinemaMode && <Navbar />}

      <main
        className={cn(
          'min-h-screen transition-all duration-200 bg-[#09090b] text-foreground',
          cinemaMode ? 'pt-2' : 'pt-20 pb-16'
        )}
      >
        <div
          className={cn(
            'mx-auto px-4 transition-all duration-200',
            cinemaMode ? 'max-w-[1400px]' : 'max-w-5xl'
          )}
        >
          {/* Back to anime */}
          {!cinemaMode && (
            <Link
              to={`/anime/${animeId}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali ke {seriesTitle}
            </Link>
          )}

          {/* Video Container */}
          <div className="relative z-50 mb-5">
            {/* Cinema Controls */}
            <div className={cn('absolute top-3 right-3 z-10 flex items-center gap-2', streamLoading && 'hidden')}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCinemaMode(!cinemaMode)}
                className="bg-black/80 hover:bg-black/90 text-white border border-white/[0.1] gap-1.5 text-xs h-8"
              >
                {cinemaMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluar Cinema</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cinema Mode</span>
                  </>
                )}
              </Button>
              {cinemaMode && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setCinemaMode(false)}
                  className="bg-black/80 hover:bg-black/90 text-white border border-white/[0.1] h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {streamLoading ? (
              <div className="aspect-video bg-card rounded-xl border border-white/[0.08] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-accent animate-spin mb-2" />
                <p className="text-xs text-muted-foreground">Menghubungkan server video...</p>
              </div>
            ) : streamError || !activeServer ? (
              <div className="aspect-video bg-card rounded-xl border border-white/[0.08] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-10 h-10 text-destructive mb-3" />
                <h3 className="text-base font-semibold text-white mb-1">Gagal memuat video</h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">
                  {streamError || 'Server streaming belum tersedia untuk episode ini.'}
                </p>
                <Button onClick={fetchStream} variant="outline" size="sm" className="border-white/[0.1] text-xs">
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl">
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
            <div className="mb-4 p-4 rounded-xl bg-card border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-white">
                <Server className="w-3.5 h-3.5 text-accent" />
                <span>Pilih Server Stream</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {stream.servers.map((srv, idx) => (
                  <button
                    key={`${srv.server}-${idx}`}
                    onClick={() => srv.embed_url && setActiveServer(srv.embed_url)}
                    disabled={!srv.embed_url}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border',
                      srv.embed_url === activeServer
                        ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                        : 'bg-muted/40 border-white/[0.06] text-muted-foreground hover:text-white hover:border-white/[0.15]'
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
            <div className="mb-4 rounded-xl bg-card border border-white/[0.06] overflow-hidden">
              <button
                onClick={() => setShowDownloads(!showDownloads)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Download className="w-3.5 h-3.5 text-accent" />
                  <span>Download Video ({downloadQualities.length} kualitas)</span>
                </div>
                <ChevronRight className={cn('w-4 h-4 text-muted-foreground transition-transform', showDownloads && 'rotate-90')} />
              </button>
              {showDownloads && (
                <div className="px-4 pb-4 space-y-3 pt-1 border-t border-white/[0.06]">
                  {downloadQualities.map((quality) => (
                    <div key={quality} className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-accent/15 text-accent text-[11px] font-bold min-w-[50px] text-center border border-accent/20">
                        {quality}
                      </span>
                      {stream?.downloads?.[quality].map((link, lIdx) => (
                        <a
                          key={`${link.url}-${lIdx}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted/40 border border-white/[0.06] text-[11px] font-medium text-muted-foreground hover:text-white hover:border-white/[0.15] transition-colors"
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
          <div className="p-4 sm:p-5 rounded-xl bg-card border border-white/[0.06] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">{seriesTitle}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Episode {episodeNumber}
                  {currentEpisode?.title && <span className="ml-1.5">• {currentEpisode.title}</span>}
                </p>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!navPrevId}
                  onClick={() =>
                    navPrevId &&
                    navigate(`/watch/${encodeURIComponent(animeId || '')}/${encodeURIComponent(navPrevId)}`)
                  }
                  className="gap-1 border-white/[0.1] bg-card hover:bg-muted text-xs h-8"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEpisodes(!showEpisodes)}
                  className="gap-1 border-white/[0.1] bg-card hover:bg-muted text-xs h-8"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Episode</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!navNextId}
                  onClick={() =>
                    navNextId &&
                    navigate(`/watch/${encodeURIComponent(animeId || '')}/${encodeURIComponent(navNextId)}`)
                  }
                  className="gap-1 border-white/[0.1] bg-card hover:bg-muted text-xs h-8"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Episode Grid Dropdown */}
            {showEpisodes && (
              <div className="pt-3 border-t border-white/[0.06]">
                <h4 className="text-xs font-semibold text-white mb-2.5">Pilih Episode</h4>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {episodes.map((ep: Episode) => (
                    <button
                      key={ep.id}
                      onClick={() => {
                        setShowEpisodes(false);
                        navigate(`/watch/${encodeURIComponent(animeId || '')}/${encodeURIComponent(ep.id)}`);
                      }}
                      className={cn(
                        'py-1.5 text-xs font-semibold rounded transition-colors border',
                        ep.id === decodeURIComponent(episodeId || '')
                          ? 'bg-accent text-white border-accent'
                          : 'bg-muted/40 border-white/[0.06] text-muted-foreground hover:text-white hover:border-white/[0.15]'
                      )}
                    >
                      {ep.number}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
