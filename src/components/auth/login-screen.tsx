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
  UserCheck
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

  const handleLogin = async (role: 'user' | 'admin' | 'guest') => {
    await login(role);
  };

  const handleRFIDTap = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "ID Recognized",
        description: "Institutional credentials verified. Syncing...",
      });
      handleLogin('user');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 neu-background">
      <Card className="w-full max-w-md overflow-hidden shadow-2xl border-none rounded-[2rem] bg-white/80 backdrop-blur-md">
        <CardHeader className="bg-primary text-white text-center py-10 space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-10" />
          <div className="mx-auto w-20 h-20 bg-white p-3 rounded-2xl shadow-xl relative z-10">
            <Image 
              src={logoImage?.imageUrl || ""} 
              alt="NEU Logo" 
              width={64} 
              height={64} 
              className="object-contain"
            />
          </div>
          <div className="space-y-1 relative z-10">
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Institutional Gateway</CardTitle>
            <CardDescription className="text-primary-foreground/70 font-black text-[10px] uppercase tracking-[0.3em]">Access Synchronization</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-4 top-4 text-white hover:bg-white/10 rounded-xl"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="user" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 rounded-none h-14 bg-muted/20">
              <TabsTrigger value="user" className="gap-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Portal Entry
              </TabsTrigger>
              <TabsTrigger value="guest" className="gap-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Guest Access
              </TabsTrigger>
            </TabsList>

            <div className="p-10 space-y-8">
              <TabsContent value="user" className="mt-0 space-y-8 animate-in slide-in-from-left-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-primary italic uppercase tracking-tighter">Member Access</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Use your @neu.edu.ph account</p>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={() => handleLogin('user')} 
                    variant="outline"
                    className="w-full h-16 font-black text-xs uppercase tracking-widest gap-4 border-2 rounded-2xl hover:scale-[1.02] transition-transform"
                  >
                    <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
                    Institutional Sign In
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t-2 border-muted" />
                    </div>
                    <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]">
                      <span className="bg-white px-6 text-muted-foreground">RFID Sync</span>
                    </div>
                  </div>

                  <Button 
                    variant="neu"
                    onClick={handleRFIDTap}
                    disabled={isScanning}
                    className="w-full h-16 gap-4 rounded-2xl shadow-xl"
                  >
                    {isScanning ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Scan className="h-6 w-6 text-secondary" />
                    )}
                    SCAN ID CARD
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="guest" className="mt-0 space-y-8 animate-in slide-in-from-right-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-primary italic uppercase tracking-tighter">Visitor Inquiry</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Limited access for external visitors</p>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={() => handleLogin('guest')} 
                    variant="outline"
                    className="w-full h-16 font-black text-xs uppercase tracking-widest gap-4 border-2 rounded-2xl"
                  >
                    <UserCheck className="h-6 w-6 text-primary" />
                    Continue as Guest
                  </Button>
                  
                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-[10px] font-medium text-primary/80 leading-relaxed italic text-center">
                        Guests are required to log their entry manually for security synchronization.
                      </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-6 bg-slate-50 border-t text-center">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">
              &copy; {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}