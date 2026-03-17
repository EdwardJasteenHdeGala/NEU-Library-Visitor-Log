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
  Scan
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
  
  const bgImage = PlaceHolderImages.find(img => img.id === 'neu-campus');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleLogin = async () => {
    await login(activeTab as 'user' | 'admin');
  };

  const handleRFIDTap = () => {
    setIsScanning(true);
    // Simulate RFID scanning and department detection
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "ID Detected & Verified",
        description: "Institutional Identity Confirmed. Syncing College: CICS...",
      });
      // In a real app, this would trigger a specialized login flow
      handleLogin();
    }, 2500);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: `url(${bgImage?.imageUrl})` }}
      data-ai-hint={bgImage?.imageHint}
    >
      <div className="absolute inset-0 bg-primary/70 backdrop-blur-md" />
      
      <Card className="w-full max-w-lg relative z-10 shadow-2xl border-none overflow-hidden rounded-[2rem] animate-in fade-in zoom-in duration-500">
        <div className="bg-primary p-8 text-center space-y-6 relative">
            <Button 
                variant="ghost" 
                size="sm" 
                className="absolute left-6 top-6 text-white hover:bg-white/10 rounded-xl"
                onClick={onBack}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            
            <div className="mx-auto w-28 h-28 relative rounded-full overflow-hidden border-4 border-secondary shadow-2xl bg-white p-3">
                <Image 
                    src={logoImage?.imageUrl || "https://picsum.photos/seed/neu/200/200"} 
                    alt="NEU Logo" 
                    fill 
                    className="object-contain p-3"
                    data-ai-hint={logoImage?.imageHint}
                />
            </div>
            
            <div className="space-y-2">
                <CardTitle className="text-3xl font-black text-white tracking-tighter uppercase italic">
                    NEU Access Hub
                </CardTitle>
                <p className="text-secondary font-bold text-xs tracking-[0.3em] uppercase opacity-90">
                    Institutional Library System
                </p>
            </div>
        </div>
        
        <CardContent className="p-0">
          <Tabs defaultValue="user" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-16 bg-muted p-0 rounded-none border-b">
              <TabsTrigger 
                value="user" 
                className="rounded-none data-[state=active]:bg-white data-[state=active]:text-primary font-black text-xs uppercase tracking-widest gap-2 transition-all border-r"
              >
                <UserIcon className="h-4 w-4" />
                User Login
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="rounded-none data-[state=active]:bg-white data-[state=active]:text-primary font-black text-xs uppercase tracking-widest gap-2 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Login
              </TabsTrigger>
            </TabsList>

            <div className="p-10 space-y-8">
                <TabsContent value="user" className="mt-0 space-y-8 animate-in slide-in-from-left-4 duration-300">
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-primary italic uppercase">Student & Staff Portal</h3>
                        <p className="text-sm text-muted-foreground font-medium">Log your visit using your institutional credentials.</p>
                    </div>

                    <div className="space-y-4">
                      <Button 
                          onClick={handleLogin} 
                          variant="outline"
                          size="lg"
                          className="w-full h-14 text-base font-black gap-3 border-2 hover:bg-muted transition-all rounded-2xl"
                      >
                          <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
                          Sign in with Google
                      </Button>

                      <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-muted-foreground/10" />
                          </div>
                          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                              <span className="bg-white px-4 text-muted-foreground/60">Or Use ID Card</span>
                          </div>
                      </div>

                      <Button 
                          variant="neuSecondary"
                          size="lg"
                          onClick={handleRFIDTap}
                          disabled={isScanning}
                          className="w-full h-16 gap-3 rounded-2xl group relative overflow-hidden shadow-lg hover:shadow-secondary/20"
                      >
                          {isScanning ? (
                            <>
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              <span className="animate-pulse">ID SCANNING...</span>
                            </>
                          ) : (
                            <>
                              <Scan className="h-6 w-6 group-hover:scale-110 transition-transform" />
                              Tap RFID School ID
                            </>
                          )}
                          {isScanning && <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 animate-shimmer" />}
                      </Button>
                    </div>

                    <div className="p-5 bg-primary/5 rounded-2xl flex items-start gap-4 text-xs text-primary/80 leading-relaxed border border-primary/10">
                        <Mail className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                        <span className="font-medium">Please use your <strong>@neu.edu.ph</strong> email address if possible. First-time users must verify their ID.</span>
                    </div>
                </TabsContent>

                <TabsContent value="admin" className="mt-0 space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-primary italic uppercase">Administrator Console</h3>
                        <p className="text-sm text-muted-foreground font-medium">Authorized personnel and faculty login only.</p>
                    </div>

                    <div className="space-y-5">
                        <Button 
                            onClick={handleLogin} 
                            variant="outline"
                            size="lg"
                            className="w-full h-14 text-base font-black gap-3 border-2 hover:bg-muted transition-all rounded-2xl"
                        >
                            <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
                            Admin Google Sign-in
                        </Button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted-foreground/10" />
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                                <span className="bg-white px-4 text-muted-foreground/60">Or Direct Access</span>
                            </div>
                        </div>

                        <Button 
                            onClick={handleLogin} 
                            variant="neu"
                            size="lg"
                            className="w-full h-16 gap-3 rounded-2xl shadow-lg"
                        >
                            <ShieldCheck className="h-6 w-6 text-secondary" />
                            Admin Authorization
                        </Button>
                    </div>

                    <div className="p-5 bg-muted/50 rounded-2xl space-y-3">
                        <p className="font-black text-[10px] text-primary uppercase tracking-[0.2em]">Security Protocol</p>
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Role permissions are verified against the institutional database. Unauthorized access attempts are logged for audit.</p>
                    </div>
                </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-8 border-t bg-muted/30 flex flex-col items-center gap-6">
            <div className="flex gap-8">
                <button className="text-[10px] font-black text-muted-foreground/80 hover:text-primary uppercase tracking-widest transition-colors">Help Center</button>
                <button className="text-[10px] font-black text-muted-foreground/80 hover:text-primary uppercase tracking-widest transition-colors">Privacy Policy</button>
                <button className="text-[10px] font-black text-muted-foreground/80 hover:text-primary uppercase tracking-widest transition-colors">Terms of Use</button>
            </div>
            <p className="text-[9px] text-muted-foreground/50 font-black uppercase tracking-[0.4em]">
                &copy; {new Date().getFullYear()} New Era University
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
