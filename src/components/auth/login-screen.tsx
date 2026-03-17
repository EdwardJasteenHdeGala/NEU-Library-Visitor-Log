"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogIn, 
  ArrowLeft, 
  Fingerprint, 
  Mail, 
  ShieldCheck, 
  User as UserIcon,
  Search,
  Loader2,
  Scan,
  Sparkles
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

  const handleLogin = async () => {
    await login(activeTab as 'user' | 'admin');
  };

  const handleRFIDTap = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "ID Detected & Verified",
        description: "Institutional Identity Confirmed. Syncing College Data...",
      });
      handleLogin();
    }, 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background overflow-hidden neu-mesh-gradient relative">
      {/* Institutional Background Overlay */}
      <div className="neu-bg-overlay" />

      {/* Animated Blobs for depth */}
      <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-secondary/20 rounded-full blur-[120px] animate-blob delay-2000" />
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />

      <Card className="w-full max-w-xl relative z-10 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.2)] border-none overflow-hidden rounded-[4rem] bg-white/80 backdrop-blur-3xl animate-in fade-in zoom-in duration-700">
        <div className="bg-primary p-12 text-center space-y-10 relative overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <Button 
                variant="ghost" 
                size="sm" 
                className="absolute left-10 top-10 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl h-11 px-6 transition-all z-20"
                onClick={onBack}
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Return
            </Button>
            
            <div className="mx-auto w-36 h-36 relative rounded-[2.5rem] overflow-hidden border-4 border-secondary/40 shadow-2xl bg-white p-5 group transition-transform duration-500 hover:scale-105">
                <Image 
                    src={logoImage?.imageUrl || ""} 
                    alt="NEU Logo" 
                    fill 
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                />
            </div>
            
            <div className="space-y-4">
                <div className="inline-flex items-center gap-3 bg-white/10 text-white/90 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
                   <ShieldCheck className="h-4 w-4 text-secondary" />
                   Secure Access Gateway
                </div>
                <CardTitle className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-lg">
                    Institutional <br /> Login
                </CardTitle>
            </div>
        </div>
        
        <CardContent className="p-0">
          <Tabs defaultValue="user" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-24 bg-muted/40 p-2.5 rounded-none">
              <TabsTrigger 
                value="user" 
                className="rounded-[2rem] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-2xl font-black text-[11px] uppercase tracking-widest gap-4 transition-all"
              >
                <UserIcon className="h-5 w-5" />
                Member
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="rounded-[2rem] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-2xl font-black text-[11px] uppercase tracking-widest gap-4 transition-all"
              >
                <ShieldCheck className="h-5 w-5" />
                Admin
              </TabsTrigger>
            </TabsList>

            <div className="p-12 md:p-16 space-y-12">
                <TabsContent value="user" className="mt-0 space-y-12 animate-in slide-in-from-left-12 duration-700">
                    <div className="text-center space-y-4">
                        <h3 className="text-4xl font-black text-primary italic uppercase tracking-tighter">Student & Staff</h3>
                        <p className="text-lg text-muted-foreground font-medium italic opacity-80">Log your academic presence using official credentials.</p>
                    </div>

                    <div className="space-y-6">
                      <Button 
                          onClick={handleLogin} 
                          variant="outline"
                          size="lg"
                          className="w-full h-20 text-xl font-black gap-5 border-2 hover:bg-muted transition-all rounded-[2rem] shadow-lg group"
                      >
                          <Image src="https://www.google.com/favicon.ico" alt="Google" width={28} height={28} className="group-hover:scale-125 transition-transform duration-500" />
                          Sign in with Google
                      </Button>

                      <div className="relative py-6">
                          <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t-2 border-muted" />
                          </div>
                          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.6em]">
                              <span className="bg-white/90 backdrop-blur-md px-8 text-muted-foreground/60 rounded-full">OR SMART LOG</span>
                          </div>
                      </div>

                      <Button 
                          variant="neuSecondary"
                          size="lg"
                          onClick={handleRFIDTap}
                          disabled={isScanning}
                          className="w-full h-24 gap-6 rounded-[2.5rem] group relative overflow-hidden shadow-3xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-500"
                      >
                          {isScanning ? (
                            <div className="flex items-center gap-6">
                              <Loader2 className="h-10 w-10 animate-spin text-primary" />
                              <span className="animate-pulse text-2xl font-black">SCANNING ID...</span>
                            </div>
                          ) : (
                            <>
                              <Scan className="h-10 w-10 group-hover:scale-125 transition-transform duration-700" />
                              <span className="text-2xl font-black uppercase tracking-tight italic">Tap Physical ID Card</span>
                            </>
                          )}
                          {isScanning && <div className="absolute inset-x-0 bottom-0 h-3 bg-primary/20 animate-shimmer" />}
                      </Button>
                    </div>

                    <div className="p-8 bg-primary/5 rounded-[2.5rem] flex items-start gap-6 text-[13px] text-primary/80 leading-relaxed border border-primary/10 italic animate-pulse">
                        <Sparkles className="h-6 w-6 mt-1 shrink-0 text-secondary" />
                        <span className="font-medium">Use your <strong>@neu.edu.ph</strong> email for automatic department syncing. First-time users will undergo one-time ID verification.</span>
                    </div>
                </TabsContent>

                <TabsContent value="admin" className="mt-0 space-y-12 animate-in slide-in-from-right-12 duration-700">
                    <div className="text-center space-y-4">
                        <h3 className="text-4xl font-black text-primary italic uppercase tracking-tighter">Administrator</h3>
                        <p className="text-lg text-muted-foreground font-medium italic opacity-80">Authorized personnel and faculty console access.</p>
                    </div>

                    <div className="space-y-6">
                        <Button 
                            onClick={handleLogin} 
                            variant="outline"
                            size="lg"
                            className="w-full h-20 text-xl font-black gap-5 border-2 hover:bg-muted transition-all rounded-[2rem] shadow-lg"
                        >
                            <Image src="https://www.google.com/favicon.ico" alt="Google" width={28} height={28} />
                            Admin Google Access
                        </Button>

                        <div className="relative py-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t-2 border-muted" />
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.6em]">
                                <span className="bg-white/90 backdrop-blur-md px-8 text-muted-foreground/60 rounded-full">SECURED PATH</span>
                            </div>
                        </div>

                        <Button 
                            onClick={handleLogin} 
                            variant="neu"
                            size="lg"
                            className="w-full h-24 gap-6 rounded-[2.5rem] shadow-[0_32px_80px_-16px_rgba(0,77,38,0.4)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-500"
                        >
                            <ShieldCheck className="h-10 w-10 text-secondary" />
                            <span className="text-2xl font-black uppercase tracking-tight italic">Admin Authorization</span>
                        </Button>
                    </div>
                </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-12 border-t bg-muted/20 flex flex-col items-center gap-10">
            <div className="flex gap-12">
                {['Support', 'Privacy', 'Compliance'].map((text) => (
                    <button key={text} className="text-[11px] font-black text-muted-foreground/60 hover:text-primary uppercase tracking-[0.3em] transition-all hover:translate-y-[-1px]">{text}</button>
                ))}
            </div>
            <p className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.8em] animate-pulse">
                &copy; {new Date().getFullYear()} NEW ERA UNIVERSITY
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}