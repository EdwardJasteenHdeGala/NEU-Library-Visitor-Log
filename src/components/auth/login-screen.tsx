
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
  Search
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface LoginScreenProps {
  onBack: () => void;
}

export function LoginScreen({ onBack }: LoginScreenProps) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("user");
  
  const bgImage = PlaceHolderImages.find(img => img.id === 'neu-campus');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleLogin = async () => {
    // Both tabs currently use the same institutional Google sign-in
    // the system determines role post-authentication
    await login();
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: `url(${bgImage?.imageUrl})` }}
      data-ai-hint={bgImage?.imageHint}
    >
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-md" />
      
      <Card className="w-full max-w-lg relative z-10 shadow-2xl border-none overflow-hidden rounded-2xl animate-in fade-in zoom-in duration-500">
        <div className="bg-primary p-6 text-center space-y-4 relative">
            <Button 
                variant="ghost" 
                size="sm" 
                className="absolute left-4 top-4 text-white hover:bg-white/10"
                onClick={onBack}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            
            <div className="mx-auto w-24 h-24 relative rounded-full overflow-hidden border-4 border-secondary shadow-xl bg-white p-2">
                <Image 
                    src={logoImage?.imageUrl || "https://picsum.photos/seed/neu/200/200"} 
                    alt="NEU Logo" 
                    fill 
                    className="object-contain p-2"
                    data-ai-hint={logoImage?.imageHint}
                />
            </div>
            
            <div className="space-y-1">
                <CardTitle className="text-2xl font-black text-white tracking-tight uppercase">
                    NEU Access Hub
                </CardTitle>
                <p className="text-secondary font-bold text-xs tracking-[0.2em] uppercase">
                    Institutional Library System
                </p>
            </div>
        </div>
        
        <CardContent className="p-0">
          <Tabs defaultValue="user" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 rounded-none p-0">
              <TabsTrigger 
                value="user" 
                className="rounded-none data-[state=active]:bg-white data-[state=active]:text-primary font-black text-xs uppercase tracking-widest gap-2"
              >
                <UserIcon className="h-4 w-4" />
                User Login
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="rounded-none data-[state=active]:bg-white data-[state=active]:text-primary font-black text-xs uppercase tracking-widest gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Login
              </TabsTrigger>
            </TabsList>

            <div className="p-8 space-y-6">
                <TabsContent value="user" className="mt-0 space-y-6 animate-in slide-in-from-left-4 duration-300">
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-primary">Student & Staff Portal</h3>
                        <p className="text-sm text-muted-foreground">Log your visit using your institutional credentials.</p>
                    </div>

                    <Button 
                        onClick={handleLogin} 
                        className="w-full h-14 text-lg font-black gap-3 bg-white border-2 border-primary/20 hover:bg-muted text-primary transition-all shadow-sm"
                    >
                        <Image src="https://www.google.com/favicon.ico" alt="Google" width={24} height={24} />
                        Sign in with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                            <span className="bg-card px-4 text-muted-foreground">Or Use ID Card</span>
                        </div>
                    </div>

                    <Button className="w-full h-14 gap-3 bg-secondary hover:bg-secondary/90 text-primary font-black text-lg shadow-lg group">
                        <Fingerprint className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        Tap RFID School ID
                    </Button>

                    <div className="p-4 bg-primary/5 rounded-xl flex items-start gap-3 text-xs text-primary leading-relaxed border border-primary/10">
                        <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>Please use your <strong>@neu.edu.ph</strong> email address. For first-time users, have your Student ID ready for verification.</span>
                    </div>
                </TabsContent>

                <TabsContent value="admin" className="mt-0 space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-primary">Administrator Console</h3>
                        <p className="text-sm text-muted-foreground">Authorized personnel and faculty login only.</p>
                    </div>

                    <div className="space-y-4">
                        <Button 
                            onClick={handleLogin} 
                            className="w-full h-14 text-lg font-black gap-3 bg-white border-2 border-primary/20 hover:bg-muted text-primary transition-all shadow-sm"
                        >
                            <Image src="https://www.google.com/favicon.ico" alt="Google" width={24} height={24} />
                            Admin Google Sign-in
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted-foreground/20" />
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                                <span className="bg-card px-4 text-muted-foreground">Or Direct Access</span>
                            </div>
                        </div>

                        <Button 
                            onClick={handleLogin} 
                            className="w-full h-14 text-lg font-black gap-3 bg-primary text-white hover:bg-primary/90 transition-all shadow-xl"
                        >
                            <ShieldCheck className="h-6 w-6 text-secondary" />
                            Admin Authorization
                        </Button>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="p-4 bg-muted rounded-xl border-l-4 border-secondary space-y-1">
                            <p className="font-bold text-xs text-primary uppercase">Security Note</p>
                            <p className="text-[11px] text-muted-foreground">Role permissions are verified against the institutional database. Unauthorized access attempts are logged.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="text-[10px] font-black uppercase h-10 tracking-wider">
                                System Status
                            </Button>
                            <Button variant="outline" className="text-[10px] font-black uppercase h-10 tracking-wider">
                                IT Support
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-6 border-t bg-muted/20 flex flex-col items-center gap-4">
            <div className="flex gap-4">
                <button className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-wider">Help Center</button>
                <button className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-wider">Privacy Policy</button>
                <button className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-wider">Terms of Use</button>
            </div>
            <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} New Era University
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
