
"use client";

import { useState, useEffect } from "react";
import { Clock, Globe } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TIMEZONES = [
  { label: "Manila (PH)", value: "Asia/Manila" },
  { label: "UTC", value: "UTC" },
  { label: "Tokyo (JP)", value: "Asia/Tokyo" },
  { label: "London (UK)", value: "Europe/London" },
  { label: "New York (US)", value: "America/New_York" },
];

interface LiveClockProps {
  className?: string;
  showSelector?: boolean;
}

export function LiveClock({ className, showSelector = true }: LiveClockProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [timezone, setTimezone] = useState("Asia/Manila");

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="h-14 w-48 bg-muted animate-pulse rounded-2xl" />;

  const formattedTime = time.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={cn("flex flex-col md:flex-row items-center gap-4 p-3 rounded-2xl shadow-inner border transition-all bg-background text-foreground", className)}>
      <div className="flex items-center gap-3">
        <div className="bg-secondary p-2 rounded-xl shadow-lg animate-pulse shrink-0">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tabular-nums tracking-tighter drop-shadow-sm leading-none mb-1">
            {formattedTime}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest leading-none opacity-70">
            {formattedDate}
          </span>
        </div>
      </div>

      {showSelector && (
        <div className="flex items-center gap-2 border-l border-current/10 pl-4 ml-2 hidden lg:flex">
          <Globe className="h-3 w-3 opacity-50" />
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-7 border-none bg-transparent text-[10px] font-black uppercase hover:text-secondary p-0 focus:ring-0 w-[110px] shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-2xl">
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value} className="text-[10px] font-bold uppercase">
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
