"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Sparkles
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

interface GuestViewProps {
  onBack: () => void;
  onLogin: () => void;
}

export function GuestView({ onBack, onLogin }: GuestViewProps) {
  const coverImage = PlaceHolderImages.find(img => img.id === 'neu-cover');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const currentOccupancy = 42;
  const maxCapacity = 150;
  const occupancyPercentage = (currentOccupancy / maxCapacity) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden neu-mesh-gradient animate-in fade-in duration-1000">
      <div className="neu-bg-overlay" />
      <div className="fixed top-[-5%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-blob pointer-events-none z-0" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] animate-blob delay-2000 pointer-events-none z-0" />

      <header className="relative z-[70] p-4 bg-primary text-white sticky top-0 shadow-2xl border-b border-white/10 backdrop-blur-xl bg-primary/95 h-[60px] flex items-center">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 w-full">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white/70 hover:text-white hover:bg-white/10 font-black text-[11px] uppercase tracking-widest px-5 rounded-2xl"
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              Return
            </Button>
            
            <div className="flex items-center gap-4 border-l border-white/20 pl-4">
              <div className="relative w-9 h-9 bg-white rounded-xl p-2 shadow-2xl">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain" data-ai-hint="university logo" />
              </div>
              <div className="flex flex-col -space-y-0.5 hidden xs:flex">
                <h1 className="text-sm font-black tracking-tighter italic uppercase leading-none">NEU HUB</h1>
                <span className="text-[8px] font-black text-secondary tracking-[0.3em] uppercase opacity-80">Guest Portal</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="neuSecondary" 
            size="sm" 
            onClick={onLogin}
            className="h-10 px-8 rounded-[1.25rem] font-black text-[11px] uppercase shadow-2xl hover:scale-105 transition-all"
          >
            <LogIn className="h-4.5 w-4.5 mr-3" />
            Join Hub
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-12 animate-in slide-in-from-left-8 duration-1000">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-3xl text-primary border border-white/50 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-xl ring-1 ring-white/50">
                 <Sparkles className="h-5 w-5 text-secondary" />
                 Open Academic Environment
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-primary tracking-[-0.03em] leading-[0.9] uppercase">
                Academic <br />
                <span className="text-secondary italic">Research Hub.</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl leading-relaxed italic opacity-90">
                Welcome to the official visitor gateway. Explore institutional research facilities, live telemetry, and academic protocols.
              </p>
            </div>

            <Card className="neu-card-shadow border-none rounded-[3rem] bg-white overflow-hidden shadow-3xl group border border-white/50 relative">
              <div className="aspect-[21/9] relative overflow-hidden">
                <Image 
                  src={coverImage?.imageUrl || ""} 
                  alt="NEU Campus" 
                  fill 
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-[4000ms] ease-out"
                  data-ai-hint="university cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 text-white space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-secondary" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-80">Quezon City • Main Campus</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">Center for Advancement</h3>
                </div>
              </div>
              <CardContent className="p-10 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 bg-white/80 backdrop-blur-2xl">
                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="bg-primary/5 p-4 rounded-2xl shadow-inner border border-primary/10">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-[11px] tracking-[0.4em] opacity-60 italic">Live Occupancy</h4>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-end">
                      <span className="text-5xl md:text-6xl font-black text-primary tracking-tighter">
                        {currentOccupancy} 
                        <span className="text-2xl font-bold text-muted-foreground ml-3 opacity-40">/ {maxCapacity}</span>
                      </span>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20 shadow-sm">
                        {Math.round(occupancyPercentage)}% Scope
                      </span>
                    </div>
                    <div className="relative h-5 bg-muted rounded-full overflow-hidden shadow-inner border border-white p-1">
                        <div 
                          className="absolute h-full bg-secondary transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)]" 
                          style={{ width: `${occupancyPercentage}%` }}
                        />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="bg-primary/5 p-4 rounded-2xl shadow-inner border border-primary/10">
                      <Clock className="h-7 w-7 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-[11px] tracking-[0.4em] opacity-60 italic">Telemetry Window</h4>
                  </div>
                  <div className="space-y-4">
                      <div className="flex items-center gap-4 text-green-600 font-black">
                        <div className="h-3 w-3 rounded-full bg-green-600 animate-pulse shadow-[0_0_15px_rgba(22,163,74,0.5)] border-2 border-white" />
                        <span className="uppercase tracking-[0.3em] text-base italic">Syncing Access Logs</span>
                      </div>
                      <p className="text-lg font-medium text-muted-foreground leading-relaxed italic">
                        Monday - Friday: <strong className="text-primary font-black">08:00 - 17:00</strong>
                      </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-6 duration-1000">
              <Card className="neu-card-shadow border-none rounded-[3rem] bg-white/70 backdrop-blur-3xl p-10 space-y-8 border border-white/50 group hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center gap-5 text-primary">
                  <ShieldCheck className="h-8 w-8 text-secondary" />
                  <h4 className="font-black uppercase text-sm tracking-[0.3em] italic">Access Protocols</h4>
                </div>
                <ul className="space-y-5">
                  {['Valid Institutional ID Required', 'Google Workspace Authentication', 'Quiet Study Environment', 'No Food or Drinks Allowed'].map((rule, i) => (
                    <li key={i} className="flex items-center gap-5 text-base font-bold text-muted-foreground italic group-hover:translate-x-2 transition-transform duration-500">
                      <div className="h-2.5 w-2.5 rounded-full bg-secondary shadow-xl shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </Card>
              
              <Card className="neu-card-shadow border-none rounded-[3rem] bg-white/70 backdrop-blur-3xl p-10 space-y-8 border border-white/50 group hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center gap-5 text-primary">
                  <BookOpen className="h-8 w-8 text-secondary" />
                  <h4 className="font-black uppercase text-sm tracking-[0.3em] italic">Core Resources</h4>
                </div>
                <ul className="space-y-5">
                  {['Global Digital Databases', 'Unified Workspace Access', 'Specialized Research Labs', 'High-Speed Academic Hub'].map((service, i) => (
                    <li key={i} className="flex items-center gap-5 text-base font-bold text-muted-foreground italic group-hover:translate-x-2 transition-transform duration-500">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-xl shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-10 lg:sticky lg:top-28 animate-in slide-in-from-right-8 duration-1000">
            <Card className="neu-card-shadow border-none rounded-[3rem] bg-primary text-white p-10 space-y-10 shadow-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="space-y-5 relative z-10">
                <h3 className="text-4xl font-black leading-none italic uppercase tracking-tighter">Enter Hub.</h3>
                <p className="text-white/70 text-base font-medium leading-relaxed italic">Sign in with institutional credentials to synchronize your presence and access resources.</p>
              </div>
              <Button 
                onClick={onLogin}
                variant="neuSecondary"
                className="w-full h-20 bg-secondary text-primary font-black text-xl rounded-[1.5rem] shadow-3xl transition-all hover:scale-[1.03] active:scale-95 group"
              >
                Access Portal
                <LogIn className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Card>

            <Card className="neu-card-shadow border-none rounded-[3rem] bg-white/80 backdrop-blur-3xl p-10 space-y-10 border border-white/50">
              <div className="flex items-center gap-4 text-primary">
                <Info className="h-6 w-6 text-secondary" />
                <h4 className="font-black uppercase text-[10px] tracking-[0.5em] opacity-60 italic">Institutional Desk</h4>
              </div>
              <div className="space-y-8">
                <div className="flex items-center gap-5 group cursor-pointer">
                  <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary transition-all duration-500 shadow-inner">
                    <Phone className="h-6 w-6 text-primary group-hover:text-white transition-all" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-1">Voice Support</p>
                    <p className="font-black text-primary text-base italic tracking-tight">+63 (2) 8-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 group cursor-pointer">
                  <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary transition-all duration-500 shadow-inner">
                    <Mail className="h-6 w-6 text-primary group-hover:text-white transition-all" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-1">Email Inquiry</p>
                    <p className="font-black text-primary text-base italic tracking-tight">library@neu.edu.ph</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-8 border-2 border-dashed border-primary/10 rounded-[3rem] text-center space-y-4 bg-primary/5">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] opacity-60">System Notice</p>
              <p className="text-[12px] font-bold text-primary/70 italic leading-relaxed">
                Guest mode is strictly observational. Physical entry requires authenticated attendance logging for all visitors.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="relative z-10 p-12 text-center text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.6em] bg-white/40 backdrop-blur-3xl border-t mt-auto">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB • COLLEGE OF ENGINEERING & ARCHITECTURE</p>
      </footer>
    </div>
  );
}