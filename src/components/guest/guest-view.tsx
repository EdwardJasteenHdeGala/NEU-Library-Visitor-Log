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
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden neu-mesh-gradient animate-in fade-in duration-700">
      {/* Background Overlays */}
      <div className="neu-bg-overlay opacity-5" />
      <div className="fixed top-[-5%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[80px] animate-blob pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[80px] animate-blob delay-2000 pointer-events-none" />

      <header className="relative z-[70] p-4 bg-primary text-white sticky top-0 shadow-xl border-b border-white/10 backdrop-blur-xl bg-primary/95 h-[60px] flex items-center">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 w-full">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white/70 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest px-4 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              <div className="relative w-8 h-8 bg-white rounded-lg p-1.5 shadow-lg">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain" />
              </div>
              <div className="flex flex-col -space-y-0.5 hidden xs:flex">
                <h1 className="text-sm font-black tracking-tighter italic uppercase leading-none">NEU HUB</h1>
                <span className="text-[7px] font-black text-secondary tracking-widest uppercase opacity-80">Guest Portal</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="neuSecondary" 
            size="sm" 
            onClick={onLogin}
            className="h-9 px-6 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Portal Access
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10 animate-in slide-in-from-left-6 duration-700">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md text-primary border border-white/60 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-sm">
                 <Sparkles className="h-3.5 w-3.5 text-secondary" />
                 Open Academic Environment
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight uppercase">
                Academic <br />
                <span className="text-secondary italic">Research Hub.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Welcome to the official visitor gateway. Explore our institutional research facilities, real-time availability, and academic protocols.
              </p>
            </div>

            <Card className="neu-card-shadow border-none rounded-[2rem] bg-white overflow-hidden shadow-2xl group border border-white/50">
              <div className="aspect-[21/9] relative overflow-hidden">
                <Image 
                  src={coverImage?.imageUrl || ""} 
                  alt="NEU Campus" 
                  fill 
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-[3000ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
                <div className="absolute bottom-6 left-8 right-8 text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Quezon City • Main Campus</span>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic leading-none">Center for Advancement</h3>
                </div>
              </div>
              <CardContent className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-white/80 backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/5 p-3 rounded-2xl shadow-inner border border-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-[10px] tracking-widest opacity-60 italic">Live Occupancy</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">
                        {currentOccupancy} 
                        <span className="text-xl font-bold text-muted-foreground ml-2 opacity-50">/ {maxCapacity}</span>
                      </span>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                        {Math.round(occupancyPercentage)}% Capacity
                      </span>
                    </div>
                    <div className="relative h-4 bg-muted rounded-full overflow-hidden shadow-inner border border-white">
                        <div 
                          className="absolute h-full bg-secondary transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_12px_rgba(251,191,36,0.3)]" 
                          style={{ width: `${occupancyPercentage}%` }}
                        />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/5 p-3 rounded-2xl shadow-inner border border-primary/10">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-[10px] tracking-widest opacity-60 italic">Hub Schedule</h4>
                  </div>
                  <div className="space-y-2">
                      <div className="flex items-center gap-3 text-green-600 font-black">
                        <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.4)]" />
                        <span className="uppercase tracking-widest text-sm italic">Currently Accepting Log Entries</span>
                      </div>
                      <p className="text-base font-medium text-muted-foreground leading-relaxed">
                        Monday - Friday: <strong className="text-primary font-black">08:00 AM - 05:00 PM</strong>
                      </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-700">
              <Card className="neu-card-shadow border-none rounded-[2rem] bg-white/70 backdrop-blur-2xl p-8 space-y-6 border border-white/50 group">
                <div className="flex items-center gap-4 text-primary">
                  <ShieldCheck className="h-6 w-6 text-secondary" />
                  <h4 className="font-black uppercase text-xs tracking-[0.2em] italic">Access Protocols</h4>
                </div>
                <ul className="space-y-4">
                  {['Valid Institutional ID Required', 'Google Workspace Authentication', 'Quiet Study Environment', 'No Food or Drinks Allowed'].map((rule, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm font-bold text-muted-foreground italic group-hover:translate-x-1 transition-transform">
                      <div className="h-2 w-2 rounded-full bg-secondary shadow-sm shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </Card>
              
              <Card className="neu-card-shadow border-none rounded-[2rem] bg-white/70 backdrop-blur-2xl p-8 space-y-6 border border-white/50 group">
                <div className="flex items-center gap-4 text-primary">
                  <BookOpen className="h-6 w-6 text-secondary" />
                  <h4 className="font-black uppercase text-xs tracking-[0.2em] italic">Core Resources</h4>
                </div>
                <ul className="space-y-4">
                  {['Global Digital Databases', 'Unified Workspace Access', 'Specialized Research Labs', 'High-Speed Academic Hub'].map((service, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm font-bold text-muted-foreground italic group-hover:translate-x-1 transition-transform">
                      <div className="h-2 w-2 rounded-full bg-primary shadow-sm shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* Sticky Sidebar Area */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 animate-in slide-in-from-right-6 duration-700">
            <Card className="neu-card-shadow border-none rounded-[2rem] bg-primary text-white p-8 space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <h3 className="text-3xl font-black leading-tight italic uppercase tracking-tighter">Enter Hub.</h3>
                <p className="text-white/70 text-sm font-medium leading-relaxed">Sign in with your institutional credentials to log your presence and access services.</p>
              </div>
              <Button 
                onClick={onLogin}
                variant="neuSecondary"
                className="w-full h-16 bg-secondary text-primary font-black text-lg rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 group"
              >
                Access Portal
                <LogIn className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>

            <Card className="neu-card-shadow border-none rounded-[2rem] bg-white/80 backdrop-blur-2xl p-8 space-y-8 border border-white/50">
              <div className="flex items-center gap-3 text-primary">
                <Info className="h-5 w-5 text-secondary" />
                <h4 className="font-black uppercase text-[9px] tracking-[0.3em] opacity-60 italic">Inquiry Desk</h4>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="bg-primary/5 p-3 rounded-xl group-hover:bg-primary transition-all shadow-inner">
                    <Phone className="h-5 w-5 text-primary group-hover:text-white transition-all" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Voice Support</p>
                    <p className="font-black text-primary text-sm italic tracking-tight">+63 (2) 8-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="bg-primary/5 p-3 rounded-xl group-hover:bg-primary transition-all shadow-inner">
                    <Mail className="h-5 w-5 text-primary group-hover:text-white transition-all" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Email Inquiry</p>
                    <p className="font-black text-primary text-sm italic tracking-tight">library@neu.edu.ph</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-6 border-2 border-dashed border-primary/10 rounded-[2rem] text-center space-y-3 bg-primary/5">
              <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">Notice</p>
              <p className="text-[11px] font-bold text-primary/70 italic leading-relaxed">
                Guest mode is strictly observational. Physical entry requires authenticated attendance logging for all visitors.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="relative z-10 p-8 text-center text-muted-foreground/30 text-[9px] font-black uppercase tracking-[0.4em] bg-white/40 backdrop-blur-md border-t mt-auto">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • EXCELLENCE • DISCIPLINE</p>
      </footer>
    </div>
  );
}