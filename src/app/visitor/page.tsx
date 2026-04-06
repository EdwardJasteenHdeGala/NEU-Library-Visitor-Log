
"use client"

import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ArrowLeft, ShieldAlert } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function UserRegistrationPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [idNumber, setIdNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [classification, setClassification] = useState("");
  const [college, setCollege] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'login' | 'form' | 'success' | 'blocked'>('login');
  const [countdown, setCountdown] = useState(5);

  const libraryBg = PlaceHolderImages.find(img => img.id === 'library-bg');

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        if (user.email?.endsWith("@neu.edu.ph")) {
          const names = user.displayName?.split(" ") || [];
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(" ") || "");
          
          const checkStatus = async () => {
            const docRef = doc(db, "visitors", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().isBlocked) {
              await signOut(auth);
              setStep('blocked');
            } else {
              setStep('form');
            }
          };
          checkStatus();
        } else {
          signOut(auth);
          setStep('login');
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Please use your official @neu.edu.ph account.",
          });
        }
      } else if (step !== 'success' && step !== 'blocked') {
        setStep('login');
      }
    }
  }, [user, isUserLoading, db, auth, toast, step]);

  const handleReset = React.useCallback(async () => {
    await signOut(auth);
    setStep('login');
    setIdNumber("");
    setFirstName("");
    setLastName("");
    setClassification("");
    setCollege("");
    setPurpose("");
    setCountdown(5);
    setIsProcessing(false);
  }, [auth]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'success' || step === 'blocked') {
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
  }, [step, handleReset]);


  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        setIsProcessing(false);
        return;
      }
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!firstName || !lastName || !college || !purpose || !classification || !idNumber) {
      toast({ 
        variant: "destructive", 
        title: "Information Required", 
        description: "Please complete all fields to validate your entry." 
      });
      return;
    }

    setIsProcessing(true);
    const visitorId = user.uid;
    const fullName = `${firstName} ${lastName}`;
    const visitorRef = doc(db, "visitors", visitorId);
    
    const visitorData = {
      id: visitorId,
      studentId: idNumber, 
      name: fullName,
      college: college,
      classification: classification,
      isBlocked: false,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setDoc(visitorRef, visitorData, { merge: true })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: visitorRef.path,
          operation: 'write',
          requestResourceData: visitorData
        }));
      });

    const logData = {
      visitorId: visitorId,
      timestamp: serverTimestamp(),
      purpose: purpose,
      classification: classification,
    };
    const logRef = collection(db, "visitors", visitorId, "visitLogs");

    addDoc(logRef, logData)
      .then(() => {
        setStep('success');
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: logRef.path,
          operation: 'create',
          requestResourceData: logData
        }));
        setIsProcessing(false);
      });
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 relative">
        {libraryBg?.imageUrl ? (
          <Image src={libraryBg.imageUrl} alt="Background" fill className="object-cover opacity-30" />
        ) : (
          <div className="absolute inset-0 bg-black/40 opacity-30" />
        )}
        <Card className="relative z-10 w-full max-w-sm text-center py-8 shadow-2xl border border-white/40 animate-in zoom-in-95 duration-300 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl">
          <CardContent className="space-y-4">
            <div className="mx-auto bg-white/20 p-3 rounded-full w-fit">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-black text-white tracking-tight uppercase">Welcome to NEU Library!</h1>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20 flex flex-col items-center gap-1">
                <span className="text-[6px] font-black text-white/50 uppercase tracking-widest">Validated User</span>
                <p className="text-md font-black text-white leading-tight">{firstName} {lastName}</p>
                <p className="text-[7px] text-white/70 font-black uppercase tracking-widest">{college}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">
                System Resetting in {countdown}s
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-950/40 backdrop-blur-sm p-4 relative">
        {libraryBg?.imageUrl ? (
          <Image src={libraryBg.imageUrl} alt="Background" fill className="object-cover opacity-20" />
        ) : (
          <div className="absolute inset-0 bg-red-950/40 opacity-20" />
        )}
        <Card className="relative z-10 w-full max-w-sm text-center py-8 shadow-2xl border border-white/40 animate-in zoom-in-95 duration-300 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl">
          <CardContent className="space-y-4">
            <div className="mx-auto bg-red-100/20 p-3 rounded-full w-fit">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-black text-white tracking-tight uppercase">ACCESS DENIED</h1>
              <p className="text-white/80 text-[10px] font-bold uppercase">Account Restricted</p>
              <p className="text-[7px] text-white/50 font-black uppercase tracking-widest px-6 leading-relaxed mt-2">
                PLEASE CONTACT THE LIBRARY OFFICE TO RESOLVE YOUR ACCOUNT STATUS.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">
                Returning in {countdown}s
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {libraryBg?.imageUrl ? (
        <Image 
          src={libraryBg.imageUrl} 
          alt="NEU Background" 
          fill 
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900" />
      )}
      
      <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-[1px]" />

      <button 
        onClick={() => router.push('/')}
        className="fixed top-6 left-6 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white hover:bg-white/30 transition-all shadow-xl"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {step === 'login' ? (
          <Card className="w-full max-w-[340px] shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/30 bg-white/10 backdrop-blur-2xl p-1 animate-in fade-in zoom-in-95 duration-500">
            <CardContent className="p-10 space-y-10 text-center">
              <div className="space-y-1">
                <h1 className="text-xl font-black text-white tracking-tight uppercase">LIBRARY ENTRY</h1>
                <p className="text-[8px] font-bold text-white/60 uppercase tracking-[0.2em]">
                  INSTITUTIONAL VALIDATION
                </p>
              </div>

              <div className="space-y-6">
                <p className="text-[9px] font-black text-white/80 uppercase leading-relaxed tracking-widest">
                  Please sign in with your official @neu.edu.ph account to reveal the registration form.
                </p>
                <Button 
                  type="button"
                  className="w-full h-11 rounded-xl bg-white/80 hover:bg-white text-slate-900 font-black text-[9px] tracking-widest uppercase gap-3 shadow-lg transition-all active:scale-95 border border-white/20"
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
                      CONTINUE WITH INSTITUTIONAL EMAIL
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-6">
                <p className="text-white/40 text-[7px] font-black tracking-widest uppercase">
                  SECURE CAMPUS ACCESS PROTOCOL
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-[360px] shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/30 bg-white/10 backdrop-blur-2xl p-1 animate-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-10 space-y-6">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">REGISTRATION</h1>
                <p className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">
                  COMPLETE YOUR DETAILS
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-3">
                  <Select onValueChange={setClassification} value={classification}>
                    <SelectTrigger className="h-12 border-none bg-white/20 rounded-2xl px-5 text-[10px] font-black text-white tracking-widest uppercase focus:ring-0 shadow-sm">
                      <SelectValue placeholder="CLASSIFICATION" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-md">
                      <SelectItem value="Student" className="text-[10px] font-black uppercase">STUDENT</SelectItem>
                      <SelectItem value="Staff" className="text-[10px] font-black uppercase">STAFF</SelectItem>
                      <SelectItem value="Administrator" className="text-[10px] font-black uppercase">ADMINISTRATOR</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input 
                    placeholder="ID NUMBER" 
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="h-12 border-none bg-white/20 rounded-2xl px-5 text-[10px] font-black placeholder:text-white/40 tracking-widest text-white uppercase shadow-sm"
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="FIRST NAME" 
                      value={firstName} 
                      className="h-12 border-none bg-black/20 rounded-2xl px-5 text-[10px] font-black text-white/40 tracking-widest uppercase cursor-not-allowed shadow-inner" 
                      readOnly
                    />
                    <Input 
                      placeholder="LAST NAME" 
                      value={lastName} 
                      className="h-12 border-none bg-black/20 rounded-2xl px-5 text-[10px] font-black text-white/40 tracking-widest uppercase cursor-not-allowed shadow-inner" 
                      readOnly
                    />
                  </div>

                  <Select onValueChange={setCollege} value={college}>
                    <SelectTrigger className="h-12 border-none bg-white/20 rounded-2xl px-5 text-[10px] font-black text-white tracking-widest uppercase focus:ring-0 shadow-sm">
                      <SelectValue placeholder="DEPARTMENT" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-md">
                      <SelectItem value="College of Arts and Science" className="text-[10px] font-black uppercase">CAS</SelectItem>
                      <SelectItem value="College of Information and Computer Studies" className="text-[10px] font-black uppercase">CICS</SelectItem>
                      <SelectItem value="College of Accountancy" className="text-[10px] font-black uppercase">COA</SelectItem>
                      <SelectItem value="College of Engineering and Architecture" className="text-[10px] font-black uppercase">CEA</SelectItem>
                      <SelectItem value="College of Medicine" className="text-[10px] font-black uppercase">MEDICINE</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select onValueChange={setPurpose} value={purpose}>
                    <SelectTrigger className="h-12 border-none bg-white/20 rounded-2xl px-5 text-[10px] font-black text-white tracking-widest uppercase focus:ring-0 shadow-sm">
                      <SelectValue placeholder="PURPOSE" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-md">
                      <SelectItem value="Reading Books" className="text-[10px] font-black uppercase">Reading Books</SelectItem>
                      <SelectItem value="Thesis Research" className="text-[10px] font-black uppercase">Thesis Research</SelectItem>
                      <SelectItem value="Computer Use" className="text-[10px] font-black uppercase">Computer Use</SelectItem>
                      <SelectItem value="Assignments" className="text-[10px] font-black uppercase">Assignments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-[11px] font-black bg-slate-900/80 hover:bg-slate-900 rounded-2xl shadow-lg transition-all active:scale-[0.98] mt-6 tracking-widest uppercase text-white border-none" 
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "VERIFY & REGISTER"}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost"
                  className="w-full h-8 text-[8px] font-black text-white/40 hover:text-white/60 uppercase tracking-widest mt-4"
                  onClick={() => signOut(auth)}
                >
                  SWITCH ACCOUNT
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
