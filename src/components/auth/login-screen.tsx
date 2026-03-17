
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { LogIn, GraduationCap } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function LoginScreen() {
  const { login } = useAuth();
  const heroImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://picsum.photos/seed/neu-bg/1920/1080')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 relative rounded-full overflow-hidden border-4 border-primary shadow-lg">
            <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/neu/200/200"} 
                alt="NEU Hub" 
                fill 
                className="object-cover"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold text-primary tracking-tight">NEU Access Hub</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Library Visitor Management System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p>Access is exclusively for students and staff with an active <strong>@neu.edu.ph</strong> institutional account.</p>
          </div>
          <Button 
            onClick={login} 
            className="w-full h-12 text-lg font-semibold gap-3 transition-all active:scale-95"
          >
            <LogIn className="h-5 w-5" />
            Sign in with Google
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to follow the NEU Library policies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
