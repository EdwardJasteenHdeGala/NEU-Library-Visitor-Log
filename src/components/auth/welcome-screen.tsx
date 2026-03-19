"use client";

import { Button } from "@/components/ui/button";
import { Library, ArrowRight, ShieldCheck, GraduationCap, Info, MapPin, Clock } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useLibraryStatus } from "@/hooks/use-library-status";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WelcomeScreenProps {
  onLogin: () => void;
  onGuest: () => void;
}

export function WelcomeScreen({ onLogin, onGuest }: WelcomeScreenProps) {
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
  const campusImage = PlaceHolderImages.find(img => img.id === 'neu-campus');
  const status = useLibraryStatus();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Institutional Top Bar */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded shadow-sm w-10 h-10 relative overflow-hidden flex items-center justify-center transition-transform hover:scale-110">
             <Image 
                src={logoImage?.imageUrl || ""} 
                alt="NEU Logo" 
                fill
                priority
                className="object-contain p-1"
              />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-black text-xl tracking-tighter text-primary italic uppercase">NEU Access Hub</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Library Portal</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", status.isOpen ? "bg-green-500 animate-pulse" : "bg-amber-500")} />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{status.label}</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all active:scale-95">Registry Protocols</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2rem] border-none shadow-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter text-primary">
                  <ShieldCheck className="h-8 w-8 text-secondary" />
                  Institutional Protocols
                </DialogTitle>
                <DialogDescription className="font-medium text-lg italic">Access and facility guidelines.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="p-6 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 space-y-3 transition-colors hover:bg-primary/10">
                  <h4 className="font-black text-sm uppercase tracking-tight text-primary">Mandatory Attendance Logging</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">All visitors must officially register their entry via the Access Hub portal. Records are synchronized with the university's institutional audit registry.</p>
                </div>
                <div className="p-6 bg-secondary/5 rounded-2xl border-2 border-dashed border-secondary/20 space-y-3 transition-colors hover:bg-secondary/10">
                  <h4 className="font-black text-sm uppercase tracking-tight text-primary">Identity Synchronization</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">Institutional members must provide valid ID details. Guests are permitted access within designated academic zones only.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={onLogin} size="sm" className="font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg h-10 px-6 transition-all hover:scale-105 active:scale-95">Institutional Gateway</Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[70vh] flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={campusImage?.imageUrl || ""} 
              alt="NEU Campus" 
              fill
              className="object-cover"
              priority
              data-ai-hint="university campus"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-white" />
          </div>

          <div className="relative z-10 max-w-4xl px-6 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:bg-white/20">
                <Info className="h-4 w-4 text-secondary" />
                Official Portal of New Era University
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.9] drop-shadow-2xl">
                Library <br /> 
                <span className="text-secondary">Access Hub</span>
              </h1>
              <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium italic drop-shadow-lg">
                Advancing scholarship through automated registry synchronization and real-time resource tracking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Button 
                size="xl" 
                onClick={onLogin}
                className="w-full sm:w-auto h-20 px-14 text-xl font-black gap-4 rounded-[1.5rem] shadow-3xl bg-primary text-white hover:bg-primary/90 transition-all group active:scale-95"
              >
                ACCESS PORTAL
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={onGuest}
                className="w-full sm:w-auto h-20 px-14 text-xl font-black border-2 border-secondary text-secondary bg-white/40 backdrop-blur-md hover:bg-secondary hover:text-primary rounded-[1.5rem] shadow-xl transition-all active:scale-95"
              >
                GUEST INQUIRY
              </Button>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-24 px-6 bg-white relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { 
                  icon: GraduationCap, 
                  title: "Scholarship", 
                  desc: "Dedicated workspaces for academic excellence and intensive study protocols." 
                },
                { 
                  icon: Library, 
                  title: "Research", 
                  desc: "Seamless access to digital archives and physical media collections." 
                },
                { 
                  icon: ShieldCheck, 
                  title: "Integrity", 
                  desc: "Institutional registry logging to ensure facility safety and audit compliance." 
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-6 p-10 rounded-[2.5rem] bg-slate-50 border-2 border-transparent hover:border-primary/10 transition-all group">
                  <div className="p-6 rounded-3xl bg-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <item.icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-primary uppercase italic tracking-tighter">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-24 p-12 bg-primary rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-dot-pattern opacity-10" />
              <div className="space-y-3 relative z-10 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 text-secondary font-black uppercase text-[10px] tracking-[0.4em]">
                  <Clock className="h-4 w-4" /> Registry Announcement
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter transition-all group-hover:translate-x-1">{status.label}</h3>
                <p className="text-white/70 font-medium italic">{status.nextEvent}</p>
              </div>
              <div className="flex items-center gap-6 relative z-10 transition-transform group-hover:scale-110">
                <div className="hidden lg:flex flex-col items-end leading-none">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Campus Location</span>
                  <span className="text-lg font-black italic">Quezon City Main</span>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
                  <MapPin className="h-8 w-8 text-secondary" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-10 text-center border-t bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] italic opacity-60">
            © {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB • COLLEGE OF INFORMATICS & COMPUTING SCIENCES
          </p>
          <div className="flex items-center gap-6">
             <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest hover:text-primary transition-colors cursor-default">Scholarship</span>
             <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest hover:text-primary transition-colors cursor-default">Research</span>
             <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest hover:text-primary transition-colors cursor-default">Integrity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
