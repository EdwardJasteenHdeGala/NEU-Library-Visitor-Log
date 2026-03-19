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
  LogIn,
  Megaphone,
  Clock,
  ExternalLink
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface GuestViewProps {
  onBack: () => void;
  onLogin: () => void;
}

export function GuestView({ onBack, onLogin }: GuestViewProps) {
  const campusImage = PlaceHolderImages.find(img => img.id === 'neu-campus');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-primary/10">
      {/* Modern Slim Header */}
      <header className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="hover:bg-slate-100 font-bold text-[10px] uppercase tracking-widest text-slate-500 transition-all active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-2" />
              Institutional Home
            </Button>
            
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
            
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 bg-white rounded-lg shadow-sm border p-1 flex items-center justify-center">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain p-1" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-black text-primary uppercase tracking-tight italic">Access Hub</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Library Portal</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={onLogin}
            className="h-9 px-6 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            Institutional Login
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 space-y-12 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Content Section */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                 <Megaphone className="h-3 w-3 text-secondary" /> 
                 Institutional Advisory
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] italic">
                Library <br /> 
                <span className="text-primary">Resource Center</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl font-medium italic">
                Advancing academic excellence through modern resource management and standardized registry protocols.
              </p>
            </div>

            <Card className="shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border-none overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-200/50">
              <div className="aspect-[21/10] relative group overflow-hidden">
                <Image 
                  src={campusImage?.imageUrl || ""} 
                  alt="NEU Campus" 
                  fill 
                  priority
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  data-ai-hint="university campus"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="text-white space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-secondary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Quezon City Main</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">Knowledge Hub</h3>
                  </div>
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                     <Clock className="h-5 w-5 text-secondary" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Registry Hours</span>
                        <span className="text-xs font-bold text-white/80">08:00 AM - 05:00 PM</span>
                     </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-10 md:p-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                         <ShieldCheck className="h-5 w-5 text-secondary" /> Access Protocol
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed italic font-medium">
                        Standard facility access requires mandatory registration in the institutional registry. All visitors are logged to ensure security compliance and resource optimization.
                      </p>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                         <BookOpen className="h-5 w-5 text-secondary" /> Resource Use
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed italic font-medium">
                        Members gain full access to the digital archives, thesis collection, and collaborative workspaces upon successful identity synchronization.
                      </p>
                   </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Academic Integrity', desc: 'Secure institutional logging for audit trails.', icon: ShieldCheck },
                { title: 'Research Archives', desc: 'Comprehensive access to advanced datasets.', icon: BookOpen },
                { title: 'Global Connectivity', desc: 'Synchronized identity hub for university members.', icon: ExternalLink },
                { title: 'System Security', desc: 'AES-256 cloud encryption for registry data.', icon: ShieldCheck }
              ].map((item, i) => (
                <div key={i} className="group p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="p-4 bg-slate-50 rounded-2xl w-fit mb-6 transition-colors group-hover:bg-primary/5">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h5 className="text-lg font-black text-slate-800 uppercase italic tracking-tight mb-2">{item.title}</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <Card className="shadow-2xl p-10 space-y-8 rounded-[2.5rem] border-none text-white bg-slate-900 relative overflow-hidden group">
              <div className="absolute inset-0 bg-dot-pattern opacity-10" />
              <div className="space-y-6 relative z-10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-1.5 rounded-full border border-white/10">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Registry Active</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-none mt-4">Portal Gateway</h3>
                </div>
                <p className="text-base font-medium leading-relaxed opacity-80 italic">
                  Institutional members must officially log their presence to access academic facilities.
                </p>
                
                <div className="pt-6 flex justify-start">
                  <Button 
                    onClick={onLogin}
                    className="w-fit min-w-[12rem] h-[3.5rem] bg-primary text-white hover:bg-primary/90 font-black text-[0.75rem] uppercase tracking-[0.2em] rounded-xl shadow-2xl active:scale-95 transition-all flex items-center gap-[1rem] px-[1.5rem]"
                  >
                    Enter Portal Gateway
                    <LogIn className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm p-10 space-y-8 rounded-[2.5rem] border-slate-200 bg-white ring-1 ring-slate-100">
              <div className="flex items-center gap-3 text-slate-400 border-b pb-6">
                <Info className="h-4 w-4" />
                <h4 className="font-black uppercase text-[10px] tracking-[0.3em]">Support Gateway</h4>
              </div>
              <div className="space-y-8">
                <div className="flex items-start gap-6 group cursor-default">
                  <div className="bg-slate-50 p-4 rounded-2xl border transition-colors group-hover:bg-primary group-hover:text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Institutional Line</p>
                    <p className="font-black text-slate-800 text-base italic tracking-tight">+63 (2) 8-123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group cursor-pointer" onClick={() => window.location.href = 'mailto:library@neu.edu.ph'}>
                  <div className="bg-slate-50 p-4 rounded-2xl border transition-colors group-hover:bg-primary group-hover:text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Official Email</p>
                    <p className="font-black text-slate-800 text-base italic tracking-tight underline underline-offset-4 decoration-primary/20 hover:decoration-primary transition-all">library@neu.edu.ph</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-[0.4em] px-8 opacity-60">
               NEU • ACCESS HUB • 2024
            </p>
          </aside>
        </div>
      </main>

      <footer className="p-10 text-center border-t bg-white mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">
             © {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB • COLLEGE OF ENGINEERING & ARCHITECTURE
           </p>
           <div className="flex items-center gap-8">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-colors cursor-default">Privacy</span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-colors cursor-default">Audit</span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-colors cursor-default">Compliance</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
