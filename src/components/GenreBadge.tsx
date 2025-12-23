import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GenreBadgeProps {
  genre: string;
  href?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'filled';
}

export function GenreBadge({ genre, href, className, variant = 'default' }: GenreBadgeProps) {
  const baseClasses = cn(
    'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
    {
      'bg-muted/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground': variant === 'default',
      'border border-border/50 text-muted-foreground hover:border-accent hover:text-accent': variant === 'outline',
      'bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground': variant === 'filled',
    },
    className
  );

  const formattedGenre = genre.toLowerCase().replace(/\s+/g, '-');

  if (href) {
    return (
      <Link to={href} className={baseClasses}>
        {genre}
      </Link>
    );
  }

  return (
    <Link to={`/anime/list/series?genre=${formattedGenre}`} className={baseClasses}>
      {genre}
    </Link>
  );
}
