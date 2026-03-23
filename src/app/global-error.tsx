'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { diagnosticsLogger } from '@/lib/diagnostics'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Persistent institutional crash telemetry
    diagnosticsLogger.error(`[FATAL] ${error.message || 'Unknown Global Error'}`, error, 'system');
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center">
        <div className="bg-red-500/10 p-8 rounded-full border-2 border-red-500/20 mb-10 animate-pulse">
            <AlertTriangle className="h-20 w-20 text-red-500" />
        </div>
        
        <div className="max-w-md space-y-4 mb-12">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-red-500">Kernel Panic</h2>
            <p className="text-slate-400 font-medium text-xl italic leading-relaxed">
            A critical failure occurred within the root institutional layout. System integrity must be restored manually.
            </p>
        </div>

        <Button
            onClick={() => reset()}
            className="h-20 px-16 rounded-3xl font-black uppercase text-xl tracking-widest bg-red-600 hover:bg-red-700 text-white shadow-[0_0_50px_rgba(220,38,38,0.3)] gap-6 transition-all active:scale-95 group"
        >
            <RotateCw className="h-8 w-8 text-white group-hover:rotate-180 transition-transform duration-700" /> 
            RESTORE ROOT KERNEL
        </Button>
      </body>
    </html>
  )
}
