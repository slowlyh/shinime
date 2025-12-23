import { AnimeCardSkeleton } from './AnimeCard';

interface LoadingGridProps {
  count?: number;
}

export function LoadingGrid({ count = 12 }: LoadingGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
