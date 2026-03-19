
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Loader2,
  Scan,
  UserCheck,
  Globe,
  Info
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";

interface LoginScreenProps {
  onBack: () => void;
}

export function LoginScreen({ onBack }: LoginScreenProps) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("user");
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleLogin = async (type: 'user' | 'guest') => {
    await login(type);
  };

  const handleRFIDTap = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Simulation Active",
        description: "Please use the official Google Sign-In for institutional synchronization.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 neu-background">
      <Card className="w-full max-w-md overflow-hidden shadow-3xl border-none rounded-[2.5rem] bg-white animate-in zoom-in duration-500">
        <CardHeader className="bg-primary text-white text-center py-12 space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-10" />
          <div className="mx-auto w-24 h-24 bg-white p-4 rounded-3xl shadow-2xl relative z-10 transition-transform hover:scale-110">
            <Image 
              src={logoImage?.imageUrl || ""} 
              alt="NEU Logo" 
              width={80} 
              height={80} 
              className="object-contain"
            />
          </div>
          <div className="space-y-2 relative z-10">
            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter leading-none">Institutional <br /> Gateway</CardTitle>
            <CardDescription className="text-secondary font-black text-[10px] uppercase tracking-[0.4em]">Registry Synchronization</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-6 top-6 text-white hover:bg-white/10 rounded-xl font-bold uppercase text-[9px] tracking-widest gap-2"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Return
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="user" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none h-18 bg-slate-50 border-b">
              <TabsTrigger value="user" className="gap-3 text-[10px] font-black uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
                <ShieldCheck className="h-4 w-4" /> Member
              </TabsTrigger>
              <TabsTrigger value="guest" className="gap-3 text-[10px] font-black uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-primary transition-all">
                <Globe className="h-4 w-4" /> Guest
              </TabsTrigger>
            </TabsList>

            <div className="p-10 md:p-14 space-y-10">
              <TabsContent value="user" className="mt-0 space-y-10 animate-in slide-in-from-left-6 duration-500">
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-black text-primary italic uppercase tracking-tighter">Academic Access</h3>
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Use your @neu.edu.ph account</p>
                </div>

                <div className="space-y-6">
                  <Button 
                    onClick={() => handleLogin('user')} 
                    variant="outline"
                    className="w-full h-20 font-black text-sm uppercase tracking-widest gap-6 border-2 rounded-2xl hover:bg-slate-50 hover:scale-[1.02] transition-all shadow-xl"
                  >
                    <Image src="https://www.google.com/favicon.ico" alt="Google" width={24} height={24} />
                    Sync Academic Identity
                  </Button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t-2 border-dashed border-muted" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.5em]">
                      <span className="bg-white px-8 text-muted-foreground">RFID Sync</span>
                    </div>
                  </div>

                  <Button 
                    variant="neu"
                    onClick={handleRFIDTap}
                    disabled={isScanning}
                    className="w-full h-20 gap-6 rounded-2xl shadow-3xl text-xl font-black italic uppercase"
                  >
                    {isScanning ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <Scan className="h-8 w-8 text-secondary" />
                    )}
                    SCAN ID CARD
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="guest" className="mt-0 space-y-10 animate-in slide-in-from-right-6 duration-500">
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-black text-primary italic uppercase tracking-tighter">Visitor Protocol</h3>
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Limited access inquiry</p>
                </div>

                <div className="space-y-6">
                  <Button 
                    onClick={() => handleLogin('guest')} 
                    className="w-full h-24 bg-primary hover:bg-primary/95 text-white font-black text-xl gap-6 rounded-2xl shadow-3xl group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <UserCheck className="h-8 w-8 text-secondary" />
                    Continue as Visitor
                  </Button>
                  
                  <div className="p-8 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20 flex items-start gap-4">
                      <Info className="h-6 w-6 text-primary shrink-0 mt-1" />
                      <p className="text-xs font-medium text-primary/80 leading-relaxed italic">
                        Guests must officially log their presence in the registry for institutional security compliance.
                      </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-8 bg-slate-50 border-t text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
              &copy; {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
