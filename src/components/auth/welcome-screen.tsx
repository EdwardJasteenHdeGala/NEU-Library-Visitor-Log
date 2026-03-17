"use client";

import { Button } from "@/components/ui/button";
import { Library, ArrowRight } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface WelcomeScreenProps {
  onLogin: () => void;
}

export function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  const bgImage = PlaceHolderImages.find(img => img.id === 'library-interior');

  return (
    <div 
      className="min-h-screen flex flex-col relative bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage?.imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <div className="bg-primary p-1.5 rounded-lg">
            <Library className="h-6 w-6 text-white" />
          </div>
          <span className="tracking-tight">NEU Library Visitor Log</span>
        </div>
        <div className="hidden md:flex gap-8 text-white/80 font-medium">
          <button className="hover:text-white transition-colors">Home</button>
          <button className="hover:text-white transition-colors">Visitor Log</button>
          <button className="hover:text-white transition-colors">Reports</button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1]">
            Welcome to the <br />
            <span className="text-secondary">NEU Library Visitor Log</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto">
            This system allows students, faculty, and staff to log visits, provide feedback, and access library services digitally.
          </p>
          <Button 
            size="lg" 
            onClick={onLogin}
            className="h-16 px-10 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 group"
          >
            Go to Login
            <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>

      <footer className="relative z-10 p-8 text-center text-white/60 text-sm">
        <p>© {new Date().getFullYear()} New Era University. All rights reserved.</p>
      </footer>
    </div>
  );
}