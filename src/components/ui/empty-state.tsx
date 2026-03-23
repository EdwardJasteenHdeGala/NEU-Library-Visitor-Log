"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in zoom-in duration-500",
      "bg-muted/5 border-2 border-dashed border-border rounded-[2.5rem] shadow-inner",
      className
    )}>
      <div className="p-6 bg-muted/20 rounded-[2rem] mb-6 ring-1 ring-border shadow-2xl">
        <Icon className="h-12 w-12 text-muted-foreground/30" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black text-primary uppercase italic tracking-tighter">
          {title}
        </h3>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40 max-w-xs mx-auto leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
