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
      {/* Decorative Blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-blob delay-2000 pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />

      <header className="relative z-50 p-4 bg-primary text-white sticky top-0 shadow-2xl backdrop-blur-md bg-primary/95">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white/70 hover:text-white hover:bg-white/10 font-black text-[11px] uppercase h-10 px-6 rounded-2xl transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return
            </Button>
            <div className="h-8 w-px bg-white/20 mx-2 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-white rounded-xl p-1.5 shadow-lg group-hover:scale-110 transition-transform">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain" />
              </div>
              <h1 className="text-xl font-black tracking-tight italic hidden xs:block uppercase">GUEST HUB</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-[10px] font-black uppercase tracking-[0.3em] text-secondary bg-secondary/10 px-5 py-2 rounded-full border border-secondary/20 shadow-sm animate-pulse">
                Public Inquiry Mode
            </div>
            <Button 
                variant="neuSecondary" 
                size="sm" 
                onClick={onLogin}
                className="bg-secondary text-primary font-black text-[11px] uppercase hover:bg-white h-11 px-8 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
            >
                <LogIn className="h-4 w-4 mr-2" />
                Secure Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 lg:p-16 space-y-12 md:space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-start">
          <div className="lg:col-span-8 space-y-12 md:space-y-20 animate-in slide-in-from-left-8 duration-1000">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-primary/5 text-primary border border-primary/10 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-sm mb-2">
                 <Sparkles className="h-4 w-4 text-secondary" />
                 Open to the Academic Community
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-primary tracking-tighter leading-[0.9] uppercase drop-shadow-sm">
                NEU Academic <br />
                <span className="text-secondary italic">Research Hub.</span>
              </h1>
              <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-3xl leading-relaxed italic">
                Our institutional facilities are architected for excellence. Explore real-time availability and academic protocols below.
              </p>
            </div>

            <Card className="neu-card-shadow border-none rounded-[3.5rem] bg-white overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.12)] group">
              <div className="aspect-[21/9] relative overflow-hidden">
                <Image 
                  src={libraryImage?.imageUrl || ""} 
                  alt="Library Interior" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-[3000ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 text-white space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-secondary animate-bounce" />
                    <span className="text-xs md:text-sm font-black uppercase tracking-[0.3em]">Main Campus • Quezon City</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Center for Academic Advancement</h3>
                </div>
              </div>
              <CardContent className="p-10 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="bg-primary/10 p-4 rounded-2xl shadow-inner">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-sm tracking-[0.3em]">Current Load</h4>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-end">
                      <span className="text-4xl md:text-6xl font-black text-primary tracking-tighter">
                        {currentOccupancy} 
                        <span className="text-xl font-bold text-muted-foreground ml-2">/ {maxCapacity}</span>
                      </span>
                      <span className="text-xs md:text-sm font-black text-primary uppercase tracking-widest">{Math.round(occupancyPercentage)}% OCCUPIED</span>
                    </div>
                    <div className="relative h-5 md:h-6 bg-muted rounded-full overflow-hidden shadow-inner border-2 border-white">
                        <div 
                          className="absolute h-full bg-secondary transition-all duration-[2000ms] ease-out rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]" 
                          style={{ width: `${occupancyPercentage}%` }}
                        />
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="bg-primary/10 p-4 rounded-2xl shadow-inner">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-sm tracking-[0.3em]">Operations</h4>
                  </div>
                  <div className="space-y-4">
                      <div className="flex items-center gap-4 text-green-600 font-black">
                        <div className="h-4 w-4 rounded-full bg-green-600 animate-pulse shadow-[0_0_15px_rgba(22,163,74,0.5)]" />
                        <span className="uppercase tracking-[0.2em] text-lg md:text-xl italic">Open for Academic Use</span>
                      </div>
                      <p className="text-base font-medium text-muted-foreground italic">Institutional Support: 08:00 AM - 05:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Card className="neu-card-shadow border-none rounded-[3rem] bg-white/70 backdrop-blur-xl p-10 md:p-14 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="h-32 w-32 text-primary" />
                </div>
                <div className="flex items-center gap-5 text-primary">
                  <ShieldCheck className="h-8 w-8" />
                  <h4 className="font-black uppercase text-sm md:text-base tracking-[0.3em] italic">Access Protocols</h4>
                </div>
                <ul className="space-y-5 relative z-10">
                  {['Valid Institutional ID Required', 'Google Workspace Authentication', 'Absolute Research Silence', 'Strict No-Consumption Policy'].map((rule, i) => (
                    <li key={i} className="flex items-center gap-5 text-base md:text-lg font-bold text-muted-foreground/80 italic">
                      <div className="h-3 w-3 rounded-full bg-secondary shadow-[0_0_8px_rgba(251,191,36,0.6)] shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="neu-card-shadow border-none rounded-[3rem] bg-white/70 backdrop-blur-xl p-10 md:p-14 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                    <BookOpen className="h-32 w-32 text-primary" />
                </div>
                <div className="flex items-center gap-5 text-primary">
                  <BookOpen className="h-8 w-8" />
                  <h4 className="font-black uppercase text-sm md:text-base tracking-[0.3em] italic">Core Provisions</h4>
                </div>
                <ul className="space-y-5 relative z-10">
                  {['Global Digital Repositories', 'Unified Learning Workspace', 'CICS/CEA Specialized Labs', 'High-Speed Academic Mesh'].map((service, i) => (
                    <li key={i} className="flex items-center gap-5 text-base md:text-lg font-bold text-muted-foreground/80 italic">
                      <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_8px_rgba(0,77,38,0.3)] shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <aside className="space-y-12 md:space-y-16 lg:sticky lg:top-32 animate-in slide-in-from-right-8 duration-1000 delay-500">
            <Card className="neu-card-shadow border-none rounded-[3.5rem] bg-primary text-white p-12 md:p-14 space-y-10 shadow-[0_32px_80px_-20px_rgba(0,77,38,0.4)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="space-y-5 relative z-10">
                <h3 className="text-3xl md:text-4xl font-black leading-none italic uppercase tracking-tighter">Enter the Hub.</h3>
                <p className="text-white/70 text-base md:text-lg font-medium leading-relaxed italic">Sign in to securely log your presence and access institutional services.</p>
              </div>
              <Button 
                onClick={onLogin}
                className="w-full h-20 bg-secondary hover:bg-white text-primary font-black text-xl rounded-3xl shadow-3xl transition-all hover:scale-105 active:scale-95 group"
              >
                Access Portal
                <LogIn className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>

            <Card className="neu-card-shadow border-none rounded-[3.5rem] bg-white/80 backdrop-blur-xl p-12 md:p-14 space-y-10 border border-white/20">
              <div className="flex items-center gap-4 text-primary">
                <Info className="h-6 w-6" />
                <h4 className="font-black uppercase text-xs tracking-[0.4em]">Inquiry Desk</h4>
              </div>
              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary transition-colors duration-500">
                    <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-1">VOICE</p>
                    <p className="font-black text-primary text-base md:text-lg italic tracking-tight">+63 (2) 8-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary transition-colors duration-500">
                    <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-1">ELECTRONIC</p>
                    <p className="font-black text-primary text-base md:text-lg italic tracking-tight">library@neu.edu.ph</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-10 border-4 border-dashed border-primary/10 rounded-[3.5rem] text-center space-y-4 bg-primary/5 animate-pulse">
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.6em]">OFFICIAL NOTICE</p>
              <p className="text-xs md:text-sm font-bold text-primary/60 italic leading-relaxed">
                Guest mode is strictly observational. Physical entry requires authenticated attendance logging.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="relative z-10 p-14 text-center text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.6em] bg-white/50 backdrop-blur-md border-t mt-auto">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • EXCELLENCE • DISCIPLINE</p>
      </footer>
    </div>
  );
}