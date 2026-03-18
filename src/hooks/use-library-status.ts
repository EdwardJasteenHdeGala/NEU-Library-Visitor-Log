'use client';

import { useState, useEffect, useMemo } from 'react';

export type LibraryStatus = 'Open (Automatic)' | 'Closed (Automatic)';

interface Schedule {
  open: string; // HH:mm (24h)
  close: string; // HH:mm (24h)
}

const WEEKDAY_SCHEDULE: Schedule = { open: '08:00', close: '17:00' };

export function useLibraryStatus() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30000); // Check every 30s
    return () => clearInterval(timer);
  }, []);

  const status = useMemo(() => {
    if (!now) return { isOpen: false, label: 'Closed (Automatic)' as LibraryStatus, nextEvent: '' };

    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    
    if (isWeekend) {
      return { 
        isOpen: false, 
        label: 'Closed (Automatic)' as LibraryStatus, 
        nextEvent: 'Opens Monday at 08:00 AM' 
      };
    }

    const [openH, openM] = WEEKDAY_SCHEDULE.open.split(':').map(Number);
    const [closeH, closeM] = WEEKDAY_SCHEDULE.close.split(':').map(Number);

    const openTime = new Date(now);
    openTime.setHours(openH, openM, 0, 0);

    const closeTime = new Date(now);
    closeTime.setHours(closeH, closeM, 0, 0);

    if (now < openTime) {
      return { 
        isOpen: false, 
        label: 'Closed (Automatic)' as LibraryStatus, 
        nextEvent: `Opens today at ${openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
      };
    }

    if (now >= closeTime) {
      return { 
        isOpen: false, 
        label: 'Closed (Automatic)' as LibraryStatus, 
        nextEvent: 'Opens tomorrow at 08:00 AM' 
      };
    }

    return { 
      isOpen: true, 
      label: 'Open (Automatic)' as LibraryStatus, 
      nextEvent: `Closes at ${closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
    };
  }, [now]);

  return status;
}
