"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { LogIn, GraduationCap, ArrowLeft, Fingerprint, Mail } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface LoginScreenProps {
  onBack: () => void;
}

export function LoginScreen({ onBack }: LoginScreenProps) {
  const { login } = useAuth();
  const bgImage = PlaceHolderImages.find(img => img.id === 'neu-campus');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage?.imageUrl})` }}
    >
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" />
      
      <Card className="w-full max-w-lg relative z-10 shadow-2xl border-none overflow-hidden rounded-2xl">
        <div className="bg-primary p-6 text-center space-y-2">
            <Button 
                variant="ghost" 
                size="sm" 
                className="absolute left-4 top-4 text-white hover:bg-white/10"
                onClick={onBack}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            <div className="mx-auto w-20 h-20 relative rounded-full overflow-hidden border-4 border-secondary shadow-lg bg-white">
                <Image 
                    src={logoImage?.imageUrl || "https://picsum.photos/seed/neu/200/200"} 
                    alt="NEU Logo" 
                    fill 
                    className="object-contain p-2"
                />
            </div>
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Login to NEU Library Visitor Log</CardTitle>
        </div>
        
        <CardContent className="p-8 space-y-6">
          <Button 
            onClick={login} 
            variant="outline"
            className="w-full h-12 text-base font-semibold gap-3 border-2 hover:bg-muted transition-all"
          >
            <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or with Student ID</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full h-12 gap-2 bg-secondary hover:bg-secondary/90 text-primary font-bold">
                <Fingerprint className="h-5 w-5" />
                Login with RFID Card
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
                <Button variant="ghost" className="text-xs">Guest Visit</Button>
                <Button variant="ghost" className="text-xs">Forgot Password?</Button>
            </div>
          </div>

          <div className="pt-4 text-center border-t">
            <button className="text-sm font-bold text-primary hover:underline">
              Create an Account
            </button>
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3 text-xs text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            Use your @neu.edu.ph institutional email to sign in.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}