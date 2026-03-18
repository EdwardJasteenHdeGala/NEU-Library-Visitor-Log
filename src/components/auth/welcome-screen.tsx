"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Library, ArrowRight, ShieldCheck, GraduationCap, Sparkles } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
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

  return (
    <div className="min-h-screen flex flex-col relative bg-background overflow-hidden neu-mesh-gradient">
      <div className="neu-bg-overlay" />
      
      {/* Dynamic Amorphous Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-blob delay-5000" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-blob delay-2000" />

      <div className="absolute inset-0 bg-dot-pattern" />
      
      <header className="relative z-[70] p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-4 text-primary group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/50 group-hover:scale-110 transition-transform duration-500">
            <Image 
              src={logoImage?.imageUrl || ""} 
              alt="NEU Logo" 
              width={48} 
              height={48} 
              priority
              className="object-contain"
              data-ai-hint="university logo"
            />
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className="font-black text-3xl md:text-4xl tracking-tighter uppercase italic leading-none text-primary">NEU</span>
            <span className="text-[10px] md:text-[11px] font-black text-secondary uppercase tracking-[0.5em] opacity-90">Access Hub</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-primary/80 font-black text-[11px] uppercase tracking-[0.5em]">
          <Dialog>
            <DialogTrigger asChild>
              <button className="hover:text-primary transition-all underline-offset-[12px] hover:underline decoration-secondary decoration-2 decoration-dotted">Protocols</button>
            </DialogTrigger>
            <DialogContent className="rounded-[3rem] max-w-2xl border-none shadow-3xl bg-white/98 backdrop-blur-3xl p-12">
              <DialogHeader>
                <DialogTitle className="text-4xl font-black text-primary italic uppercase tracking-tighter flex items-center gap-5">
                  <ShieldCheck className="h-10 w-10 text-secondary" />
                  Governance
                </DialogTitle>
                <DialogDescription className="text-lg font-medium opacity-70">Regulatory framework for the New Era University Library Hub.</DialogDescription>
              </DialogHeader>
              <div className="space-y-8 py-8">
                <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-4">
                  <h4 className="font-black text-primary text-base uppercase flex items-center gap-4">
                    <span className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center text-xs font-bold shadow-lg">01</span>
                    Mandatory Logs
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">Every visitor must officially synchronize their entry via the Access Hub portal. Failure to log may result in formal reporting to relevant units.</p>
                </div>
                <div className="p-8 bg-secondary/5 rounded-[2.5rem] border border-secondary/10 space-y-4">
                  <h4 className="font-black text-primary text-base uppercase flex items-center gap-4">
                    <span className="h-10 w-10 rounded-2xl bg-secondary text-primary flex items-center justify-center text-xs font-bold shadow-lg">02</span>
                    Verification
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">Institutional members must present valid ID cards upon request. External guests must remain within authorized inquiry zones.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="neu" size="lg" onClick={onLogin} className="rounded-2xl h-12 px-8 shadow-xl hover:scale-105 transition-all duration-500 font-black uppercase tracking-widest text-[10px]">
            Institutional Login
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="max-w-6xl w-full space-y-16">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-2xl text-primary border border-white/50 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-4 shadow-xl ring-1 ring-white/50">
               <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
               Institutional Excellence Since 1975
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-primary leading-[0.9] tracking-[-0.05em] drop-shadow-2xl">
              ADVANCING <br />
              <span className="text-secondary italic">FUTURE.</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed opacity-90 px-4">
              Welcome to the New Era University Library Portal. Streamline your academic journey with automated access and real-time research synchronization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Button 
              size="lg" 
              variant="neu"
              onClick={onLogin}
              className="w-full sm:w-auto group flex gap-6 h-16 md:h-20 px-12 md:px-16 text-xl md:text-2xl rounded-[1.5rem] shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              Portal Access
              <ArrowRight className="h-6 w-6 group-hover:translate-x-3 transition-transform duration-500" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onGuest}
              className="w-full sm:w-auto border-2 border-white/60 bg-white/40 backdrop-blur-3xl text-primary hover:bg-white h-16 md:h-20 px-12 md:px-16 text-xl md:text-2xl rounded-[1.5rem] shadow-xl hover:scale-105 transition-all duration-500"
            >
              Guest Inquiry
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 md:gap-24 pt-16 md:pt-24 opacity-70 animate-in fade-in duration-1000 delay-700 max-w-4xl mx-auto">
             {[
               { icon: GraduationCap, label: "Scholarship" },
               { icon: Library, label: "Research" },
               { icon: ShieldCheck, label: "Integrity" }
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center gap-6 group cursor-default">
                  <div className="p-6 md:p-8 rounded-[2rem] bg-white/90 backdrop-blur-2xl shadow-xl border border-white/50 group-hover:scale-110 group-hover:bg-white transition-all duration-500">
                    <item.icon className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                  </div>
                  <span className="text-[10px] md:text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-10 text-center text-primary/40 text-[10px] font-black uppercase tracking-[0.6em] animate-in fade-in duration-1000 delay-1000">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB • COLLEGE OF ENGINEERING & ARCHITECTURE</p>
      </footer>
    </div>
  );
}