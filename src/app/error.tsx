'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { diagnosticsLogger } from '@/lib/diagnostics'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the institutional telemetry failure to the centralized issues system
    diagnosticsLogger.error(error.message || 'System Runtime Error', error, 'system');
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center animate-in fade-in duration-500">
      <div className="bg-destructive/10 p-6 rounded-full border-2 border-destructive/20 mb-8 shadow-inner">
        <AlertCircle className="h-16 w-16 text-destructive" />
      </div>
      
      <div className="max-w-md space-y-4 mb-10">
        <h2 className="text-4xl font-black text-primary italic uppercase tracking-tighter">System Interruption</h2>
        <p className="text-muted-foreground font-medium text-lg italic">
          An unexpected exception occurred within the Identity Hub. The automatic analyzer has logged this telemetry.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => reset()}
          className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/95 text-white shadow-2xl gap-3 transition-all active:scale-95"
        >
          <RefreshCcw className="h-5 w-5" /> Reset Environment
        </Button>
        
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest border-2 gap-3"
        >
          Force Synchronize
        </Button>
      </div>
      
      <p className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">
        Status: E_RUNTIME_EXCEPTION_HUB
      </p>
    </div>
  )
}
