"use client";

import { Button } from "@/components/ui/button";
import { Library, ArrowRight, ShieldCheck, GraduationCap, Info } from "lucide-react";
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
    <div className="min-h-screen flex flex-col neu-background">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Image 
            src={logoImage?.imageUrl || ""} 
            alt="NEU Logo" 
            width={40} 
            height={40} 
            priority
            className="object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-xl tracking-tight text-primary">NEU Access Hub</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Library Portal</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Protocols</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Access Protocols
                </DialogTitle>
                <DialogDescription>Institutional guidelines for library entry and use.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-bold text-sm">Mandatory Attendance Logging</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">All visitors must officially register their entry via the Access Hub portal. Records are synchronized with the university's institutional logs.</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-bold text-sm">Identity Verification</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Institutional members should possess their valid ID cards. Guests are permitted access within designated academic zones only.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={onLogin} size="sm" className="font-semibold">Institutional Login</Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="max-w-3xl w-full space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 px-4 py-1.5 rounded-full text-xs font-semibold">
              <Info className="h-4 w-4" />
              Official Portal of New Era University
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight">
              New Era University <br /> 
              <span className="text-slate-900">Library Access Hub</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Welcome to the New Era University Library Portal. Streamline your academic journey with automated access and real-time research synchronization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={onLogin}
              className="w-full sm:w-auto h-14 px-10 text-base font-semibold gap-2"
            >
              Access Portal
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onGuest}
              className="w-full sm:w-auto h-14 px-10 text-base font-semibold"
            >
              Guest Inquiry
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            {[
              { icon: GraduationCap, label: "Scholarship" },
              { icon: Library, label: "Research" },
              { icon: ShieldCheck, label: "Integrity" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-white shadow-sm border border-border">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary/70 uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.2em]">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB • COLLEGE OF ENGINEERING & ARCHITECTURE</p>
      </footer>
    </div>
  );
}