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
    description: 'Try adjusting your search or filter to find what you\'re looking for.',
  },
  anime: {
    title: 'No anime found',
    description: 'There are no anime in this category yet.',
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
  const Icon = iconMap[type];
  const content = defaultContent[type];

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-4",
        type === 'error' ? "bg-destructive/10" : "bg-muted/50"
      )}>
        <Icon className={cn(
          "w-8 h-8",
          type === 'error' ? "text-destructive" : "text-muted-foreground"
        )} />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {title || content.title}
      </h3>
      <p className="text-muted-foreground max-w-md mb-4">
        {description || content.description}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
