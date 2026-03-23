import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PremiumSkeletonProps {
  className?: string;
  variant?: 'table' | 'card' | 'list';
  rows?: number;
}

export function PremiumSkeleton({ className, variant = 'card', rows = 3 }: PremiumSkeletonProps) {
  if (variant === 'table') {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-2xl animate-pulse">
            <Skeleton className="h-12 w-12 rounded-full bg-muted/60" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3 bg-muted/50" />
              <Skeleton className="h-3 w-1/2 bg-muted/40" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl bg-muted/30" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border-b animate-pulse">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg bg-muted/40" />
              <Skeleton className="h-4 w-32 bg-muted/30" />
            </div>
            <Skeleton className="h-4 w-16 bg-muted/20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-6 rounded-[2rem] border-2 border-border/50 bg-card shadow-sm animate-pulse space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-10 w-10 rounded-xl bg-muted/60" />
            <Skeleton className="h-6 w-24 rounded-full bg-muted/40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4 bg-muted/50" />
            <Skeleton className="h-4 w-1/2 bg-muted/30" />
          </div>
          <div className="pt-4 flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-xl bg-muted/20" />
            <Skeleton className="h-10 w-10 rounded-xl bg-muted/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
