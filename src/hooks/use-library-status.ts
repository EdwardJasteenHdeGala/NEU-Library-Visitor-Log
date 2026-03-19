'use client';

import { useState, useEffect, useMemo } from 'react';

export type LibraryNoticeStatus = 
  | 'Registry Active' 
  | 'After Hours Notice' 
  | 'Institutional Advisory';

export type AnnouncementCategory = 'general' | 'emergency' | 'institutional';

interface Schedule {
  open: string; // HH:mm (24h)
  close: string; // HH:mm (24h)
}

const WEEKDAY_SCHEDULE: Schedule = { open: '08:00', close: '17:00' };

/**
 * useLibraryStatus provides real-time informational status updates for the library.
 * This is an advisory notice and does not restrict access to the portal itself.
 */
export function useLibraryStatus() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const status = useMemo(() => {
    if (!now) {
      return { 
        isOpen: true, 
        label: 'Synchronizing...' as LibraryNoticeStatus, 
        nextEvent: 'Updating institutional registry...',
        category: 'general' as AnnouncementCategory
      };
    }

    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    
    if (isWeekend) {
      return { 
        isOpen: false, 
        label: 'After Hours Notice' as LibraryNoticeStatus, 
        nextEvent: 'Standard registry synchronization resumes Monday at 08:00 AM',
        category: 'general' as AnnouncementCategory
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
        label: 'After Hours Notice' as LibraryNoticeStatus, 
        nextEvent: `Registry logging resumes at ${openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        category: 'general' as AnnouncementCategory
      };
    }

    if (now >= closeTime) {
      return { 
        isOpen: false, 
        label: 'After Hours Notice' as LibraryNoticeStatus, 
        nextEvent: 'Standard registry resumes tomorrow at 08:00 AM',
        category: 'general' as AnnouncementCategory
      };
    }

    return { 
      isOpen: true, 
      label: 'Registry Active' as LibraryNoticeStatus, 
      nextEvent: `Institutional logging active until ${closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      category: 'general' as AnnouncementCategory
    };
  }, [now]);

  return status;
}