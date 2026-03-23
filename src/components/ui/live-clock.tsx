"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock, Globe } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LiveClockProps {
  className?: string;
  showSelector?: boolean;
  value?: string;
  onValueChange?: (timezone: string) => void;
}

export function LiveClock({ className, showSelector = true, value, onValueChange }: LiveClockProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [localTimezone, setLocalTimezone] = useState("Asia/Manila");

  const currentTimezone = value || localTimezone;

  const allTimezones = useMemo(() => {
    try {
      const iana = Intl.supportedValuesOf('timeZone');
      return [
        { label: "Local (Auto)", value: "auto" },
        ...iana.map(tz => ({ label: tz.replace(/_/g, ' '), value: tz }))
      ];
    } catch (e) {
      return [
        { label: "Local (Auto)", value: "auto" },
        { label: "Manila (PH)", value: "Asia/Manila" },
        { label: "UTC", value: "UTC" }
      ];
    }
  }, []);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="h-10 w-40 bg-white/5 animate-pulse rounded-full" />;

  const targetTimezone = currentTimezone === "auto" ? Intl.DateTimeFormat().resolvedOptions().timeZone : currentTimezone;

  const formattedTime = time.toLocaleTimeString("en-US", {
    timeZone: targetTimezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString("en-US", {
    timeZone: targetTimezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={cn("flex items-center gap-3 transition-all", className)}>
      <div className="flex flex-col items-end leading-none">
        <span className="text-[0.75rem] font-black tabular-nums tracking-tighter uppercase whitespace-nowrap">
          {formattedTime}
        </span>
        <span className="text-[0.5rem] font-bold uppercase tracking-[0.1em] opacity-60">
          {formattedDate}
        </span>
      </div>

      {showSelector && (
        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
          <Select 
            value={currentTimezone} 
            onValueChange={(val) => {
              if (onValueChange) onValueChange(val);
              else setLocalTimezone(val);
            }}
          >
            <SelectTrigger className="h-7 border-none bg-transparent text-[0.625rem] font-black uppercase hover:text-secondary p-0 focus:ring-0 w-[120px] shadow-none flex items-center gap-2 cursor-pointer">
              <Globe className="h-3 w-3 opacity-40" />
              <SelectValue placeholder="Timezone" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/10 bg-[#032e41] text-white shadow-2xl overflow-hidden min-w-[200px]">
              <ScrollArea className="h-[300px] w-full p-1">
                {allTimezones.map((tz) => (
                  <SelectItem 
                    key={tz.value} 
                    value={tz.value} 
                    className="text-[0.625rem] font-bold uppercase cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-secondary"
                  >
                    {tz.label}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
