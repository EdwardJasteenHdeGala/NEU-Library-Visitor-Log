import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 mb-10 shadow-xl relative">
        <div className="absolute -top-4 -right-4 h-12 w-12 bg-secondary rounded-full flex items-center justify-center font-black text-primary text-xs shadow-lg">404</div>
        <Search className="h-20 w-20 text-primary opacity-20" />
      </div>
      
      <div className="max-w-md space-y-4 mb-12">
        <h2 className="text-5xl font-black text-primary italic uppercase tracking-tighter leading-none">Access Point Not Found</h2>
        <p className="text-muted-foreground font-medium text-xl italic leading-relaxed">
          The requested institutional endpoint is currently unavailable or has been relocated within the registry.
        </p>
      </div>

      <Button asChild className="h-18 px-12 rounded-3xl font-black uppercase text-lg tracking-widest bg-primary hover:bg-primary/95 text-white shadow-3xl gap-4 group">
        <Link href="/">
          <Home className="h-6 w-6 text-secondary group-hover:-translate-y-1 transition-transform" /> 
          Return to Portal
        </Link>
      </Button>
      
      <p className="mt-16 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-40">
        Institutional Error: E_REGISTRY_MISS_404
      </p>
    </div>
  )
}
