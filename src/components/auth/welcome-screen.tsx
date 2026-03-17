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
      {/* Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-blob delay-2000" />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl animate-blob delay-1000" />

      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      
      <header className="relative z-10 p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-4 text-primary group cursor-pointer">
          <div className="bg-white p-2 rounded-2xl shadow-xl border border-primary/5 group-hover:scale-105 transition-transform">
            <Image 
              src={logoImage?.imageUrl || ""} 
              alt="NEU Logo" 
              width={44} 
              height={44} 
              className="object-contain"
            />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-black text-2xl tracking-tighter uppercase italic leading-none">NEU</span>
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] opacity-90">Access Hub</span>
          </div>
        </div>

        <div className="hidden lg:flex gap-10 text-primary/70 font-black text-[10px] uppercase tracking-[0.3em]">
          <Dialog>
            <DialogTrigger asChild>
              <button className="hover:text-primary transition-colors underline-offset-8 hover:underline decoration-secondary decoration-2">Guidelines</button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-primary italic uppercase tracking-tighter flex items-center gap-4">
                  <ShieldCheck className="h-8 w-8 text-secondary" />
                  Institutional Protocols
                </DialogTitle>
                <DialogDescription className="text-base font-medium">Access governance for the New Era University Library Hub.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide">
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-3">
                  <h4 className="font-black text-primary text-sm uppercase flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">1</span>
                    Mandatory Attendance
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">Every visitor must log their entry via the Access Hub portal. Failure to log may result in a formal report to the college department.</p>
                </div>
                <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/10 space-y-3">
                  <h4 className="font-black text-primary text-sm uppercase flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-secondary text-primary flex items-center justify-center text-[10px]">2</span>
                    Identification
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">Students and faculty must present their valid physical RFID ID upon request. External guests must be pre-authorized.</p>
                </div>
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-3">
                  <h4 className="font-black text-primary text-sm uppercase flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">3</span>
                    Conduct & Integrity
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">Maintain absolute silence. All digital resources must be used for academic purposes only. No food allowed.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button className="hover:text-primary transition-colors underline-offset-8 hover:underline decoration-secondary decoration-2">Research Tools</button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-3xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-primary italic uppercase tracking-tighter flex items-center gap-4">
                  <Book className="h-8 w-8 text-secondary" />
                  Academic Resources
                </DialogTitle>
                <DialogDescription className="text-base font-medium">Integrated digital tools available at NEU.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                {[
                  { title: "Digital Library", desc: "Access over 50,000+ e-journals and institutional research papers." },
                  { title: "Thesis Archive", desc: "Digital repository for CICS, CEA, and other college capstone projects." },
                  { title: "Computer Lab", desc: "Dedicated workstations for research, CAD, and software development." },
                  { title: "Study Zones", desc: "Reserved areas for group collaborations and quiet individual study." }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-muted/50 rounded-[2rem] border-2 border-transparent hover:border-secondary transition-all group">
                    <h4 className="font-black text-primary text-sm uppercase mb-3 group-hover:text-secondary transition-colors">{item.title}</h4>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="neu" size="sm" onClick={onLogin} className="rounded-xl h-9 px-6 shadow-xl hover:scale-105 transition-transform">
            Secure Sign In
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-5xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-secondary/10 text-primary border border-secondary/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-sm animate-bounce duration-[3000ms]">
               <Sparkles className="h-4 w-4 text-secondary" />
               Institutional Excellence Since 1975
            </div>
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black text-primary leading-[0.8] tracking-tighter drop-shadow-2xl">
              ADVANCING <br className="hidden sm:block" />
              <span className="text-secondary italic">EXCELLENCE.</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed italic">
              Welcome to the New Era University Library Portal. Streamline your academic journey with automated access and real-time research synchronization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Button 
              size="xl" 
              variant="neu"
              onClick={onLogin}
              className="w-full sm:w-auto group flex gap-4 h-20 px-16 text-xl rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Access Portal
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={onGuest}
              className="w-full sm:w-auto border-2 border-primary/10 bg-white/50 backdrop-blur-md text-primary hover:bg-white h-20 px-16 text-xl rounded-[2rem] shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Guest Inquiry
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 md:gap-20 pt-12 md:pt-20">
             {[
               { icon: GraduationCap, label: "Scholarship" },
               { icon: Library, label: "Research" },
               { icon: ShieldCheck, label: "Integrity" }
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center gap-4 group cursor-default">
                  <div className="p-4 rounded-3xl bg-white shadow-xl border border-primary/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <item.icon className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                  </div>
                  <span className="text-[10px] md:text-xs font-black text-primary/40 uppercase tracking-[0.4em]">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-10 text-center text-primary/30 text-[10px] font-black uppercase tracking-[0.5em] animate-in fade-in duration-1000 delay-500">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB • COLLEGE OF ENGINEERING & ARCHITECTURE</p>
      </footer>
    </div>
  );
}