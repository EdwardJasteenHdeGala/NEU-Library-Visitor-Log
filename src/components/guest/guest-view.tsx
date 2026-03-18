
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
  AlertCircle,
  ShieldAlert,
  Activity,
  Megaphone,
  AlertTriangle,
  DoorOpen,
  DoorClosed
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useLibraryStatus } from "@/hooks/use-library-status";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { format } from "date-fns";

interface GuestViewProps {
  onBack: () => void;
  onLogin: () => void;
}

export function GuestView({ onBack, onLogin }: GuestViewProps) {
  const coverImage = PlaceHolderImages.find(img => img.id === 'neu-cover');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
  const { isOpen, label, nextEvent, isManual, reason, category, updatedAt } = useLibraryStatus();
  const firestore = useFirestore();

  // Real-time occupancy tracking for Guests
  const activeVisitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'visits'), where('exitTimestamp', '==', null));
  }, [firestore]);

  const { data: activeVisits } = useCollection(activeVisitsQuery);

  const currentOccupancy = isOpen ? (activeVisits?.length || 0) : 0;
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
              <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12 bg-white">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary/60" />
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Live Population Telemetry</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className={cn("text-5xl font-bold tracking-tighter italic", isOpen && currentOccupancy > 0 ? "text-green-600" : "text-primary")}>
                        {currentOccupancy} 
                        <span className="text-2xl font-medium text-slate-300 ml-3">/ {maxCapacity}</span>
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                        {isOpen ? Math.round(occupancyPercentage) : 0}% Utilized
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border shadow-inner">
                        <div 
                          className={cn("h-full transition-all duration-1000 ease-in-out", isOpen ? (currentOccupancy > 0 ? "bg-green-500" : "bg-primary") : "bg-slate-300")}
                          style={{ width: `${isOpen ? occupancyPercentage : 0}%` }}
                        />
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest italic text-right">
                       Capacity Limit: 150 Individuals
                    </p>
                  </div>
                </div>
                
                <div className="space-y-8 border-l md:pl-12 border-slate-100">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary/60" />
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Operational Protocol</h4>
                  </div>
                  <div className="space-y-4">
                    <div className={cn("flex items-center gap-3 font-bold text-sm uppercase tracking-widest px-5 py-3 rounded-lg border", isOpen ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100")}>
                      <div className={cn("h-2.5 w-2.5 rounded-full", isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                      {label}
                    </div>
                    <div className="space-y-1 px-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Next Scheduled Shift</p>
                      <p className="text-sm font-bold text-slate-800 uppercase italic">{nextEvent}</p>
                    </div>
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
            <Card className={cn("shadow-2xl p-10 space-y-8 transition-all duration-700 rounded-xl border-none text-white", 
              isOpen ? "bg-primary" : 
              isManual ? (
                category === 'emergency' ? "bg-red-600" :
                category === 'institutional' ? "bg-amber-600" :
                "bg-blue-600"
              ) : "bg-slate-800"
            )}>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-bold tracking-tighter uppercase italic">
                    {isOpen ? "Portal Active" : 
                     isManual ? (
                       category === 'emergency' ? "Emergency Alert" :
                       category === 'institutional' ? "Academic Suspension" :
                       "Notice of Closure"
                     ) : "Access Restricted"}
                  </h3>
                  <div className="h-1 w-12 bg-secondary/80 rounded-full" />
                </div>
                
                <div className="text-base font-medium leading-relaxed opacity-90">
                  {isOpen ? (
                    "Authenticated institutional members may now proceed with attendance logging and facility access."
                  ) : isManual ? (
                    <div className="space-y-6">
                      {reason ? (
                        <div className="space-y-4">
                          <p className="font-bold italic bg-white/10 p-6 rounded-lg border border-white/20 shadow-inner">“{reason}”</p>
                          {updatedAt && (
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                              <Clock className="h-3 w-3" />
                              Last Update: {format(updatedAt.toDate(), 'MMM dd, h:mm a')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>Access is temporarily restricted for administrative reasons. Please check back later.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p>Institutional access logging is currently offline. Facility availability is dictated by the academic schedule.</p>
                      <p className="font-bold text-secondary uppercase tracking-widest">{nextEvent}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {isOpen ? (
                <Button 
                  onClick={onLogin}
                  variant="secondary"
                  className="w-full h-14 font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-2xl active:scale-95 transition-all"
                >
                  Enter Portal Gateway
                  <LogIn className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className={cn("p-6 rounded-xl flex items-center gap-4 border shadow-inner", isManual ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10")}>
                  {isManual ? (
                    category === 'emergency' ? <AlertTriangle className="h-6 w-6 text-white" /> :
                    category === 'institutional' ? <ShieldAlert className="h-6 w-6 text-white" /> :
                    <Megaphone className="h-6 w-6 text-white" />
                  ) : <AlertCircle className="h-6 w-6 text-slate-400" />}
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
                      {isManual ? `${category} Protocol` : "Scheduled Closure"}
                    </span>
                    <p className="text-[9px] font-medium opacity-60">Registry Synchronized</p>
                  </div>
                </div>
              )}
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
