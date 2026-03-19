'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export type LibraryNoticeStatus = 
  | 'Standard Hours' 
  | 'After Hours' 
  | 'Special Notice' 
  | 'Emergency Announcement';

export type AnnouncementCategory = 'general' | 'emergency' | 'institutional';

interface Schedule {
  open: string; // HH:mm (24h)
  close: string; // HH:mm (24h)
}

const WEEKDAY_SCHEDULE: Schedule = { open: '08:00', close: '17:00' };

export function useLibraryStatus() {
  const [now, setNow] = useState<Date | null>(null);
  const firestore = useFirestore();

  const configRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'library_config', 'main');
  }, [firestore]);

  const { data: config, isLoading: isConfigLoading } = useDoc(configRef);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30000); // Check every 30s
    return () => clearInterval(timer);
  }, []);

  const status = useMemo(() => {
    if (!now || isConfigLoading) {
      return { 
        isOpen: true, 
        label: 'Registry Active' as any, 
        nextEvent: 'Syncing...',
        isManual: false,
        reason: '',
        category: 'general' as AnnouncementCategory,
        updatedAt: null
      };
    }

    // 1. Check for Manual Notice/Override
    if (config && config.mode === 'manual') {
      return {
        isOpen: config.manualStatus === 'open',
        label: (config.manualLabel || 'Special Notice') as LibraryNoticeStatus,
        nextEvent: config.manualReason || 'Operational update in effect',
        isManual: true,
        reason: config.manualReason || '',
        category: (config.manualCategory || 'general') as AnnouncementCategory,
        updatedAt: config.updatedAt
      };
    }

    // 2. Fallback to Automatic Schedule Notices
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    
    if (isWeekend) {
      return { 
        isOpen: false, 
        label: 'After Hours' as LibraryNoticeStatus, 
        nextEvent: 'Standard registry resumes Monday at 08:00 AM',
        isManual: false,
        reason: '',
        category: 'general' as AnnouncementCategory,
        updatedAt: null
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
        label: 'After Hours' as LibraryNoticeStatus, 
        nextEvent: `Standard registry resumes at ${openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        isManual: false,
        reason: '',
        category: 'general' as AnnouncementCategory,
        updatedAt: null
      };
    }

    if (now >= closeTime) {
      return { 
        isOpen: false, 
        label: 'After Hours' as LibraryNoticeStatus, 
        nextEvent: 'Standard registry resumes tomorrow at 08:00 AM',
        isManual: false,
        reason: '',
        category: 'general' as AnnouncementCategory,
        updatedAt: null
      };
    }

    return { 
      isOpen: true, 
      label: 'Standard Hours' as LibraryNoticeStatus, 
      nextEvent: `Registry active until ${closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      isManual: false,
      reason: '',
      category: 'general' as AnnouncementCategory,
      updatedAt: null
    };
  }, [now, config, isConfigLoading]);

  return status;
}