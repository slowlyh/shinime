import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import type { AnimeItem } from '@/services/anichin';

interface AnimeCardProps {
  anime: AnimeItem;
  index?: number;
  showEpisode?: boolean;
}

export function AnimeCard({ anime, index = 0, showEpisode = false }: AnimeCardProps) {
  const imageUrl =
    anime.image_cover ||
    anime.imageCover ||
    anime.poster ||
    anime.thumbnail ||
    '/placeholder.svg';

  const totalEpisodes = anime.totalEpisode || anime.totalEpisodes;
  const currentEpisode = anime.episode;
  const targetId = anime.id || anime.slug;

  return (
    <Link
      to={`/anime/${targetId}`}
      className="group relative block rounded-lg overflow-hidden border border-white/[0.08] bg-card transition-all duration-200 hover:border-white/20 hover:-translate-y-1 hover:shadow-lg opacity-0 slide-up"
      style={{ animationDelay: `${index * 0.03}s`, animationFillMode: 'forwards' }}
    >
      {/* Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted/40">
        <img
          src={imageUrl}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Minimal Play Indicator on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="w-11 h-11 rounded-full bg-accent/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Rating Badge */}
        {anime.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[11px] font-semibold text-neutral-200 border border-white/[0.08]">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{anime.rating}</span>
          </div>
        )}

        {/* Type Badge */}
        {anime.type && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-bold text-neutral-300 border border-white/[0.08] uppercase tracking-wider">
            {anime.type}
          </div>
        )}

        {/* Episode Badge */}
        {showEpisode && currentEpisode && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-accent/90 text-white text-[10px] font-bold tracking-wide">
            EP {currentEpisode}{totalEpisodes ? `/${totalEpisodes}` : ''}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-accent transition-colors">
          {anime.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground">
          {anime.year && <span>{anime.year}</span>}
          {anime.year && (totalEpisodes || anime.status) && <span>•</span>}
          {totalEpisodes ? (
            <span>{totalEpisodes} Eps</span>
          ) : (
            anime.status && <span>{anime.status}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-white/[0.06] bg-card">
      <div className="aspect-[2/3] bg-muted/40 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-muted/40 rounded animate-pulse w-5/6" />
        <div className="h-2.5 bg-muted/30 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}
