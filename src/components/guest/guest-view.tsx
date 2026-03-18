"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Info, 
  ShieldCheck, 
  MapPin, 
  BookOpen,
  Phone,
  Mail,
  LogIn,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useLibraryStatus } from "@/hooks/use-library-status";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

interface GuestViewProps {
  onBack: () => void;
  onLogin: () => void;
}

export function GuestView({ onBack, onLogin }: GuestViewProps) {
  const coverImage = PlaceHolderImages.find(img => img.id === 'neu-cover');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
  const { isOpen, label, nextEvent } = useLibraryStatus();
  const firestore = useFirestore();

  const activeVisitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'visits'), where('exitTimestamp', '==', null));
  }, [firestore]);

  const { data: activeVisits } = useCollection(activeVisitsQuery);

  const currentOccupancy = activeVisits?.length || 0;
  const maxCapacity = 150;
  const occupancyPercentage = (currentOccupancy / maxCapacity) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="neu-header">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 w-full">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white hover:bg-white/10 font-bold text-xs uppercase"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return
            </Button>
            
            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              <div className="relative w-8 h-8 bg-white rounded p-1">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain" />
              </div>
              <div className="flex flex-col leading-none hidden sm:flex">
                <h1 className="text-xs font-bold text-white uppercase tracking-tight">Access Hub</h1>
                <span className="text-[7px] font-bold text-secondary tracking-widest uppercase">Guest Portal</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onLogin}
            className="h-9 px-6 font-bold text-[10px] uppercase tracking-widest"
          >
            Institutional Portal
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                 Information Gateway
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
                Academic Resource Center
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Welcome to the official visitor information portal of New Era University. Access facility telemetry, operational guidelines, and institutional research protocols.
              </p>
            </div>

            <Card className="shadow-sm border-border overflow-hidden">
              <div className="aspect-[21/9] relative">
                <Image 
                  src={coverImage?.imageUrl || ""} 
                  alt="NEU Campus" 
                  fill 
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-6 left-8 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-secondary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Quezon City Main Campus</span>
                  </div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight">Institutional Research Hub</h3>
                </div>
              </div>
              <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500">Live Facility Usage</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-4xl font-bold text-primary tracking-tight">
                        {isOpen ? currentOccupancy : 0} 
                        <span className="text-xl font-medium text-slate-300 ml-2">/ {maxCapacity}</span>
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {isOpen ? Math.round(occupancyPercentage) : 0}% Utilization
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border">
                        <div 
                          className={cn("h-full transition-all duration-1000 ease-in-out", isOpen ? "bg-primary" : "bg-slate-300")}
                          style={{ width: `${isOpen ? occupancyPercentage : 0}%` }}
                        />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500">Facility Status</h4>
                  </div>
                  <div className="space-y-2">
                    <div className={cn("flex items-center gap-2 font-bold text-xs uppercase tracking-widest", isOpen ? "text-green-600" : "text-red-600")}>
                      <div className={cn("h-2 w-2 rounded-full", isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                      {label}
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                      {nextEvent}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                  <h4 className="font-bold uppercase text-xs tracking-widest">General Protocols</h4>
                </div>
                <ul className="space-y-3">
                  {['Institutional ID Required', 'Google Workspace Auth', 'Academic Quiet Zone', 'No Food or Beverages'].map((rule, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/30 shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </Card>
              
              <Card className="shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <BookOpen className="h-5 w-5" />
                  <h4 className="font-bold uppercase text-xs tracking-widest">Academic Resources</h4>
                </div>
                <ul className="space-y-3">
                  {['Digital Archives', 'Unified Workspace', 'Research Stations', 'High-Speed Infrastructure'].map((service, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary/50 shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <Card className={cn("shadow-md p-8 space-y-6 transition-colors duration-500", isOpen ? "bg-primary text-white" : "bg-slate-200 text-slate-700")}>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight uppercase">
                  {isOpen ? "Portal Access" : "Access Denied"}
                </h3>
                <p className={cn("text-sm font-medium leading-relaxed", isOpen ? "text-white/70" : "text-slate-500")}>
                  {isOpen 
                    ? "Please sign in with your institutional credentials to log attendance and access facilities." 
                    : `The library is currently closed. ${nextEvent}`}
                </p>
              </div>
              {isOpen ? (
                <Button 
                  onClick={onLogin}
                  variant="secondary"
                  className="w-full h-12 font-bold text-xs uppercase tracking-widest"
                >
                  Sign In to Portal
                  <LogIn className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className="p-4 bg-white/50 rounded-lg flex items-center gap-3 border border-slate-300">
                  <AlertCircle className="h-5 w-5 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 italic">Automated Shutdown Active</span>
                </div>
              )}
            </Card>

            <Card className="shadow-sm p-8 space-y-8">
              <div className="flex items-center gap-3 text-primary">
                <Info className="h-5 w-5 text-slate-400" />
                <h4 className="font-bold uppercase text-[10px] tracking-widest opacity-60">Help Desk</h4>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <Phone className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Voice Line</p>
                    <p className="font-bold text-slate-700 text-sm tracking-tight">+63 (2) 8-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Email Support</p>
                    <p className="font-bold text-slate-700 text-sm tracking-tight">library@neu.edu.ph</p>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-t bg-white">
        <p>© {new Date().getFullYear()} New Era University • Institutional Access Hub</p>
      </footer>
    </div>
  );
}
