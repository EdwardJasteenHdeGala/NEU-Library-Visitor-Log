
"use client";

import { Button } from "@/components/ui/button";
import { Library, ArrowRight, ShieldCheck, GraduationCap } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

interface WelcomeScreenProps {
  onLogin: () => void;
  onGuest: () => void;
}

export function WelcomeScreen({ onLogin, onGuest }: WelcomeScreenProps) {
  const bgImage = PlaceHolderImages.find(img => img.id === 'neu-campus');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  return (
    <div 
      className="min-h-screen flex flex-col relative bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: `url(${bgImage?.imageUrl})` }}
      data-ai-hint={bgImage?.imageHint}
    >
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-[4px]" />
      
      <header className="relative z-10 p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 text-white">
          <div className="bg-white p-1.5 md:p-2 rounded-xl shadow-lg border border-white/20">
            <Image 
              src={logoImage?.imageUrl || "https://placehold.co/400x400/004d26/ffffff?text=NEU+CEA"} 
              alt="NEU CEA" 
              width={32} 
              height={32} 
              className="object-contain md:w-10 md:h-10"
              data-ai-hint={logoImage?.imageHint}
            />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-black text-lg md:text-xl tracking-tighter uppercase italic">NEU</span>
            <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Access Hub</span>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-white/90 font-bold text-xs uppercase tracking-widest">
          <button className="hover:text-secondary transition-colors underline-offset-8 hover:underline">Guidelines</button>
          <button className="hover:text-secondary transition-colors underline-offset-8 hover:underline">Resources</button>
          <button className="hover:text-secondary transition-colors underline-offset-8 hover:underline">Support</button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl w-full space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary border border-secondary/30 px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 md:mb-4">
               <ShieldCheck className="h-3.5 w-3.5" />
               Institutional Access Secured
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[1.1] md:leading-[0.85] tracking-tighter">
              ADVANCING <br className="hidden sm:block" />
              <span className="text-secondary italic">EXCELLENCE.</span>
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
              Welcome to the New Era University Library Portal. Log your visit, access research materials, and streamline your academic journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <Button 
              size="xl" 
              variant="neuSecondary"
              onClick={onLogin}
              className="w-full sm:w-auto group flex gap-3 h-14 md:h-16 lg:h-20 text-base md:text-lg"
            >
              Access Portal
              <ArrowRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={onGuest}
              className="w-full sm:w-auto border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 h-14 md:h-16 lg:h-20 text-base md:text-lg"
            >
              Guest View
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-12 pt-8 md:pt-16 opacity-40">
             <div className="flex flex-col items-center gap-2 md:gap-3">
                <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-white" />
                <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">Scholarship</span>
             </div>
             <div className="flex flex-col items-center gap-2 md:gap-3">
                <Library className="h-6 w-6 md:h-8 md:w-8 text-white" />
                <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">Research</span>
             </div>
             <div className="flex flex-col items-center gap-2 md:gap-3">
                <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-white" />
                <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">Integrity</span>
             </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-6 md:p-10 text-center text-white/40 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em]">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • COLLEGE OF ENGINEERING & ARCHITECTURE</p>
      </footer>
    </div>
  );
}
