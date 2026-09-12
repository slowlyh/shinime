import { Search, Film, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateType = 'search' | 'anime' | 'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  className?: string;
  onRetry?: () => void;
}

const iconMap = {
  search: Search,
  anime: Film,
  error: AlertCircle,
};

const defaultContent = {
  search: {
    title: 'No results found',
    description: "Try adjusting your search query to find what you're looking for.",
  },
  anime: {
    title: 'No anime found',
    description: 'There are no anime in this section yet.',
  },
  error: {
    title: 'Something went wrong',
    description: 'Failed to load content. Please try again.',
  },
};

export function EmptyState({ 
  type = 'anime', 
  title, 
  description,
  className,
  onRetry
}: EmptyStateProps) {
  const Icon = iconMap[type] || Film;
  const content = defaultContent[type] || defaultContent.anime;

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-white/[0.08]",
        type === 'error' ? "bg-destructive/10 text-destructive" : "bg-card text-muted-foreground"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold mb-1.5 text-foreground">
        {title || content.title}
      </h3>
      <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mb-4">
        {description || content.description}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="gap-2 border-white/[0.1] bg-card hover:bg-muted text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
}
