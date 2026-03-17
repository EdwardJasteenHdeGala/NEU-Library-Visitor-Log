"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Library, ArrowRight, ShieldCheck, GraduationCap, Info, Book, HelpCircle, X, Sparkles } from "lucide-react";
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
      
      {/* Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[100px] animate-blob delay-2000" />

      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      
      <header className="relative z-10 p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-3 text-primary group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-white/50 group-hover:scale-105 transition-transform duration-300">
            <Image 
              src={logoImage?.imageUrl || ""} 
              alt="NEU Logo" 
              width={40} 
              height={40} 
              priority
              className="object-contain"
            />
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className="font-black text-xl md:text-2xl tracking-tighter uppercase italic leading-none text-primary">NEU</span>
            <span className="text-[8px] md:text-[9px] font-black text-secondary uppercase tracking-[0.3em] opacity-90">Access Hub</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-primary/70 font-black text-[10px] uppercase tracking-[0.3em]">
          <Dialog>
            <DialogTrigger asChild>
              <button className="hover:text-primary transition-all underline-offset-8 hover:underline decoration-secondary decoration-2">Guidelines</button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] max-w-2xl border-none shadow-3xl bg-white/95 backdrop-blur-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-primary italic uppercase tracking-tighter flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-secondary" />
                  Institutional Protocols
                </DialogTitle>
                <DialogDescription className="text-sm font-medium">Access governance for the New Era University Library Hub.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                  <h4 className="font-black text-primary text-xs uppercase flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold">1</span>
                    Mandatory Attendance
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">Every visitor must log their entry via the Access Hub portal. Failure to log may result in a formal report to the college department.</p>
                </div>
                <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10 space-y-2">
                  <h4 className="font-black text-primary text-xs uppercase flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-secondary text-primary flex items-center justify-center text-[9px] font-bold">2</span>
                    Identification
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">Students and faculty must present their valid physical ID card upon request. External guests must be pre-authorized.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="neu" size="sm" onClick={onLogin} className="rounded-xl h-10 px-6 shadow-xl hover:scale-105 transition-all">
            Secure Sign In
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-20">
        <div className="max-w-5xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-md text-primary border border-white/50 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-2 shadow-lg">
               <Sparkles className="h-4 w-4 text-secondary" />
               Institutional Excellence Since 1975
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black text-primary leading-[0.8] tracking-tighter drop-shadow-sm">
              ADVANCING <br className="hidden sm:block" />
              <span className="text-secondary italic">EXCELLENCE.</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed opacity-80 px-4">
              Welcome to the New Era University Library Portal. Streamline your academic journey with automated access and real-time research synchronization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-4">
            <Button 
              size="xl" 
              variant="neu"
              onClick={onLogin}
              className="w-full sm:w-auto group flex gap-4 h-16 md:h-20 px-12 md:px-16 text-lg md:text-xl rounded-2xl shadow-xl hover:scale-105 transition-all duration-300"
            >
              Access Portal
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={onGuest}
              className="w-full sm:w-auto border-2 border-white/50 bg-white/40 backdrop-blur-xl text-primary hover:bg-white h-16 md:h-20 px-12 md:px-16 text-lg md:text-xl rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              Guest Inquiry
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 md:gap-20 pt-10 md:pt-16 opacity-50">
             {[
               { icon: GraduationCap, label: "Scholarship" },
               { icon: Library, label: "Research" },
               { icon: ShieldCheck, label: "Integrity" }
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center gap-4 group cursor-default">
                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-white/50 group-hover:scale-110 transition-all duration-500">
                    <item.icon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em]">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-8 text-center text-primary/30 text-[9px] font-black uppercase tracking-[0.5em] animate-in fade-in duration-1000 delay-500">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB • COLLEGE OF ENGINEERING & ARCHITECTURE</p>
      </footer>
    </div>
  );
}
