'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

export type LibraryNoticeStatus =
  | 'Registry Active'
  | 'After Hours Notice'
  | 'Institutional Advisory'
  | 'Closing Imminent';

export type AnnouncementCategory = 'general' | 'emergency' | 'institutional' | 'warning';

interface Schedule {
  open: string; // HH:mm (24h)
  close: string; // HH:mm (24h)
}

const DEFAULT_SCHEDULE: Schedule = { open: '08:00', close: '17:00' };

/**
 * useLibraryStatus provides real-time informational status updates for the library.
 * Now synchronizes with Firestore system configuration for dynamic institutional policies.
 */
export function useLibraryStatus() {
  const { firestore } = useFirebase();
  const [now, setNow] = useState<Date | null>(null);

  // Return type interface for clarity
  interface LibraryStatus {
    isOpen: boolean;
    label: LibraryNoticeStatus;
    nextEvent: string;
    category: AnnouncementCategory;
    closingTimeFormatted?: string;
    timeRemaining?: {
      hours: number;
      minutes: number;
      totalMinutes: number;
    };
  }

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const configRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'system_config', 'library');
  }, [firestore]);

  const { data: config } = useDoc(configRef);

  const schedule = useMemo((): Schedule => {
    if (!config) return DEFAULT_SCHEDULE;
    return { 
      open: config.openingTime || DEFAULT_SCHEDULE.open, 
      close: config.closingTime || DEFAULT_SCHEDULE.close 
    };
  }, [config]);

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

    const [openH, openM] = schedule.open.split(':').map(Number);
    const [closeH, closeM] = schedule.close.split(':').map(Number);

    const openTime = new Date(now);
    openTime.setHours(openH, openM, 0, 0);

    const closeTime = new Date(now);
    closeTime.setHours(closeH, closeM, 0, 0);

    // Warning period (30 minutes before closing)
    const warningTime = new Date(closeTime);
    warningTime.setMinutes(warningTime.getMinutes() - 30);

    const diffMs = closeTime.getTime() - now.getTime();
    const totalMinutesRemaining = Math.max(0, Math.floor(diffMs / 60000));
    const hoursRemaining = Math.floor(totalMinutesRemaining / 60);
    const minutesRemaining = totalMinutesRemaining % 60;
    
    const closingTimeFormatted = closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (now < openTime) {
      return {
        isOpen: false,
        label: 'After Hours Notice' as LibraryNoticeStatus,
        nextEvent: `Registry logging resumes at ${openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        category: 'general' as AnnouncementCategory,
        closingTimeFormatted
      };
    }

    if (now >= closeTime) {
      return {
        isOpen: false,
        label: 'After Hours Notice' as LibraryNoticeStatus,
        nextEvent: 'Standard registry resumes tomorrow at 08:00 AM',
        category: 'general' as AnnouncementCategory,
        closingTimeFormatted
      };
    }

    if (now >= warningTime) {
      return {
        isOpen: true,
        label: 'Closing Imminent' as LibraryNoticeStatus,
        nextEvent: `Library closing in ${totalMinutesRemaining} minutes. Ensure ID-OUT.`,
        category: 'warning' as AnnouncementCategory,
        closingTimeFormatted,
        timeRemaining: {
          hours: hoursRemaining,
          minutes: minutesRemaining,
          totalMinutes: totalMinutesRemaining
        }
      };
    }

    return {
      isOpen: true,
      label: 'Registry Active' as LibraryNoticeStatus,
      nextEvent: `Institutional logging active until ${closingTimeFormatted}`,
      category: 'general' as AnnouncementCategory,
      closingTimeFormatted,
      timeRemaining: {
        hours: hoursRemaining,
        minutes: minutesRemaining,
        totalMinutes: totalMinutesRemaining
      }
    };
  }, [now, schedule]);

  return status;
}