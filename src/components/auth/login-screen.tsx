"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogIn, 
  ArrowLeft, 
  ShieldCheck, 
  User as UserIcon,
  Loader2,
  Scan,
  Lock
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
        title: "Authenticated",
        description: "Institutional credentials verified. Logging in...",
      });
      handleLogin();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 neu-background">
      <Card className="w-full max-w-md overflow-hidden shadow-lg border-border">
        <CardHeader className="bg-primary text-white text-center py-8 space-y-4">
          <div className="mx-auto w-16 h-16 bg-white p-2 rounded-lg shadow-sm">
            <Image 
              src={logoImage?.imageUrl || ""} 
              alt="NEU Logo" 
              width={48} 
              height={48} 
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Institutional Login</CardTitle>
            <CardDescription className="text-primary-foreground/70 font-medium">Secure Access Gateway</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-4 top-4 text-white hover:bg-white/10"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="user" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 rounded-none h-12">
              <TabsTrigger value="user" className="gap-2 text-xs font-bold uppercase tracking-widest">
                Member
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2 text-xs font-bold uppercase tracking-widest">
                Administrator
              </TabsTrigger>
            </TabsList>

            <div className="p-8 space-y-6">
              <TabsContent value="user" className="mt-0 space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-primary">Member Access</h3>
                  <p className="text-xs text-muted-foreground font-medium">Log in using institutional credentials.</p>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handleLogin} 
                    variant="outline"
                    className="w-full h-12 font-bold gap-3 border-2"
                  >
                    <Image src="https://www.google.com/favicon.ico" alt="Google" width={16} height={16} />
                    Sign in with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="bg-white px-3 text-muted-foreground">Or Use ID Card</span>
                    </div>
                  </div>

                  <Button 
                    variant="neu"
                    onClick={handleRFIDTap}
                    disabled={isScanning}
                    className="w-full h-12 gap-3"
                  >
                    {isScanning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Scan className="h-5 w-5" />
                    )}
                    Scan ID Card
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="mt-0 space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-primary">Admin Console</h3>
                  <p className="text-xs text-muted-foreground font-medium">Authorized personnel only.</p>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handleLogin} 
                    variant="outline"
                    className="w-full h-12 font-bold gap-3 border-2"
                  >
                    <Image src="https://www.google.com/favicon.ico" alt="Google" width={16} height={16} />
                    Admin Login
                  </Button>

                  <Button 
                    onClick={handleLogin} 
                    className="w-full h-12 gap-3 font-bold"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Administrator Console
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-4 bg-muted/30 border-t text-center space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              &copy; {new Date().getFullYear()} New Era University
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}