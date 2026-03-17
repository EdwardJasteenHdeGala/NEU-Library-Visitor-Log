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
  LogIn
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

  // Simulated live data
  const currentOccupancy = 42;
  const maxCapacity = 150;
  const occupancyPercentage = (currentOccupancy / maxCapacity) * 100;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col overflow-x-hidden animate-in fade-in duration-700">
      <header className="p-3 md:p-4 bg-primary text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white hover:bg-white/10 font-bold text-[10px] md:text-xs uppercase h-8 md:h-10 px-2 md:px-4"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1 md:mr-2" />
              <span className="hidden xs:inline">Back</span>
            </Button>
            <div className="h-6 md:h-8 w-px bg-white/20 mx-1 md:mx-2 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 md:w-8 md:h-8 bg-white rounded p-1">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain" />
              </div>
              <h1 className="text-sm md:text-lg font-black tracking-tight italic hidden xs:block">GUEST HUB</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:block text-[9px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                Public Access Mode
            </div>
            <Button 
                variant="secondary" 
                size="sm" 
                onClick={onLogin}
                className="bg-secondary text-primary font-black text-[10px] md:text-xs uppercase hover:bg-white h-8 md:h-10 px-3 md:px-6"
            >
                <LogIn className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5" />
                Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 lg:p-10 space-y-8 md:space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            <div className="space-y-4 md:space-y-6 text-center lg:text-left">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-[1.1] uppercase">
                Welcome to the <br />
                <span className="text-secondary italic">NEU Library Hub.</span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground font-medium max-w-2xl mx-auto lg:mx-0">
                Our facilities are open to all students, faculty, and authorized guests. Explore our resources and check real-time availability.
              </p>
            </div>

            <Card className="neu-card-shadow border-none rounded-[1.5rem] md:rounded-[2.5rem] bg-white overflow-hidden">
              <div className="aspect-[16/9] relative">
                <Image 
                  src={libraryImage?.imageUrl || ""} 
                  alt="Library Interior" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-secondary" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Main Campus, Quezon City</span>
                  </div>
                  <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight">Center for Academic Excellence</h3>
                </div>
              </div>
              <CardContent className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 md:p-3 rounded-xl">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-xs md:text-sm tracking-widest">Current Occupancy</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-2xl md:text-4xl font-black text-primary">
                        {currentOccupancy} 
                        <span className="text-xs md:text-sm font-medium text-muted-foreground ml-1">/ {maxCapacity}</span>
                      </span>
                      <span className="text-[10px] md:text-xs font-black text-primary uppercase">{Math.round(occupancyPercentage)}% Capacity</span>
                    </div>
                    <Progress value={occupancyPercentage} className="h-3 md:h-4" />
                  </div>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 md:p-3 rounded-xl">
                      <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-xs md:text-sm tracking-widest">Service Status</h4>
                  </div>
                  <div className="flex items-center gap-3 text-green-600 font-black">
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-600 animate-pulse" />
                    <span className="uppercase tracking-widest text-sm md:text-base">Open Now • Closes at 17:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <Card className="neu-card-shadow border-none rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
                  <h4 className="font-black uppercase text-xs md:text-sm tracking-widest">Access Guidelines</h4>
                </div>
                <ul className="space-y-3 md:space-y-4">
                  {['Valid School ID required', 'Sign-in via Google Portal', 'Strict silence observed', 'No food or drinks inside'].map((rule, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm md:text-base font-medium text-muted-foreground">
                      <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-secondary shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="neu-card-shadow border-none rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
                  <h4 className="font-black uppercase text-xs md:text-sm tracking-widest">Available Services</h4>
                </div>
                <ul className="space-y-3 md:space-y-4">
                  {['Research Repositories', 'Digital Learning Hub', 'Group Study Spaces', 'Printing & Scanning'].map((service, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm md:text-base font-medium text-muted-foreground">
                      <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-secondary shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <aside className="space-y-8 md:space-y-12 lg:sticky lg:top-24">
            <Card className="neu-card-shadow border-none rounded-[2rem] md:rounded-[3rem] bg-primary text-white p-8 md:p-10 space-y-6 md:space-y-8 shadow-2xl">
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-2xl md:text-3xl font-black leading-tight italic uppercase tracking-tighter">Ready to start?</h3>
                <p className="text-white/70 text-sm md:text-base font-medium">Log in with your institutional account to record your visit and access full features.</p>
              </div>
              <Button 
                onClick={onLogin}
                className="w-full h-14 md:h-16 bg-secondary hover:bg-white text-primary font-black text-lg md:text-xl rounded-2xl shadow-xl transition-all"
              >
                Sign In Now
              </Button>
            </Card>

            <Card className="neu-card-shadow border-none rounded-[2rem] md:rounded-[3rem] bg-white p-8 md:p-10 space-y-6 md:space-y-8">
              <div className="flex items-center gap-3 text-primary">
                <Info className="h-5 w-5 md:h-6 md:w-6" />
                <h4 className="font-black uppercase text-[10px] md:text-xs tracking-[0.2em]">Contact Information</h4>
              </div>
              <div className="space-y-5 md:space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="bg-muted p-3 rounded-xl group-hover:bg-primary/10 transition-colors">
                    <Phone className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Phone</p>
                    <p className="font-bold text-primary text-sm md:text-base">+63 (2) 8-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="bg-muted p-3 rounded-xl group-hover:bg-primary/10 transition-colors">
                    <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email</p>
                    <p className="font-bold text-primary text-sm md:text-base">library@neu.edu.ph</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-6 md:p-8 border-4 border-dashed border-muted-foreground/10 rounded-[2rem] md:rounded-[3rem] text-center space-y-3 bg-muted/20">
              <p className="text-[9px] md:text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] md:tracking-[0.5em]">Institutional Notice</p>
              <p className="text-[10px] md:text-[12px] font-medium text-muted-foreground italic leading-relaxed">
                Guest view is for informational purposes only. Attendance logging is required for physical entry and facility use.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="p-8 md:p-12 text-center text-muted-foreground text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] bg-white border-t mt-auto">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • INTEGRITY • EXCELLENCE • DISCIPLINE</p>
      </footer>
    </div>
  );
}