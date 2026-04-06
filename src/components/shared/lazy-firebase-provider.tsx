'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Toaster } from "@/components/ui/toaster";

const FirebaseClientProviderDynamic = dynamic(
  () => import('@/firebase/client-provider').then((m) => m.FirebaseClientProvider),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h1 className="text-emerald-500 font-bold text-xl tracking-tight animate-pulse uppercase">NEU ACCESS HUB</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Initializing secure connection...</p>
      </div>
    ),
  }
);

export function LazyFirebaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProviderDynamic>
      {children}
      <Toaster />
    </FirebaseClientProviderDynamic>
  );
}
