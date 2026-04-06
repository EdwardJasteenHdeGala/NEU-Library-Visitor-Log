
"use client"

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const libraryBg = PlaceHolderImages.find(img => img.id === 'library-bg');

  const AUTHORIZED_EMAILS = [
    "edwardjasteen.degala@neu.edu.ph",
    "jcesperanza@neu.edu.ph"
  ];

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email?.endsWith("@neu.edu.ph")) {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Institutional email required. Please use your @neu.edu.ph account.",
        });
        return;
      }

      // Check existing users table which is the source of truth for administrative roles in the current rules.
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      const isSuperAdmin = user.email && AUTHORIZED_EMAILS.includes(user.email);
      const userData = userSnap.exists() ? userSnap.data() : null;
      const hasAdminRole = userData && (userData.role === 'admin' || userData.role === 'superadmin');

      if (!isSuperAdmin && !hasAdminRole) {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You are not authorized to access the Admin Portal.",
        });
        return;
      }

      toast({
        title: "Access Granted",
        description: `Welcome, Administrator ${user.displayName || ""}.`,
      });
      router.push('/admin');
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        setIsProcessing(false);
        return;
      }
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      {libraryBg && (
        <Image 
          src={libraryBg.imageUrl} 
          alt="NEU Background" 
          fill 
          className="object-cover"
          priority
        />
      )}
      
      <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-[2px]" />

      <button 
        onClick={() => router.push('/')}
        aria-label="Back to home"
        title="Back to home"
        className="fixed top-6 left-6 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white hover:bg-white/30 transition-all shadow-xl"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <Card className="relative z-10 w-full max-w-[340px] shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/40 bg-white/40 backdrop-blur-xl p-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardContent className="p-10 space-y-10 text-center">
          <div className="space-y-1">
            <h1 className="text-slate-900 text-[10px] font-black tracking-widest uppercase leading-relaxed">
              SIGN IN WITH YOUR AUTHORIZED NEU
            </h1>
            <h1 className="text-slate-900 text-[10px] font-black tracking-widest uppercase leading-relaxed">
              ADMINISTRATOR ACCOUNT
            </h1>
          </div>

          <div className="flex justify-center">
            <Button 
              type="button"
              aria-label="Sign in with Google"
              title="Sign in with Google"
              className="w-full h-10 rounded-xl bg-white/60 hover:bg-white/80 text-primary font-black text-[9px] tracking-widest uppercase gap-3 shadow-lg transition-all active:scale-95 backdrop-blur-md border border-white/40"
              onClick={handleGoogleLogin}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="relative w-4 h-4">
                    <Image 
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                      alt="Google" 
                      fill
                      className="object-contain"
                    />
                  </div>
                  ADMIN GOOGLE LOGIN
                </>
              )}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="h-[1px] w-full bg-black/10" />
            <div className="text-center">
              <p className="text-slate-800 text-[7px] font-black tracking-widest uppercase leading-relaxed opacity-70">
                SECURITY WARNING: UNAUTHORIZED ACCESS ATTEMPTS ARE
              </p>
              <p className="text-slate-800 text-[7px] font-black tracking-widest uppercase leading-relaxed opacity-70">
                MONITORED AND LOGGED.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="absolute bottom-6 text-center w-full z-10">
        <p className="text-white/40 text-[7px] font-black tracking-[0.5em] uppercase">
          NEW ERA UNIVERSITY | SECURITY PROTOCOL V.2.1
        </p>
      </div>
    </div>
  );
}
