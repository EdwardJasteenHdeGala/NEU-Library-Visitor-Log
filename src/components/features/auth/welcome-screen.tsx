"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, UserCheck, Clock, Globe, Info, Bell } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useLibraryStatus } from "@/hooks/use-library-status";
import { cn, getAcademicYear } from "@/lib/utils";
import { UnifiedLayout } from "@/components/shared/unified-layout";
import { LiveClock } from "@/components/ui/live-clock";
import { useEffect, useState } from "react";

interface WelcomeScreenProps {
  onLogin: () => void;
  onGuest: () => void;
}

export function WelcomeScreen({ onLogin, onGuest }: WelcomeScreenProps) {
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
  const status = useLibraryStatus();
  const [academicYear, setAcademicYear] = useState("");

  useEffect(() => {
    setAcademicYear(getAcademicYear());
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Hub Header Section - Mirrored from InstitutionalHub */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-primary/5">
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-3 bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20">
            <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Gateway Authorized</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary leading-none">
            NEU <br /> <span className="text-secondary text-glow-secondary">Access Hub</span>
          </h1>
        </div>

        <div className="flex items-center gap-6 bg-primary/5 p-6 rounded-[2rem] border border-primary/10 shadow-inner">
          <LiveClock className="!bg-transparent !border-none !text-primary !p-0 scale-110" showSelector={false} />
          <div className="h-10 w-px bg-primary/10" />
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-3 w-3 rounded-full",
              status.isOpen ? "bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.4)]" : "bg-rose-400"
            )} />
            <div className="flex flex-col items-start leading-none gap-1">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Portal State</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{status.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Gateway Content - Three Column Mirror */}
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="p-8 bg-primary/[0.02] rounded-[2.5rem] border border-primary/5 shadow-inner">
             <Card className="border-none bg-background/60 backdrop-blur-2xl rounded-[2rem] shadow-premium overflow-hidden group">
                <CardHeader className="border-b border-primary/5 bg-primary/[0.02] py-8">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-2xl">
                         <ShieldCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                         <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-primary italic">Authentication Protocol</CardTitle>
                         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Registry Entry Control</p>
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-12 space-y-12">
                   <div className="flex flex-col items-center text-center space-y-6">
                      <div className="bg-white p-3 rounded-2xl shadow-premium-sm w-16 h-16 relative overflow-hidden flex items-center justify-center border border-primary/10 transform transition-transform group-hover:scale-105">
                         {logoImage?.imageUrl && (
                           <Image 
                              src={logoImage.imageUrl} 
                              alt="NEU Logo" 
                              fill
                              sizes="64px"
                              className="object-contain p-2"
                            />
                         )}
                      </div>
                      <div className="max-w-md mx-auto">
                         <h2 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Identity Verification Required</h2>
                         <p className="text-[11px] font-medium text-muted-foreground italic mt-3 leading-relaxed">
                            Access restricted to authorized university personnel and registered institutional guests. 
                            Please select your verification protocol to synchronize with the regional attendance telemetry.
                         </p>
                      </div>
                   </div>

                   <div className="grid sm:grid-cols-2 gap-6 pt-4">
                      <Button 
                        onClick={onLogin}
                        className="h-20 bg-primary hover:bg-primary/90 text-white rounded-2xl border-none shadow-premium transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 group/auth"
                      >
                        <UserCheck className="h-6 w-6 text-secondary group-hover/auth:rotate-12 transition-transform" />
                        <div className="flex flex-col items-start leading-none">
                          <span className="text-[11px] font-black uppercase tracking-widest">Authenticate</span>
                          <span className="text-[8px] font-medium opacity-50 lowercase">Institutional ID</span>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-50 group-hover/auth:translate-x-1 transition-transform" />
                      </Button>

                      <Button 
                        onClick={onGuest}
                        variant="outline"
                        className="h-20 rounded-2xl border-primary/10 bg-white/50 backdrop-blur-xl hover:bg-white/80 text-primary shadow-premium transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 group/guest"
                      >
                        <Globe className="h-6 w-6 text-secondary group-hover/guest:translate-y-[-2px] transition-transform" />
                        <div className="flex flex-col items-start leading-none text-left">
                          <span className="text-[11px] font-black uppercase tracking-widest">Guest Entry</span>
                          <span className="text-[8px] font-medium opacity-50 lowercase italic">Temporary Registry</span>
                        </div>
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <Card className="p-8 border-none rounded-[2rem] bg-background/40 backdrop-blur-xl shadow-premium space-y-6">
            <div className="flex items-center gap-4 border-b border-primary/5 pb-4">
              <div className="p-2 bg-secondary/10 rounded-xl">
                <Globe className="h-5 w-5 text-secondary" />
              </div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary">Institutional Policy</h4>
            </div>
            <p className="text-xs font-bold italic leading-relaxed text-muted-foreground">
              Registry synchronization is mandatory. Your logs are archived for institutional oversight and audit compliance.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Secure Protocol Active</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/5">
                <Info className="h-4 w-4 text-secondary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">AY {academicYear} Registry</span>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-none rounded-[2rem] bg-[#032e41] text-white shadow-premium space-y-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <Bell className="h-5 w-5 text-secondary animate-pulse" />
              <h4 className="font-black text-[10px] uppercase tracking-widest">Protocol Reminder</h4>
            </div>
            <p className="text-[11px] font-medium leading-relaxed opacity-70 italic relative z-10">
              Please maintain authorized ID synchronization at all times while within institutional premises.
            </p>
            <div className="pt-4 border-t border-white/10 mt-4 relative z-10 opactiy-30">
               <p className="text-[8px] font-black uppercase tracking-[0.3em] italic">
                 HUB Gateway v3.0 • CIC Control
               </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
