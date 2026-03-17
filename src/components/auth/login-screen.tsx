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
      <div className="absolute top-[-5%] left-[-5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary/5 rounded-full blur-[80px] animate-blob" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-secondary/8 rounded-full blur-[80px] animate-blob delay-2000" />
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />

      <Card className="w-full max-w-lg relative z-10 shadow-2xl border-none overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white/80 backdrop-blur-2xl animate-in fade-in zoom-in duration-500">
        <div className="bg-primary p-8 md:p-10 text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <Button 
                variant="ghost" 
                size="sm" 
                className="absolute left-4 top-4 text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-8 px-3 transition-all z-20 font-black text-[9px] uppercase tracking-widest"
                onClick={onBack}
            >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Return
            </Button>
            
            <div className="mx-auto w-20 h-20 md:w-24 md:h-24 relative rounded-2xl overflow-hidden border-2 border-secondary/30 shadow-xl bg-white p-2 group transition-transform duration-300">
                <Image 
                    src={logoImage?.imageUrl || ""} 
                    alt="NEU Logo" 
                    fill 
                    priority
                    className="object-contain p-2"
                />
            </div>
            
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em]">
                   <ShieldCheck className="h-3 w-3 text-secondary" />
                   Institutional Gateway
                </div>
                <CardTitle className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                    Secure <br /> Access
                </CardTitle>
            </div>
        </div>
        
        <CardContent className="p-0">
          <Tabs defaultValue="user" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/40 p-1 rounded-none">
              <TabsTrigger 
                value="user" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-black text-[9px] uppercase tracking-widest gap-2 transition-all"
              >
                <UserIcon className="h-3.5 w-3.5" />
                Member
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-black text-[9px] uppercase tracking-widest gap-2 transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </TabsTrigger>
            </TabsList>

            <div className="p-6 md:p-10 space-y-8">
                <TabsContent value="user" className="mt-0 space-y-8 animate-in slide-in-from-left-4 duration-500">
                    <div className="text-center space-y-2">
                        <h3 className="text-xl md:text-2xl font-black text-primary italic uppercase tracking-tighter">Academic Portal</h3>
                        <p className="text-sm text-muted-foreground font-medium italic opacity-70">Log your presence using official credentials.</p>
                    </div>

                    <div className="space-y-4">
                      <Button 
                          onClick={handleLogin} 
                          variant="outline"
                          size="lg"
                          className="w-full h-14 text-sm font-black gap-3 border-2 hover:bg-muted transition-all rounded-xl shadow-sm group"
                      >
                          <Image src="https://www.google.com/favicon.ico" alt="Google" width={18} height={18} className="group-hover:scale-110 transition-transform" />
                          Sign in with Google
                      </Button>

                      <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-muted" />
                          </div>
                          <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em]">
                              <span className="bg-white px-4 text-muted-foreground/50 rounded-full">Institutional Access</span>
                          </div>
                      </div>

                      <Button 
                          variant="neuSecondary"
                          size="lg"
                          onClick={handleRFIDTap}
                          disabled={isScanning}
                          className="w-full h-16 gap-4 rounded-xl group relative overflow-hidden shadow-lg hover:scale-[1.01] transition-all duration-300"
                      >
                          {isScanning ? (
                            <div className="flex items-center gap-3">
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              <span className="animate-pulse text-sm font-black uppercase">Authenticating...</span>
                            </div>
                          ) : (
                            <>
                              <Scan className="h-6 w-6 group-hover:scale-110 transition-transform" />
                              <span className="text-lg font-black uppercase tracking-tight italic">Scan ID Card</span>
                            </>
                          )}
                      </Button>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-xl flex items-start gap-3 text-[10px] text-primary/70 leading-relaxed border border-primary/10 italic">
                        <Sparkles className="h-4 w-4 shrink-0 text-secondary" />
                        <span className="font-medium">Use your <strong>@neu.edu.ph</strong> email for institutional synchronization. Guests may use personal accounts.</span>
                    </div>
                </TabsContent>

                <TabsContent value="admin" className="mt-0 space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="text-center space-y-2">
                        <h3 className="text-xl md:text-2xl font-black text-primary italic uppercase tracking-tighter">Administration</h3>
                        <p className="text-sm text-muted-foreground font-medium italic opacity-70">Authorized console access for faculty and staff.</p>
                    </div>

                    <div className="space-y-4">
                        <Button 
                            onClick={handleLogin} 
                            variant="outline"
                            size="lg"
                            className="w-full h-14 text-sm font-black gap-3 border-2 hover:bg-muted transition-all rounded-xl shadow-sm"
                        >
                            <Image src="https://www.google.com/favicon.ico" alt="Google" width={18} height={18} />
                            Admin Google Login
                        </Button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em]">
                                <span className="bg-white px-4 text-muted-foreground/50 rounded-full">Authorized Personnel</span>
                            </div>
                        </div>

                        <Button 
                            onClick={handleLogin} 
                            variant="neu"
                            size="lg"
                            className="w-full h-16 gap-4 rounded-xl shadow-lg hover:scale-[1.01] transition-all"
                        >
                            <ShieldCheck className="h-6 w-6 text-secondary" />
                            <span className="text-lg font-black uppercase tracking-tight italic">Admin Console</span>
                        </Button>
                    </div>
                </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-6 border-t bg-muted/20 flex flex-col items-center gap-4">
            <div className="flex gap-8">
                {['Support', 'Privacy', 'Integrity'].map((text) => (
                    <button key={text} className="text-[9px] font-black text-muted-foreground/40 hover:text-primary uppercase tracking-[0.2em] transition-all">{text}</button>
                ))}
            </div>
            <p className="text-[8px] text-muted-foreground/20 font-black uppercase tracking-[0.5em]">
                &copy; {new Date().getFullYear()} NEW ERA UNIVERSITY
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}