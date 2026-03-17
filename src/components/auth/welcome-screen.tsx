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
      {/* Institutional Background Overlay */}
      <div className="neu-bg-overlay" />
      
      {/* Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-blob delay-2000" />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-blob delay-1000" />

      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      
      <header className="relative z-10 p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-top-6 duration-1000">
        <div className="flex items-center gap-4 text-primary group cursor-pointer">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50 group-hover:scale-105 transition-transform duration-500">
            <Image 
              src={logoImage?.imageUrl || ""} 
              alt="NEU Logo" 
              width={48} 
              height={48} 
              className="object-contain"
            />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-black text-2xl md:text-3xl tracking-tighter uppercase italic leading-none">NEU</span>
            <span className="text-[10px] md:text-[11px] font-black text-secondary uppercase tracking-[0.4em] opacity-90">Access Hub</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-10 text-primary/70 font-black text-[11px] uppercase tracking-[0.3em]">
          <Dialog>
            <DialogTrigger asChild>
              <button className="hover:text-primary transition-all underline-offset-8 hover:underline decoration-secondary decoration-2 hover:translate-y-[-1px]">Guidelines</button>
            </DialogTrigger>
            <DialogContent className="rounded-[3rem] max-w-2xl border-none shadow-3xl bg-white/95 backdrop-blur-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-primary italic uppercase tracking-tighter flex items-center gap-4">
                  <ShieldCheck className="h-8 w-8 text-secondary" />
                  Institutional Protocols
                </DialogTitle>
                <DialogDescription className="text-base font-medium">Access governance for the New Era University Library Hub.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6 max-h-[60vh] overflow-y-auto pr-4">
                <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-3 hover:bg-primary/10 transition-colors">
                  <h4 className="font-black text-primary text-sm uppercase flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    Mandatory Attendance
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">Every visitor must log their entry via the Access Hub portal. Failure to log may result in a formal report to the college department.</p>
                </div>
                <div className="p-8 bg-secondary/5 rounded-[2rem] border border-secondary/10 space-y-3 hover:bg-secondary/10 transition-colors">
                  <h4 className="font-black text-primary text-sm uppercase flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-secondary text-primary flex items-center justify-center text-[10px] font-bold">2</span>
                    Identification
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">Students and faculty must present their valid physical RFID ID upon request. External guests must be pre-authorized.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <button className="hover:text-primary transition-all underline-offset-8 hover:underline decoration-secondary decoration-2 hover:translate-y-[-1px]">Research Tools</button>

          <Button variant="neu" size="lg" onClick={onLogin} className="rounded-2xl h-12 px-8 shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Secure Sign In
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-6xl w-full space-y-16 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-200">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-4 bg-white/50 backdrop-blur-md text-primary border border-white/50 px-8 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] mb-4 shadow-xl animate-bounce duration-[4000ms]">
               <Sparkles className="h-5 w-5 text-secondary" />
               Institutional Excellence Since 1975
            </div>
            <h1 className="text-7xl sm:text-9xl md:text-[10rem] lg:text-[13rem] font-black text-primary leading-[0.75] tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              ADVANCING <br className="hidden sm:block" />
              <span className="text-secondary italic">EXCELLENCE.</span>
            </h1>
            <p className="text-xl md:text-3xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed italic opacity-90">
              Welcome to the New Era University Library Portal. Streamline your academic journey with automated access and real-time research synchronization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
            <Button 
              size="xl" 
              variant="neu"
              onClick={onLogin}
              className="w-full sm:w-auto group flex gap-6 h-24 px-20 text-2xl rounded-[2.5rem] shadow-[0_32px_80px_-16px_rgba(0,77,38,0.3)] hover:scale-105 active:scale-95 transition-all duration-500"
            >
              Access Portal
              <ArrowRight className="h-7 w-7 group-hover:translate-x-3 transition-transform duration-500" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={onGuest}
              className="w-full sm:w-auto border-2 border-white/50 bg-white/40 backdrop-blur-xl text-primary hover:bg-white h-24 px-20 text-2xl rounded-[2.5rem] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500"
            >
              Guest Inquiry
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-12 md:gap-32 pt-16 md:pt-24 opacity-60">
             {[
               { icon: GraduationCap, label: "Scholarship" },
               { icon: Library, label: "Research" },
               { icon: ShieldCheck, label: "Integrity" }
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center gap-6 group cursor-default">
                  <div className="p-5 rounded-[2rem] bg-white/80 backdrop-blur-md shadow-2xl border border-white/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <item.icon className="h-10 w-10 md:h-14 md:w-14 text-primary" />
                  </div>
                  <span className="text-[11px] md:text-xs font-black text-primary uppercase tracking-[0.5em]">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-12 text-center text-primary/40 text-[11px] font-black uppercase tracking-[0.6em] animate-in fade-in duration-1000 delay-700">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB • COLLEGE OF ENGINEERING & ARCHITECTURE</p>
      </footer>
    </div>
  );
}