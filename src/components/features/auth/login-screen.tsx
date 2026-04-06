"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { 
  ArrowLeft, 
  ShieldCheck, 
  UserCheck,
  Globe,
  Info,
  IdCard,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";

interface LoginScreenProps {
  onBack: () => void;
  initialTab?: string;
}

export function LoginScreen({ onBack, initialTab = "member" }: LoginScreenProps) {
  const { login, loginWithId } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [manualId, setManualId] = useState("");
  const [isLoggingId, setIsLoggingId] = useState(false);
  const { toast } = useToast();
  
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleLogin = async (type: 'member' | 'guest') => {
    await login(type);
  };

  const handleManualIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) {
      toast({ title: "ID Required", description: "Please tap or enter your institutional ID.", variant: "destructive" });
      return;
    }

    setIsLoggingId(true);
    try {
      await loginWithId(manualId.trim());
    } finally {
      setIsLoggingId(false);
    }
  };



  return (
    <div className="w-full max-w-md mx-auto animate-in zoom-in duration-700">
      <Card className="overflow-hidden shadow-3xl border-none rounded-[3rem] bg-card">
        <CardHeader className="bg-[#032e41] text-white text-center py-14 space-y-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#032e41] via-[#032e41] to-[#046c64]/40 opacity-90" />
          <div className="absolute inset-0 bg-dot-pattern opacity-20" />
          <div className="mx-auto w-24 h-24 bg-white/10 backdrop-blur-xl p-4 rounded-[2rem] shadow-2xl relative z-10 transition-all group-hover:scale-110 group-hover:rotate-3 border border-white/20">
            {logoImage?.imageUrl && (
              <Image 
                src={logoImage.imageUrl} 
                alt="NEU Logo" 
                width={80} 
                height={80} 
                className="object-contain"
              />
            )}
          </div>
          <div className="space-y-2 relative z-10 font-headline">
            <CardTitle className="text-4xl font-black italic uppercase tracking-tighter leading-none text-secondary text-glow-secondary drop-shadow-[0_0_20px_hsl(var(--secondary)/0.5)]">Institutional <br /> Gateway</CardTitle>
            <CardDescription className="text-white/60 font-black text-[12px] uppercase tracking-[0.4em] opacity-80">Registry Synchronization</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="member" onValueChange={setActiveTab} value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none h-20 bg-muted/20 border-b border-border/50 p-1">
              <TabsTrigger value="member" className="gap-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-none data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all active:scale-95 h-full">
                <ShieldCheck className="h-5 w-5" /> Member
              </TabsTrigger>
              <TabsTrigger value="guest" className="gap-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-none data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all active:scale-95 h-full">
                <Globe className="h-5 w-5" /> Guest
              </TabsTrigger>
            </TabsList>

            <div className="p-10 md:p-16 space-y-12">
              <TabsContent value="member" className="mt-0 space-y-12 animate-in slide-in-from-left-6 duration-700 focus-visible:outline-none">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter">Academic Access</h3>
                  <p className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Use your institutional @neu.edu.ph account</p>
                </div>

                <div className="space-y-8">
                  <Button 
                    onClick={() => handleLogin('member')} 
                    variant="outline"
                    className="w-full h-24 font-black text-lg uppercase tracking-widest gap-6 border-2 rounded-[2rem] hover:bg-muted/30 hover:scale-[1.02] active:scale-95 transition-all shadow-xl bg-card"
                  >
                    <Image src="https://www.google.com/favicon.ico" alt="Google" width={28} height={28} />
                    Sync Identity
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="guest" className="mt-0 space-y-12 animate-in slide-in-from-right-6 duration-700 focus-visible:outline-none">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter">Visitor Protocol</h3>
                  <p className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Limited academic zone inquiry</p>
                </div>

                <div className="space-y-10">
                  <div className="space-y-6">
                    <form onSubmit={handleManualIdLogin} className="space-y-4">
                      <Label htmlFor="manualId" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 ml-2 flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-secondary" />
                        TAP Institutional ID (RFID Simulation)
                      </Label>
                      <div className="relative group/input">
                        <Input 
                          id="manualId"
                          placeholder="SCAN OR TYPE ID..." 
                          value={manualId} 
                          onChange={(e) => setManualId(e.target.value)}
                          className="h-20 text-2xl font-black rounded-[1.5rem] border-2 border-primary/10 transition-all focus:border-primary/40 focus:ring-primary shadow-inner bg-muted/30 px-8 italic placeholder:text-primary/10 tracking-widest text-center"
                          autoComplete="off"
                          disabled={isLoggingId}
                        />
                        <div className="absolute inset-0 bg-primary/5 rounded-[1.5rem] pointer-events-none opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!manualId.trim() || isLoggingId}
                        className="w-full h-16 font-black text-xs uppercase tracking-[0.4em] gap-4 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all shadow-lg active:scale-95"
                      >
                        {isLoggingId ? <Loader2 className="h-5 w-5 animate-spin" /> : "SYNCHRONIZE IDENTITY"}
                      </Button>
                    </form>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-x-0 h-px bg-border" />
                    <span className="relative bg-card px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">OR SIGN IN WITH CLOUD IDENTITY</span>
                  </div>

                  <Button 
                    onClick={() => handleLogin('guest')} 
                    className="w-full h-24 bg-primary hover:bg-primary/95 text-white font-black text-xl gap-6 rounded-[2rem] shadow-xl group relative overflow-hidden active:scale-95 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <UserCheck className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-500" />
                    Continue with Google
                  </Button>
                  
                  <div className="p-8 bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/10 flex items-start gap-5 transition-colors hover:bg-primary/10">
                      <Info className="h-6 w-6 text-primary shrink-0 mt-1" />
                      <p className="text-[11px] font-medium text-primary/80 leading-relaxed italic">
                        Guests must officially log their presence in the institutional registry for security compliance and facility telemetry.
                      </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          
          <div className="p-8 bg-muted/30 border-t text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
              &copy; {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
