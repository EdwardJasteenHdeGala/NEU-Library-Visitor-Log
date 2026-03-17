"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogIn, 
  ArrowLeft, 
  Mail, 
  ShieldCheck, 
  User as UserIcon,
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
        title: "Identity Authenticated",
        description: "Institutional credentials verified. Synchronizing Hub session...",
      });
      handleLogin();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-background overflow-hidden neu-mesh-gradient relative">
      <div className="neu-bg-overlay" />

      {/* Optimized Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-secondary/10 rounded-full blur-[80px] md:blur-[120px] animate-blob delay-2000" />
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />

      <Card className="w-full max-w-xl relative z-10 shadow-2xl border-none overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white/80 backdrop-blur-3xl animate-in fade-in zoom-in duration-700">
        <div className="bg-primary p-8 md:p-12 text-center space-y-6 md:space-y-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <Button 
                variant="ghost" 
                size="sm" 
                className="absolute left-4 md:left-8 top-4 md:top-8 text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-9 md:h-10 px-4 md:px-6 transition-all z-20 font-black text-[9px] md:text-[10px] uppercase tracking-widest"
                onClick={onBack}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return
            </Button>
            
            <div className="mx-auto w-24 h-24 md:w-32 md:h-32 relative rounded-2xl md:rounded-[2rem] overflow-hidden border-2 border-secondary/40 shadow-2xl bg-white p-3 md:p-4 group transition-transform duration-500 hover:scale-105">
                <Image 
                    src={logoImage?.imageUrl || ""} 
                    alt="NEU Logo" 
                    fill 
                    priority
                    className="object-contain p-2 md:p-3 group-hover:scale-110 transition-transform duration-700"
                />
            </div>
            
            <div className="space-y-2 md:space-y-4">
                <div className="inline-flex items-center gap-2 md:gap-3 bg-white/10 text-white/90 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em]">
                   <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-secondary" />
                   Institutional Gateway
                </div>
                <CardTitle className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-md">
                    Secure <br /> Login
                </CardTitle>
            </div>
        </div>
        
        <CardContent className="p-0">
          <Tabs defaultValue="user" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-16 md:h-20 bg-muted/40 p-2 rounded-none">
              <TabsTrigger 
                value="user" 
                className="rounded-xl md:rounded-[1.5rem] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-2 md:gap-3 transition-all"
              >
                <UserIcon className="h-3 w-3 md:h-4 md:w-4" />
                Member
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="rounded-xl md:rounded-[1.5rem] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-2 md:gap-3 transition-all"
              >
                <ShieldCheck className="h-3 w-3 md:h-4 md:w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <div className="p-6 md:p-14 space-y-8 md:space-y-12">
                <TabsContent value="user" className="mt-0 space-y-8 md:space-y-12 animate-in slide-in-from-left-8 duration-700">
                    <div className="text-center space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-3xl font-black text-primary italic uppercase tracking-tighter">Academic Portal</h3>
                        <p className="text-base md:text-lg text-muted-foreground font-medium italic opacity-70 leading-tight">Log your presence using official credentials.</p>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                      <Button 
                          onClick={handleLogin} 
                          variant="outline"
                          size="lg"
                          className="w-full h-14 md:h-16 text-base md:text-lg font-black gap-3 md:gap-4 border-2 hover:bg-muted transition-all rounded-xl md:rounded-[1.5rem] shadow-sm group"
                      >
                          <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} className="md:w-6 md:h-6 group-hover:scale-125 transition-transform duration-500" />
                          Sign in with Google
                      </Button>

                      <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-muted" />
                          </div>
                          <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em]">
                              <span className="bg-white px-4 md:px-8 text-muted-foreground/50 rounded-full">Institutional Access</span>
                          </div>
                      </div>

                      <Button 
                          variant="neuSecondary"
                          size="lg"
                          onClick={handleRFIDTap}
                          disabled={isScanning}
                          className="w-full h-16 md:h-20 gap-3 md:gap-5 rounded-2xl md:rounded-[2rem] group relative overflow-hidden shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-500"
                      >
                          {isScanning ? (
                            <div className="flex items-center gap-3 md:gap-5">
                              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
                              <span className="animate-pulse text-base md:text-xl font-black">AUTHENTICATING...</span>
                            </div>
                          ) : (
                            <>
                              <Scan className="h-6 w-6 md:h-8 md:w-8 group-hover:scale-110 transition-transform duration-700" />
                              <span className="text-base md:text-xl font-black uppercase tracking-tight italic">Scan Physical ID Card</span>
                            </>
                          )}
                          {isScanning && <div className="absolute inset-x-0 bottom-0 h-1.5 bg-primary/10 animate-pulse" />}
                      </Button>
                    </div>

                    <div className="p-4 md:p-6 bg-primary/5 rounded-2xl flex items-start gap-3 md:gap-4 text-[10px] md:text-[12px] text-primary/70 leading-relaxed border border-primary/10 italic">
                        <Sparkles className="h-4 w-4 md:h-5 md:w-5 mt-0.5 shrink-0 text-secondary" />
                        <span className="font-medium">Use your <strong>@neu.edu.ph</strong> email for seamless institutional synchronization. First-time users will undergo one-time ID verification.</span>
                    </div>
                </TabsContent>

                <TabsContent value="admin" className="mt-0 space-y-8 md:space-y-12 animate-in slide-in-from-right-8 duration-700">
                    <div className="text-center space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-3xl font-black text-primary italic uppercase tracking-tighter">Administration</h3>
                        <p className="text-base md:text-lg text-muted-foreground font-medium italic opacity-70 leading-tight">Authorized console access for faculty and staff.</p>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        <Button 
                            onClick={handleLogin} 
                            variant="outline"
                            size="lg"
                            className="w-full h-14 md:h-16 text-base md:text-lg font-black gap-3 md:gap-4 border-2 hover:bg-muted transition-all rounded-xl md:rounded-[1.5rem] shadow-sm"
                        >
                            <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} className="md:w-6 md:h-6" />
                            Admin Google Login
                        </Button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.5em]">
                                <span className="bg-white px-6 md:px-8 text-muted-foreground/50 rounded-full">Authorized Only</span>
                            </div>
                        </div>

                        <Button 
                            onClick={handleLogin} 
                            variant="neu"
                            size="lg"
                            className="w-full h-16 md:h-20 gap-3 md:gap-5 rounded-2xl md:rounded-[2rem] shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-500"
                        >
                            <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                            <span className="text-base md:text-xl font-black uppercase tracking-tight italic">Admin Verification</span>
                        </Button>
                    </div>
                </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-8 md:p-10 border-t bg-muted/20 flex flex-col items-center gap-6 md:gap-8">
            <div className="flex gap-6 md:gap-10">
                {['Support', 'Privacy', 'Integrity'].map((text) => (
                    <button key={text} className="text-[8px] md:text-[10px] font-black text-muted-foreground/40 hover:text-primary uppercase tracking-[0.3em] transition-all">{text}</button>
                ))}
            </div>
            <p className="text-[8px] text-muted-foreground/20 font-black uppercase tracking-[0.6em] md:tracking-[0.8em] animate-pulse">
                &copy; {new Date().getFullYear()} NEW ERA UNIVERSITY
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}