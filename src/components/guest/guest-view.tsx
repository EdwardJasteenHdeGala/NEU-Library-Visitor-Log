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
import { Progress } from "@/components/ui/progress";

interface GuestViewProps {
  onBack: () => void;
  onLogin: () => void;
}

export function GuestView({ onBack, onLogin }: GuestViewProps) {
  const libraryImage = PlaceHolderImages.find(img => img.id === 'library-interior');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const currentOccupancy = 42;
  const maxCapacity = 150;
  const occupancyPercentage = (currentOccupancy / maxCapacity) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden neu-mesh-gradient animate-in fade-in duration-1000">
      {/* Institutional Background Overlay */}
      <div className="neu-bg-overlay" />

      {/* Decorative Blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px] animate-blob pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-secondary/15 rounded-full blur-[120px] animate-blob delay-2000 pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />

      <header className="relative z-50 p-6 bg-primary text-white sticky top-0 shadow-3xl backdrop-blur-md bg-primary/95 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white/70 hover:text-white hover:bg-white/10 font-black text-[12px] uppercase h-11 px-8 rounded-2xl transition-all"
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              Return
            </Button>
            <div className="h-10 w-px bg-white/20 mx-4 hidden sm:block" />
            <div className="flex items-center gap-4 group cursor-pointer" onClick={onBack}>
              <div className="relative w-11 h-11 bg-white rounded-xl p-2 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain" />
              </div>
              <div className="flex flex-col -space-y-1 hidden xs:flex">
                <h1 className="text-2xl font-black tracking-tighter italic uppercase leading-none">GUEST HUB</h1>
                <span className="text-[9px] font-black text-secondary tracking-[0.4em] uppercase">Academic Inquiry</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:block text-[11px] font-black uppercase tracking-[0.4em] text-secondary bg-secondary/10 px-6 py-2.5 rounded-full border border-secondary/20 shadow-xl animate-pulse">
                Public Inquiry Mode
            </div>
            <Button 
                variant="neuSecondary" 
                size="lg" 
                onClick={onLogin}
                className="bg-secondary text-primary font-black text-[12px] uppercase hover:bg-white h-12 px-10 rounded-2xl shadow-[0_20px_40px_-10px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95"
            >
                <LogIn className="h-5 w-5 mr-3" />
                Secure Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 lg:p-16 space-y-16 md:space-y-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-start">
          <div className="lg:col-span-8 space-y-16 md:space-y-24 animate-in slide-in-from-left-12 duration-1000">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-md text-primary border border-white/60 px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.4em] shadow-xl mb-4">
                 <Sparkles className="h-5 w-5 text-secondary" />
                 Open to the Academic Community
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-primary tracking-tighter leading-[0.85] uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                NEU Academic <br />
                <span className="text-secondary italic">Research Hub.</span>
              </h1>
              <p className="text-xl md:text-3xl text-muted-foreground font-medium max-w-3xl leading-relaxed italic opacity-90">
                Our institutional facilities are architected for excellence. Explore real-time availability and academic protocols below.
              </p>
            </div>

            <Card className="neu-card-shadow border-none rounded-[4rem] bg-white overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] group">
              <div className="aspect-[21/9] relative overflow-hidden">
                <Image 
                  src={libraryImage?.imageUrl || ""} 
                  alt="Library Interior" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-[4000ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 text-white space-y-4">
                  <div className="flex items-center gap-4">
                    <MapPin className="h-6 w-6 text-secondary animate-bounce" />
                    <span className="text-sm md:text-base font-black uppercase tracking-[0.4em] opacity-90">Main Campus • Quezon City</span>
                  </div>
                  <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic drop-shadow-2xl">Center for Academic Advancement</h3>
                </div>
              </div>
              <CardContent className="p-12 md:p-20 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                <div className="space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="bg-primary/5 p-5 rounded-[2rem] shadow-inner border border-primary/10">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-sm tracking-[0.4em] italic opacity-70">Current Load</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-5xl md:text-7xl font-black text-primary tracking-tighter">
                        {currentOccupancy} 
                        <span className="text-2xl font-bold text-muted-foreground ml-4 italic">/ {maxCapacity}</span>
                      </span>
                      <span className="text-xs md:text-sm font-black text-primary uppercase tracking-widest bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20">{Math.round(occupancyPercentage)}% OCCUPIED</span>
                    </div>
                    <div className="relative h-6 md:h-8 bg-muted rounded-full overflow-hidden shadow-inner border-2 border-white">
                        <div 
                          className="absolute h-full bg-secondary transition-all duration-[2500ms] ease-in-out rounded-full shadow-[0_0_20px_rgba(251,191,36,0.6)]" 
                          style={{ width: `${occupancyPercentage}%` }}
                        />
                    </div>
                  </div>
                </div>
                <div className="space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="bg-primary/5 p-5 rounded-[2rem] shadow-inner border border-primary/10">
                      <Clock className="h-10 w-10 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-sm tracking-[0.4em] italic opacity-70">Operations</h4>
                  </div>
                  <div className="space-y-5">
                      <div className="flex items-center gap-5 text-green-600 font-black">
                        <div className="h-5 w-5 rounded-full bg-green-600 animate-pulse shadow-[0_0_20px_rgba(22,163,74,0.6)]" />
                        <span className="uppercase tracking-[0.3em] text-xl md:text-2xl italic">Open for Academic Use</span>
                      </div>
                      <p className="text-lg md:text-xl font-medium text-muted-foreground italic leading-relaxed">Institutional Support Hours: <br /> <strong className="text-primary">08:00 AM - 05:00 PM</strong></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 animate-in slide-in-from-bottom-12 duration-1000 delay-300">
              <Card className="neu-card-shadow border-none rounded-[4rem] bg-white/70 backdrop-blur-3xl p-12 md:p-16 space-y-10 relative overflow-hidden group border border-white/50">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all duration-700">
                    <ShieldCheck className="h-40 w-40 text-primary" />
                </div>
                <div className="flex items-center gap-6 text-primary">
                  <ShieldCheck className="h-10 w-10 text-secondary" />
                  <h4 className="font-black uppercase text-base md:text-lg tracking-[0.4em] italic">Access Protocols</h4>
                </div>
                <ul className="space-y-6 relative z-10">
                  {['Valid Institutional ID Required', 'Google Workspace Authentication', 'Absolute Research Silence', 'Strict No-Consumption Policy'].map((rule, i) => (
                    <li key={i} className="flex items-center gap-6 text-lg md:text-xl font-bold text-muted-foreground/90 italic hover:translate-x-2 transition-transform duration-500">
                      <div className="h-4 w-4 rounded-full bg-secondary shadow-[0_0_12px_rgba(251,191,36,0.7)] shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="neu-card-shadow border-none rounded-[4rem] bg-white/70 backdrop-blur-3xl p-12 md:p-16 space-y-10 relative overflow-hidden group border border-white/50">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all duration-700">
                    <BookOpen className="h-40 w-40 text-primary" />
                </div>
                <div className="flex items-center gap-6 text-primary">
                  <BookOpen className="h-10 w-10 text-secondary" />
                  <h4 className="font-black uppercase text-base md:text-lg tracking-[0.4em] italic">Core Provisions</h4>
                </div>
                <ul className="space-y-6 relative z-10">
                  {['Global Digital Repositories', 'Unified Learning Workspace', 'CICS/CEA Specialized Labs', 'High-Speed Academic Mesh'].map((service, i) => (
                    <li key={i} className="flex items-center gap-6 text-lg md:text-xl font-bold text-muted-foreground/90 italic hover:translate-x-2 transition-transform duration-500">
                      <div className="h-4 w-4 rounded-full bg-primary shadow-[0_0_12px_rgba(0,77,38,0.4)] shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <aside className="space-y-16 md:space-y-20 lg:sticky lg:top-40 animate-in slide-in-from-right-12 duration-1000 delay-500">
            <Card className="neu-card-shadow border-none rounded-[4rem] bg-primary text-white p-14 md:p-16 space-y-12 shadow-[0_40px_100px_-20px_rgba(0,77,38,0.5)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="space-y-6 relative z-10">
                <h3 className="text-4xl md:text-5xl font-black leading-tight italic uppercase tracking-tighter">Enter the Hub.</h3>
                <p className="text-white/70 text-xl md:text-2xl font-medium leading-relaxed italic">Sign in to securely log your presence and access institutional services.</p>
              </div>
              <Button 
                onClick={onLogin}
                size="xl"
                className="w-full h-24 bg-secondary hover:bg-white text-primary font-black text-2xl rounded-[2.5rem] shadow-3xl transition-all hover:scale-105 active:scale-95 group duration-500"
              >
                Access Portal
                <LogIn className="h-8 w-8 ml-4 group-hover:translate-x-3 transition-transform duration-500" />
              </Button>
            </Card>

            <Card className="neu-card-shadow border-none rounded-[4rem] bg-white/80 backdrop-blur-3xl p-14 md:p-16 space-y-12 border border-white/50">
              <div className="flex items-center gap-5 text-primary">
                <Info className="h-8 w-8 text-secondary" />
                <h4 className="font-black uppercase text-xs tracking-[0.5em] italic opacity-70">Inquiry Desk</h4>
              </div>
              <div className="space-y-10">
                <div className="flex items-center gap-8 group cursor-pointer">
                  <div className="bg-primary/5 p-5 rounded-[2rem] group-hover:bg-primary transition-all duration-500 shadow-inner">
                    <Phone className="h-6 w-6 md:h-8 md:w-8 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.5em] mb-1">VOICE</p>
                    <p className="font-black text-primary text-xl md:text-2xl italic tracking-tight">+63 (2) 8-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 group cursor-pointer">
                  <div className="bg-primary/5 p-5 rounded-[2rem] group-hover:bg-primary transition-all duration-500 shadow-inner">
                    <Mail className="h-6 w-6 md:h-8 md:w-8 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.5em] mb-1">ELECTRONIC</p>
                    <p className="font-black text-primary text-xl md:text-2xl italic tracking-tight">library@neu.edu.ph</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-12 border-4 border-dashed border-primary/10 rounded-[4rem] text-center space-y-5 bg-primary/5 animate-pulse">
              <p className="text-[12px] font-black text-primary uppercase tracking-[0.8em]">OFFICIAL NOTICE</p>
              <p className="text-sm md:text-base font-bold text-primary/60 italic leading-relaxed">
                Guest mode is strictly observational. Physical entry requires authenticated attendance logging for all visitors.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="relative z-10 p-16 text-center text-muted-foreground/30 text-[11px] font-black uppercase tracking-[0.8em] bg-white/40 backdrop-blur-md border-t mt-auto">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • EXCELLENCE • DISCIPLINE</p>
      </footer>
    </div>
  );
}