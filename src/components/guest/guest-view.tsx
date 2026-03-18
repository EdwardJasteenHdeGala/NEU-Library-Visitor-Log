
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Users, 
  Info, 
  ShieldCheck, 
  MapPin, 
  BookOpen,
  Phone,
  Mail,
  LogIn,
  AlertCircle,
  Activity,
  Megaphone
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

interface GuestViewProps {
  onBack: () => void;
  onLogin: () => void;
}

export function GuestView({ onBack, onLogin }: GuestViewProps) {
  const coverImage = PlaceHolderImages.find(img => img.id === 'neu-cover');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
  const firestore = useFirestore();

  // Real-time occupancy tracking for Guests
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
              className="text-white hover:bg-white/10 font-bold text-xs uppercase px-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return
            </Button>
            
            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              <div className="relative w-8 h-8 bg-white rounded p-1 shadow-sm">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain" />
              </div>
              <div className="flex flex-col leading-none hidden sm:flex">
                <h1 className="text-xs font-bold text-white uppercase tracking-tight">Access Hub</h1>
                <span className="text-[7px] font-bold text-secondary tracking-widest uppercase">Institutional Info</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onLogin}
            className="h-9 px-6 font-bold text-[10px] uppercase tracking-widest shadow-md"
          >
            Institutional Portal
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 space-y-12 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                 <Info className="h-3 w-3" /> Information Gateway
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight leading-none italic">
                Library Resource Center
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl font-medium">
                Welcome to the official visitor information portal. Access real-time facility telemetry, institutional protocols, and academic resource guidelines.
              </p>
            </div>

            <Card className="shadow-2xl border-none overflow-hidden rounded-xl">
              <div className="aspect-[21/9] relative">
                <Image 
                  src={coverImage?.imageUrl || ""} 
                  alt="NEU Campus" 
                  fill 
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
                <div className="absolute bottom-8 left-10 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-secondary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Quezon City Main Campus</span>
                  </div>
                  <h3 className="text-3xl font-bold uppercase tracking-tighter italic">Institutional Hub</h3>
                </div>
              </div>
              <CardContent className="p-10 bg-white">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary/60" />
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Live Population Telemetry</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-5xl font-bold tracking-tighter italic text-primary">
                        {currentOccupancy} 
                        <span className="text-2xl font-medium text-slate-300 ml-3">/ {maxCapacity}</span>
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                        {Math.round(occupancyPercentage)}% Utilized
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border shadow-inner">
                        <div 
                          className="h-full bg-primary transition-all duration-1000 ease-in-out"
                          style={{ width: `${occupancyPercentage}%` }}
                        />
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest italic text-right">
                       Capacity Limit: 150 Individuals
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="shadow-sm p-8 space-y-6 rounded-xl border-slate-100 bg-white">
                <div className="flex items-center gap-4 text-primary">
                  <div className="p-3 bg-primary/5 rounded-xl border">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold uppercase text-[10px] tracking-widest">Facility Guidelines</h4>
                </div>
                <ul className="space-y-4">
                  {[
                    { text: 'Institutional ID Required', icon: Info },
                    { text: 'Digital Registry Entry', icon: Activity },
                    { text: 'Academic Silence Protocol', icon: Megaphone },
                    { text: 'No Outside Food Permitted', icon: AlertCircle }
                  ].map((rule, i) => (
                    <li key={i} className="flex items-start gap-4 text-sm font-medium text-muted-foreground">
                      <rule.icon className="h-4 w-4 text-primary/40 shrink-0 mt-0.5" />
                      {rule.text}
                    </li>
                  ))}
                </ul>
              </Card>
              
              <Card className="shadow-sm p-8 space-y-6 rounded-xl border-slate-100 bg-white">
                <div className="flex items-center gap-4 text-primary">
                  <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold uppercase text-[10px] tracking-widest">Academic Services</h4>
                </div>
                <ul className="space-y-4">
                  {['Digital Thesis Archive', 'Collaborative Workspaces', 'Advanced Research Stations', 'Institutional Reprographics'].map((service, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-secondary/60 shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-10 lg:sticky lg:top-24">
            <Card className="shadow-2xl p-10 space-y-8 rounded-xl border-none text-white bg-primary">
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-bold tracking-tighter uppercase italic">Portal Active</h3>
                  <div className="h-1 w-12 bg-secondary/80 rounded-full" />
                </div>
                <div className="text-base font-medium leading-relaxed opacity-90">
                  Authenticated institutional members may now proceed with attendance logging and facility access.
                </div>
              </div>
              <Button 
                onClick={onLogin}
                variant="secondary"
                className="w-full h-14 font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-2xl active:scale-95 transition-all"
              >
                Enter Portal Gateway
                <LogIn className="h-4 w-4 ml-2" />
              </Button>
            </Card>

            <Card className="shadow-sm p-10 space-y-10 rounded-xl border-slate-100 bg-white">
              <div className="flex items-center gap-3 text-primary/40 border-b pb-4">
                <Info className="h-5 w-5" />
                <h4 className="font-bold uppercase text-[10px] tracking-widest">Support Gateway</h4>
              </div>
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="bg-slate-50 p-3.5 rounded-xl border shadow-sm">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Voice Support</p>
                    <p className="font-bold text-slate-800 text-base tracking-tight">+63 (2) 8-123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="bg-slate-50 p-3.5 rounded-xl border shadow-sm">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Institutional Email</p>
                    <p className="font-bold text-slate-800 text-base tracking-tight underline">library@neu.edu.ph</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 text-center">
                 <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] italic">
                   New Era University Main Campus
                 </p>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="p-10 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] border-t bg-white opacity-40">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB • COLLEGE OF ENGINEERING & ARCHITECTURE</p>
      </footer>
    </div>
  );
}
