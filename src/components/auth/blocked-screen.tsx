
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, LogOut, Phone, Mail, MessageSquare } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function BlockedScreen() {
  const { profile, logout } = useAuth();
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  return (
    <div className="min-h-screen flex items-center justify-center p-6 neu-background">
      <Card className="w-full max-w-lg shadow-3xl border-none rounded-[3rem] bg-white overflow-hidden animate-in zoom-in duration-500">
        <CardHeader className="bg-destructive p-12 text-center text-white relative">
          <div className="absolute inset-0 bg-dot-pattern opacity-10" />
          <div className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border-2 border-white/30 mb-6 relative z-10">
            <ShieldAlert className="h-12 w-12 text-white drop-shadow-lg" />
          </div>
          <CardTitle className="text-3xl font-black italic tracking-tighter uppercase relative z-10 leading-none">
            Institutional <br /> Suspension
          </CardTitle>
          <CardDescription className="text-white/70 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 relative z-10">
            Access Synchronized Terminal
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-10 md:p-14 space-y-10 bg-white">
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-black text-primary italic uppercase tracking-tighter">Suspension Notice</h3>
            <div className="p-8 bg-destructive/5 rounded-3xl border-2 border-destructive/20 shadow-inner">
               <p className="text-lg font-medium text-destructive/80 italic leading-relaxed">
                 "{profile?.blockedReason || 'No specific reason provided by administrator.'}"
               </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-sm"><Mail className="h-5 w-5 text-primary" /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Support Channel</span>
                  <span className="font-bold text-sm">library-support@neu.edu.ph</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-sm"><Phone className="h-5 w-5 text-primary" /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Institutional Line</span>
                  <span className="font-bold text-sm">+63 (2) 8-123-4567</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={logout} 
              variant="destructive" 
              className="w-full h-20 text-xl font-black gap-4 rounded-[1.5rem] shadow-2xl active:scale-95 transition-all"
            >
              <LogOut className="h-6 w-6" />
              TERMINATE SESSION
            </Button>
            
            <p className="text-[9px] font-bold text-muted-foreground text-center uppercase tracking-[0.2em] px-8 italic">
              Your institutional identity has been logged. Continuous attempts to bypass suspension will be reported to the Registrar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
