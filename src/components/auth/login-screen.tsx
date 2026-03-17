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
      {/* Animated Blobs for depth */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl animate-blob delay-2000" />
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />

      <Card className="w-full max-w-xl relative z-10 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.15)] border-none overflow-hidden rounded-[3.5rem] bg-white/80 backdrop-blur-2xl animate-in fade-in zoom-in duration-700">
        <div className="bg-primary p-12 text-center space-y-8 relative overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            <Button 
                variant="ghost" 
                size="sm" 
                className="absolute left-8 top-8 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl h-10 px-5 transition-all"
                onClick={onBack}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return
            </Button>
            
            <div className="mx-auto w-32 h-32 relative rounded-[2.5rem] overflow-hidden border-4 border-secondary/30 shadow-2xl bg-white p-4 group">
                <Image 
                    src={logoImage?.imageUrl || ""} 
                    alt="NEU Logo" 
                    fill 
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                />
            </div>
            
            <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                   <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                   Secure Access Gateway
                </div>
                <CardTitle className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                    Institutional <br /> Login
                </CardTitle>
            </div>
        </div>
        
        <CardContent className="p-0">
          <Tabs defaultValue="user" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-20 bg-muted/30 p-2 rounded-none">
              <TabsTrigger 
                value="user" 
                className="rounded-3xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-black text-[11px] uppercase tracking-widest gap-3 transition-all"
              >
                <UserIcon className="h-4 w-4" />
                Member
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="rounded-3xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-black text-[11px] uppercase tracking-widest gap-3 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <div className="p-12 space-y-10">
                <TabsContent value="user" className="mt-0 space-y-10 animate-in slide-in-from-left-8 duration-500">
                    <div className="text-center space-y-3">
                        <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter">Student & Staff</h3>
                        <p className="text-base text-muted-foreground font-medium italic">Log your academic presence using official credentials.</p>
                    </div>

                    <div className="space-y-6">
                      <Button 
                          onClick={handleLogin} 
                          variant="outline"
                          size="lg"
                          className="w-full h-16 text-lg font-black gap-4 border-2 hover:bg-muted transition-all rounded-3xl shadow-sm group"
                      >
                          <Image src="https://www.google.com/favicon.ico" alt="Google" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                          Sign in with Google
                      </Button>

                      <div className="relative py-4">
                          <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-muted-foreground/10" />
                          </div>
                          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.5em]">
                              <span className="bg-white/80 px-6 text-muted-foreground/50 backdrop-blur-sm">OR SMART LOG</span>
                          </div>
                      </div>

                      <Button 
                          variant="neuSecondary"
                          size="lg"
                          onClick={handleRFIDTap}
                          disabled={isScanning}
                          className="w-full h-20 gap-4 rounded-3xl group relative overflow-hidden shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                      >
                          {isScanning ? (
                            <div className="flex items-center gap-4">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <span className="animate-pulse text-xl">SCANNING ID...</span>
                            </div>
                          ) : (
                            <>
                              <Scan className="h-8 w-8 group-hover:scale-125 transition-transform duration-500" />
                              <span className="text-xl">Tap Physical ID Card</span>
                            </>
                          )}
                          {isScanning && <div className="absolute inset-x-0 bottom-0 h-2 bg-primary/20 animate-shimmer" />}
                      </Button>
                    </div>

                    <div className="p-6 bg-primary/5 rounded-[2rem] flex items-start gap-4 text-xs text-primary/80 leading-relaxed border border-primary/10 italic">
                        <Sparkles className="h-5 w-5 mt-0.5 shrink-0 text-secondary" />
                        <span className="font-medium">Use your <strong>@neu.edu.ph</strong> email for automatic department syncing. First-time users will undergo one-time ID verification.</span>
                    </div>
                </TabsContent>

                <TabsContent value="admin" className="mt-0 space-y-10 animate-in slide-in-from-right-8 duration-500">
                    <div className="text-center space-y-3">
                        <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter">Administrator</h3>
                        <p className="text-base text-muted-foreground font-medium italic">Authorized personnel and faculty console access.</p>
                    </div>

                    <div className="space-y-6">
                        <Button 
                            onClick={handleLogin} 
                            variant="outline"
                            size="lg"
                            className="w-full h-16 text-lg font-black gap-4 border-2 hover:bg-muted transition-all rounded-3xl shadow-sm"
                        >
                            <Image src="https://www.google.com/favicon.ico" alt="Google" width={24} height={24} />
                            Admin Google Access
                        </Button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted-foreground/10" />
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.5em]">
                                <span className="bg-white/80 px-6 text-muted-foreground/50 backdrop-blur-sm">SECURED PATH</span>
                            </div>
                        </div>

                        <Button 
                            onClick={handleLogin} 
                            variant="neu"
                            size="lg"
                            className="w-full h-20 gap-4 rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <ShieldCheck className="h-8 w-8 text-secondary" />
                            <span className="text-xl">Admin Authorization</span>
                        </Button>
                    </div>

                    <div className="p-6 bg-muted/50 rounded-[2rem] space-y-4 border border-muted-foreground/10">
                        <p className="font-black text-[10px] text-primary uppercase tracking-[0.3em]">Institutional Policy</p>
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic">Access to the administrative console is logged and audited. Multiple failed attempts will trigger a security lock.</p>
                    </div>
                </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-10 border-t bg-muted/10 flex flex-col items-center gap-8">
            <div className="flex gap-10">
                {['Support', 'Privacy', 'Compliance'].map((text) => (
                    <button key={text} className="text-[10px] font-black text-muted-foreground/60 hover:text-primary uppercase tracking-[0.2em] transition-colors">{text}</button>
                ))}
            </div>
            <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.6em] animate-pulse">
                &copy; {new Date().getFullYear()} NEW ERA UNIVERSITY
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}