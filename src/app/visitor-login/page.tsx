"use client"

import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, collection, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

type Step = 'form' | 'success';

export default function VisitorLoginPage() {
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const [idNumber, setIdNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [college, setCollege] = useState("");
  const [purpose, setPurpose] = useState("");
  const [inputMode, setInputMode] = useState<'id-tap' | 'student-number'>('student-number');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [countdown, setCountdown] = useState(5);

  const neuLogo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'success') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleReset();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step]);

  const handleReset = () => {
    setStep('form');
    setIdNumber("");
    setFirstName("");
    setLastName("");
    setCollege("");
    setPurpose("");
    setIsProcessing(false);
  };

  const checkBlocked = async (id: string) => {
    const docRef = doc(db, "visitors", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().isBlocked) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Your entry is currently blocked by the administrator.",
      });
      return true;
    }
    return false;
  };

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber || !firstName || !lastName || !college || !purpose) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all information." });
      return;
    }

    setIsProcessing(true);
    try {
      if (await checkBlocked(idNumber)) {
        setIsProcessing(false);
        return;
      }

      const fullName = `${firstName} ${lastName}`;
      const visitorRef = doc(db, "visitors", idNumber);
      
      // Upsert visitor profile
      await setDoc(visitorRef, {
        id: idNumber,
        name: fullName,
        college: college,
        isBlocked: false,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Create log
      await addDoc(collection(db, "visitors", idNumber, "visitLogs"), {
        visitorId: idNumber,
        timestamp: serverTimestamp(),
        purpose: purpose,
      });

      setStep('success');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email?.endsWith("@neu.edu.ph")) {
        await signOut(auth);
        toast({ variant: "destructive", title: "Invalid Account", description: "Please use your NEU institutional email." });
        setIsProcessing(false);
        return;
      }

      if (await checkBlocked(result.user.uid)) {
        await signOut(auth);
        setIsProcessing(false);
        return;
      }

      const fullName = result.user.displayName || "Institutional User";
      const visitorRef = doc(db, "visitors", result.user.uid);
      
      // Upsert visitor profile
      await setDoc(visitorRef, {
        id: result.user.uid,
        name: fullName,
        email: email,
        isBlocked: false,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Create log
      await addDoc(collection(db, "visitors", result.user.uid, "visitLogs"), {
        visitorId: result.user.uid,
        timestamp: serverTimestamp(),
        purpose: "General Access", // Default or we could ask for purpose
        authType: "Google"
      });

      setStep('success');
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center py-12 shadow-xl border-t-8 border-t-primary">
          <CardContent className="space-y-6">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Welcome to NEU Library!</h1>
              <p className="text-muted-foreground">Your entry has been successfully recorded.</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                System reset in {countdown}s
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Branded Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Image 
            src={neuLogo?.imageUrl || "https://picsum.photos/seed/neu-logo/200/200"} 
            alt="NEU Logo" 
            width={50} 
            height={50} 
            className="rounded-full border shadow-sm"
          />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-[#006400] leading-tight">NEW ERA UNIVERSITY LIBRARY</h1>
            <p className="text-xs md:text-sm font-semibold text-[#006400]/80 tracking-wide uppercase">Visitor Log System</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin-login')}
          className="rounded-full border-[#006400] text-[#006400] hover:bg-[#006400] hover:text-white px-6 font-bold"
        >
          ADMIN LOG
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-library">
        <Card className="w-full max-w-lg shadow-2xl rounded-[2.5rem] overflow-hidden border-none bg-white/95 backdrop-blur-sm">
          <CardContent className="p-10 space-y-8 flex flex-col items-center">
            <div className="bg-emerald-50 p-6 rounded-full">
              <ShieldAlert className="h-16 w-16 text-[#006400]" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Institutional Access Only</h2>
              <p className="text-slate-500 text-sm font-medium max-w-[280px] mx-auto">
                Please sign in with your <span className="text-[#006400] font-bold">@neu.edu.ph</span> Google account to record your entrance.
              </p>
            </div>

            <Button 
              className="w-full h-16 rounded-2xl bg-[#006400] hover:bg-[#005000] text-white font-black text-lg gap-4 shadow-xl active:scale-[0.98] transition-all"
              onClick={handleGoogleLogin}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Image 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google" 
                    width={24} 
                    height={24} 
                    className="bg-white p-1 rounded-sm"
                  />
                  SIGN IN WITH GOOGLE
                </>
              )}
            </Button>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Authorized by University Administration
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Navigation */}
      <button 
        onClick={() => router.push('/')}
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center text-slate-400 hover:text-[#006400] transition-all border border-slate-100 font-black text-xl hover:scale-110 active:scale-95"
      >
        N
      </button>
    </div>
  );
}
