import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InformationCardProps {
  title?: string;
  description: string;
  className?: string;
}

export function InformationCard({ title, description, className }: InformationCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={cn(
      "relative flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20",
      className
    )}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
        <Info className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0 pr-8">
        {title && (
          <h4 className="font-medium text-foreground mb-1">{title}</h4>
        )}
        <div 
          className="text-sm text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
