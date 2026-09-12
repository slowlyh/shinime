import { cn } from '@/lib/utils';

interface GenreBadgeProps {
  genre: string;
  className?: string;
  variant?: 'default' | 'outline' | 'filled';
}

export function GenreBadge({ genre, className, variant = 'default' }: GenreBadgeProps) {
  const baseClasses = cn(
    'inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide border transition-colors',
    {
      'bg-card border-white/[0.08] text-muted-foreground': variant === 'default',
      'bg-transparent border-white/[0.12] text-neutral-300': variant === 'outline',
      'bg-accent/15 border-accent/25 text-accent': variant === 'filled',
    },
    className
  );

  return (
    <span className={baseClasses}>
      {genre}
    </span>
  );
}
