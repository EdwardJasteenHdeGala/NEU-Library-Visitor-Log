"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Library, 
  ArrowLeft, 
  Clock, 
  Users, 
  Info, 
  ShieldCheck, 
  MapPin, 
  BookOpen,
  Phone,
  Mail
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Progress } from "@/components/ui/progress";

interface GuestViewProps {
  onBack: () => void;
}

export function GuestView({ onBack }: GuestViewProps) {
  const libraryImage = PlaceHolderImages.find(img => img.id === 'library-interior');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  // Simulated live data
  const currentOccupancy = 42;
  const maxCapacity = 150;
  const occupancyPercentage = (currentOccupancy / maxCapacity) * 100;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col animate-in fade-in duration-700">
      <header className="p-4 bg-primary text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white hover:bg-white/10 font-bold text-xs uppercase"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-8 w-px bg-white/20 mx-2 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Image src={logoImage?.imageUrl || ""} alt="NEU" width={24} height={24} className="bg-white rounded p-0.5" />
              <h1 className="text-lg font-black tracking-tight italic hidden sm:block">GUEST VIEW</h1>
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
            Public Information Mode
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tight leading-none uppercase">
                Welcome to the <br />
                <span className="text-secondary italic">NEU Library Hub.</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                Our facilities are open to all students, faculty, and authorized guests. Explore our resources and check real-time availability.
              </p>
            </div>

            <Card className="neu-card-shadow border-none rounded-[2rem] bg-white overflow-hidden">
              <div className="aspect-video relative">
                <Image 
                  src={libraryImage?.imageUrl || ""} 
                  alt="Library Interior" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-secondary" />
                    <span className="text-xs font-bold uppercase tracking-widest">Main Campus, Quezon City</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Center for Academic Excellence</h3>
                </div>
              </div>
              <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-sm tracking-widest">Current Occupancy</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-black text-primary">{currentOccupancy} <span className="text-sm font-medium text-muted-foreground">/ {maxCapacity}</span></span>
                      <span className="text-xs font-bold text-primary uppercase">{Math.round(occupancyPercentage)}% Capacity</span>
                    </div>
                    <Progress value={occupancyPercentage} className="h-3" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-black text-primary uppercase text-sm tracking-widest">Service Status</h4>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-black">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-600 animate-pulse" />
                    <span className="uppercase tracking-widest">Open Now • Closes at 17:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="neu-card-shadow border-none rounded-3xl bg-white p-6 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                  <h4 className="font-black uppercase text-sm tracking-widest">Access Guidelines</h4>
                </div>
                <ul className="space-y-3">
                  {['Valid School ID required', 'Sign-in via Google Portal', 'Strict silence observed', 'No food or drinks inside'].map((rule, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="neu-card-shadow border-none rounded-3xl bg-white p-6 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <BookOpen className="h-5 w-5" />
                  <h4 className="font-black uppercase text-sm tracking-widest">Available Services</h4>
                </div>
                <ul className="space-y-3">
                  {['Research Repositories', 'Digital Learning Hub', 'Group Study Spaces', 'Printing & Scanning'].map((service, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      {service}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <aside className="space-y-8">
            <Card className="neu-card-shadow border-none rounded-3xl bg-primary text-white p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black leading-tight italic">READY TO START?</h3>
                <p className="text-white/70 text-sm font-medium">Log in with your institutional account to record your visit and access full features.</p>
              </div>
              <Button 
                onClick={onBack}
                className="w-full h-14 bg-secondary hover:bg-white text-primary font-black text-lg rounded-2xl shadow-xl transition-all"
              >
                Sign In Now
              </Button>
            </Card>

            <Card className="neu-card-shadow border-none rounded-3xl bg-white p-8 space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Info className="h-5 w-5" />
                <h4 className="font-black uppercase text-xs tracking-[0.2em]">Contact Information</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="bg-muted p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-xs">
                    <p className="font-black text-muted-foreground uppercase tracking-widest">Phone</p>
                    <p className="font-bold text-primary">+63 (2) 8-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="bg-muted p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-xs">
                    <p className="font-black text-muted-foreground uppercase tracking-widest">Email</p>
                    <p className="font-bold text-primary">library@neu.edu.ph</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-6 border-2 border-dashed border-muted-foreground/20 rounded-3xl text-center space-y-3 bg-muted/30">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Institutional Notice</p>
              <p className="text-[11px] font-medium text-muted-foreground italic">
                Guest view is for informational purposes only. Attendance logging is required for physical entry.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] bg-white border-t mt-auto">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • INTEGRITY • EXCELLENCE • DISCIPLINE</p>
      </footer>
    </div>
  );
}