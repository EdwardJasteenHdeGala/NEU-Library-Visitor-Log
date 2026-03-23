"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Info, 
  ShieldCheck, 
  MapPin, 
  BookOpen,
  Phone,
  Mail,
  Megaphone,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

interface GuestViewProps {
  onBack: () => void;
  onLogin: () => void;
}

export function GuestView({ onBack, onLogin }: GuestViewProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const localTheme = localStorage.getItem('institutional-theme') as 'light' | 'dark';
    if (localTheme) setTheme(localTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('institutional-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const campusImage = PlaceHolderImages.find(img => img.id === 'neu-campus');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  return (
    <div className="space-y-[clamp(2rem,8vh,4rem)] animate-in fade-in duration-700">
      <div className="portal-grid items-start">
        <div className="lg:col-span-8 space-y-[clamp(1.5rem,5vh,3rem)]">
          <div className="space-y-[clamp(1rem,3vh,2rem)]">
            <div className="inline-flex items-center gap-[0.5rem] bg-primary/5 text-primary border border-primary/10 px-[1rem] py-[0.375rem] rounded-full text-[0.625rem] font-black uppercase tracking-[0.2em]">
               <Megaphone className="h-[0.75rem] w-[0.75rem] text-secondary" /> 
               Institutional Advisory
            </div>
            <h1 className="text-[clamp(2rem,8vw,4.5rem)] font-black text-foreground tracking-tighter leading-[0.9] italic">
              Library <br /> 
              <span className="text-primary">Resource Center</span>
            </h1>
            <p className="text-[clamp(1rem,2vw,1.25rem)] text-muted-foreground leading-relaxed max-w-[40rem] font-medium italic">
              Advancing scholarship through professional registry synchronization and real-time resource tracking.
            </p>
          </div>

          <Card className="shadow-2xl border-none overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-200/50">
            <div className="aspect-[21/10] min-h-[15rem] relative group overflow-hidden">
              <Image 
                src={campusImage?.imageUrl || ""} 
                alt="NEU Campus" 
                fill 
                priority
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                data-ai-hint="university campus"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-[clamp(1rem,5vw,2rem)] left-[clamp(1rem,5vw,2rem)] right-[clamp(1rem,5vw,2rem)] flex flex-col md:flex-row md:items-end justify-between gap-[1rem]">
                <div className="text-white space-y-[0.5rem]">
                  <div className="flex items-center gap-[0.5rem] mb-[0.25rem]">
                    <MapPin className="h-[1rem] w-[1rem] text-secondary" />
                    <span className="text-[0.625rem] font-black uppercase tracking-[0.3em] opacity-80">Quezon City Main</span>
                  </div>
                  <h3 className="text-[clamp(1.25rem,3vw,1.875rem)] font-black uppercase tracking-tighter italic leading-none">Knowledge Hub</h3>
                </div>
                <div className="flex items-center gap-[1rem] bg-white/10 backdrop-blur-md px-[1.5rem] py-[0.75rem] rounded-[1rem] border border-white/20 w-fit">
                   <Clock className="h-[1.25rem] w-[1.25rem] text-secondary" />
                   <div className="flex flex-col">
                      <span className="text-[0.625rem] font-black uppercase tracking-widest text-foreground/80">Registry Hours</span>
                      <span className="text-[0.75rem] font-bold text-foreground">08:00 AM - 05:00 PM</span>
                   </div>
                </div>
              </div>
            </div>
            <CardContent className="p-[clamp(1.5rem,5vw,3.5rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(1.5rem,5vw,3rem)]">
                 <div className="space-y-[1rem]">
                    <h4 className="text-[0.75rem] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-[0.75rem]">
                       <ShieldCheck className="h-[1.25rem] w-[1.25rem] text-secondary" /> Access Protocol
                    </h4>
                    <p className="text-[0.875rem] text-muted-foreground leading-relaxed italic font-medium">
                      Institutional access requires mandatory synchronization with the registry portal to ensure facility security and audit compliance.
                    </p>
                 </div>
                 <div className="space-y-[1rem]">
                    <h4 className="text-[0.75rem] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-[0.75rem]">
                       <BookOpen className="h-[1.25rem] w-[1.25rem] text-secondary" /> Academic Use
                    </h4>
                    <p className="text-[0.875rem] text-slate-500 leading-relaxed italic font-medium">
                      Registered members gain full access to specialized digital archives and collaborative study zones upon verified check-in.
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[clamp(1rem,3vw,1.5rem)]">
            {[
              { title: 'Academic Integrity', desc: 'Secure logging for university audit trails.', icon: ShieldCheck },
              { title: 'Research Archives', desc: 'Comprehensive access to institutional datasets.', icon: BookOpen },
              { title: 'Identity Hub', desc: 'Seamless synchronization for university members.', icon: ExternalLink },
              { title: 'Registry Security', desc: 'AES-256 cloud encryption for portal data.', icon: ShieldCheck }
            ].map((item, i) => (
              <div key={i} className="group p-[clamp(1.5rem,4vw,2.5rem)] bg-card rounded-[1.5rem] border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="p-[1rem] bg-muted/10 rounded-[1rem] w-fit mb-[1.5rem] transition-colors group-hover:bg-primary/5">
                  <item.icon className="h-[1.5rem] w-[1.25rem] text-primary" />
                </div>
                <h5 className="text-[1.125rem] font-black text-foreground uppercase italic tracking-tight mb-[0.5rem]">{item.title}</h5>
                <p className="text-[0.75rem] text-muted-foreground font-medium leading-relaxed italic">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-[clamp(1.5rem,4vw,2.5rem)]">
          <Card className="shadow-2xl p-[clamp(1.5rem,5vw,2.5rem)] space-y-[1.5rem] rounded-[2rem] border-none text-white bg-slate-900 relative overflow-hidden group">
            <div className="absolute inset-0 bg-dot-pattern opacity-10" />
            <div className="space-y-[1.25rem] relative z-10 flex flex-col items-center text-center">
              <div className="flex flex-col gap-[0.5rem] items-center">
                <div className="flex items-center gap-[0.75rem] bg-secondary/20 w-fit px-[1rem] py-[0.375rem] rounded-full border border-secondary/30">
                  <div className="h-[0.5rem] w-[0.5rem] rounded-full bg-secondary animate-pulse" />
                  <span className="text-[0.625rem] font-black uppercase tracking-widest text-secondary">Portal Active</span>
                </div>
                <h3 className="text-[clamp(1.75rem,4vw,2.25rem)] font-black tracking-tighter uppercase italic leading-none mt-[0.5rem]">Registry Gateway</h3>
              </div>
              <p className="text-[0.875rem] md:text-[1rem] font-medium leading-relaxed opacity-80 italic">
                Institutional members must officially log their presence to access academic facilities and resources.
              </p>
              
              <div className="pt-[0.5rem] w-full flex justify-center">
                <Button 
                  onClick={onLogin}
                  size="lg"
                  className="group w-full max-w-[20rem] h-[4rem] bg-primary text-white hover:bg-primary/90 font-black text-[0.75rem] uppercase tracking-[0.2em] rounded-[1rem] shadow-3xl active:scale-95 transition-all flex items-center justify-center gap-[1rem]"
                >
                  Enter Portal Gateway
                  <ChevronRight className="h-[1.25rem] w-[1.25rem] transition-transform group-hover:translate-x-[0.25rem]" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm p-[clamp(1.5rem,5vw,2.5rem)] space-y-[1.5rem] rounded-[2rem] border-border bg-card ring-1 ring-border">
            <div className="flex items-center gap-[0.75rem] text-muted-foreground border-b pb-[1rem]">
              <Info className="h-[1rem] w-[1rem]" />
              <h4 className="font-black uppercase text-[0.625rem] tracking-[0.3em]">Support Gateway</h4>
            </div>
            <div className="space-y-[1.5rem]">
              <div className="flex items-start gap-[1rem] group cursor-default">
                <div className="bg-muted/10 p-[0.75rem] rounded-[0.75rem] border transition-colors group-hover:bg-primary group-hover:text-white shrink-0">
                  <Phone className="h-[1.25rem] w-[1.25rem]" />
                </div>
                <div className="space-y-[0.25rem] min-w-0">
                  <p className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest">Institutional Line</p>
                  <p className="font-black text-slate-800 text-[0.875rem] md:text-[1rem] italic tracking-tight truncate">+63 (2) 8-123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-[1rem] group cursor-pointer" onClick={() => window.location.href = 'mailto:library@neu.edu.ph'}>
                <div className="bg-muted/10 p-[0.75rem] rounded-[0.75rem] border transition-colors group-hover:bg-primary group-hover:text-white shrink-0">
                  <Mail className="h-[1.25rem] w-[1.25rem]" />
                </div>
                <div className="space-y-[0.25rem] min-w-0">
                  <p className="text-[0.5625rem] font-black text-muted-foreground uppercase tracking-widest">Official Email</p>
                  <p className="font-black text-foreground text-[0.875rem] md:text-[1rem] italic tracking-tight underline underline-offset-4 decoration-primary/20 hover:decoration-primary transition-all truncate">library@neu.edu.ph</p>
                </div>
              </div>
            </div>
          </Card>
          
          <p className="text-[0.625rem] font-black text-slate-400 text-center uppercase tracking-[0.4em] px-[1rem] opacity-60">
             NEU • ACCESS HUB • COLLEGE OF INFORMATICS & COMPUTING SCIENCES
          </p>
        </aside>
      </div>
    </div>
  );
}