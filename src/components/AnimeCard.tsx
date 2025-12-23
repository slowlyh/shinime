import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import type { AnimeItem } from '@/services/mobinime';

interface AnimeCardProps {
  anime: AnimeItem;
  index?: number;
  showEpisode?: boolean;
}

export function AnimeCard({ anime, index = 0, showEpisode = false }: AnimeCardProps) {
  // Handle different image field names from API - image_cover is used on homepage, imageCover on search
  const imageUrl = anime.image_cover || anime.imageCover || anime.poster || anime.thumbnail || '/placeholder.svg';
  
  // Handle different episode count field names
  const totalEpisodes = anime.totalEpisode || anime.totalEpisodes;
  const currentEpisode = anime.episode;
  
  return (
    <Link
      to={`/anime/${anime.id}`}
      className="group relative block rounded-xl overflow-hidden hover-glow opacity-0 slide-up"
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
    >
      {/* Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center shadow-glow transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-accent-foreground fill-accent-foreground ml-1" />
          </div>
        </div>

        {/* Rating Badge */}
        {anime.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{anime.rating}</span>
          </div>
        )}

        {/* Type Badge */}
        {anime.type && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-accent/90 text-accent-foreground text-xs font-medium uppercase">
            {anime.type}
          </div>
        )}

        {/* Episode Badge - for ongoing section */}
        {showEpisode && currentEpisode && totalEpisodes && (
          <div className="absolute bottom-12 left-2 px-2 py-1 rounded-md bg-primary/90 text-primary-foreground text-xs font-medium">
            EP {currentEpisode}/{totalEpisodes}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {anime.year && <span>{anime.year}</span>}
          {anime.year && totalEpisodes && <span>•</span>}
          {totalEpisodes && <span>{totalEpisodes} Eps</span>}
          {!anime.year && !totalEpisodes && anime.status && <span>{anime.status}</span>}
        </div>
      </div>
    </Link>
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="aspect-[2/3] bg-muted animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );
}
