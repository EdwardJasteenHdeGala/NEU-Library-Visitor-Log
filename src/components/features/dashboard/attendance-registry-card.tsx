"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Library, 
  CheckCircle2, 
  Loader2, 
  UserCheck,
  Activity,
  History,
  LogOut
} from "lucide-react";
import { collection, query, where, limit, doc, serverTimestamp } from "firebase/firestore";
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { getAcademicYear } from "@/lib/utils";
import { NEU_COLLEGES, LIBRARY_PURPOSES } from "@/lib/constants";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AttendanceRegistryCardProps {
  isPendingSession?: boolean;
  onCheckInStart?: () => void;
  onCheckInComplete?: () => void;
}

export function AttendanceRegistryCard({ 
  isPendingSession: externalPending = false,
  onCheckInStart,
  onCheckInComplete
}: AttendanceRegistryCardProps) {
  const { profile } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [purpose, setPurpose] = useState<string>("");
  const [currentCollege, setCurrentCollege] = useState<string>(profile?.college || "");
  const [currentDesignation, setCurrentDesignation] = useState<string>(profile?.designation || 'student');
  const [isEditingCollege, setIsEditingCollege] = useState(false);
  const [isEditingDesignation, setIsEditingDesignation] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [internalPending, setInternalPending] = useState(false);

  const isPendingSession = externalPending || internalPending;



  useEffect(() => {
    if (profile?.college && !isEditingCollege) {
      setCurrentCollege(profile.college);
    }
  }, [profile?.college, isEditingCollege]);

  useEffect(() => {
    if (profile?.designation && !isEditingDesignation) {
      setCurrentDesignation(profile.designation);
    }
  }, [profile?.designation, isEditingDesignation]);

  useEffect(() => {
    if (profile?.college && !currentCollege) {
      setCurrentCollege(profile.college);
    }
  }, [profile?.college, currentCollege]);

  const isGuest = profile?.role === 'guest';

  const activeVisitQuery = useMemoFirebase(() => {
    if (!profile?.id || !firestore) return null;
    return query(
      collection(firestore, 'visits'),
      where('userId', '==', profile.id),
      where('exitTimestamp', '==', null),
      limit(1)
    );
  }, [profile?.id, firestore, isGuest]);

  const { data: visits, isLoading: loadingVisits } = useCollection(activeVisitQuery);
  const activeVisit = visits && visits.length > 0 ? visits[0] : null;

  // AUTO-RESOLVE PENDING STATE: When Firestore syncs the new visit, clear the pending flag
  useEffect(() => {
    if (activeVisit && (internalPending || externalPending)) {
      setInternalPending(false);
      onCheckInComplete?.();
    }
  }, [activeVisit, internalPending, externalPending, onCheckInComplete]);

  const handleCheckIn = async () => {
    // SECURITY: Visitors can now utilize the registry protocol
    if (!purpose || !profile || !firestore || (!currentCollege && !isGuest) || activeVisit) {
      if (activeVisit) {
        toast({ title: "Internal Security Conflict", description: "An active institutional session is already in progress.", variant: "destructive" });
      } else {
        toast({ title: "Incomplete Protocol", description: "Select academic unit and purpose.", variant: "destructive" });
      }
      return;
    }

    setIsLogging(true);
    
    try {
      // SESSION SINGLETON ENFORCEMENT: Find and auto-close any "hanging" active sessions
      const q = query(
        collection(firestore, 'visits'),
        where('userId', '==', profile.id),
        where('exitTimestamp', '==', null)
      );
      
      const { getDocs } = await import('firebase/firestore');
      const activeSnaps = await getDocs(q);
      
      if (!activeSnaps.empty) {
        activeSnaps.docs.forEach(snap => {
          updateDocumentNonBlocking(doc(firestore, 'visits', snap.id), {
            exitTimestamp: serverTimestamp(),
            autoClosed: true,
            durationMinutes: 0 // Placeholder for auto-closed sessions
          });
        });
      }

      // Proceed with new session
      addDocumentNonBlocking(collection(firestore, 'visits'), {
        userId: profile.id,
        userName: profile.displayName || 'Visitor',
        college: currentCollege || 'EXTERNAL',
        roleAtTime: profile.role || 'member',
        designation: currentDesignation,
        purpose: purpose,
        timestamp: serverTimestamp(),
        exitTimestamp: null,
        durationMinutes: 0,
        academicYear: getAcademicYear()
      });

      setInternalPending(true);
      onCheckInStart?.();

      setTimeout(() => {
        setIsLogging(false);
        setPurpose("");
        toast({ 
          title: "Attendance Synchronized", 
          description: `Logged for ${profile.displayName}. Session active.`,
        });

        // FAILSAFE: If Firestore never syncs, clear pending after 10s
        setTimeout(() => {
          setInternalPending(false);
          onCheckInComplete?.();
        }, 10000);
      }, 600);
    } catch (_error) {
      console.error("Session Singleton Error:", _error);
      setIsLogging(false);
      toast({ title: "Registry Error", description: "Failed to synchronize session singleton.", variant: "destructive" });
    }
  };

  const handleSaveCollege = async () => {
    if (!currentCollege || !profile || !firestore) return;
    setIsLogging(true);
    try {
      const userRef = doc(firestore, 'users', profile.id);
      updateDocumentNonBlocking(userRef, { 
        college: currentCollege, 
        updatedAt: serverTimestamp() 
      });
      setTimeout(() => {
        setIsEditingCollege(false);
        setIsLogging(false);
        toast({ title: "Profile Updated", description: "Academic Unit has been permanently synchronized." });
      }, 600);
    } catch {
      setIsLogging(false);
      toast({ title: "Sync Failed", description: "Could not update institutional affiliation.", variant: "destructive" });
    }
  };

  const handleSaveDesignation = async () => {
    if (!currentDesignation || !profile || !firestore) return;
    setIsLogging(true);
    try {
      const userRef = doc(firestore, 'users', profile.id);
      updateDocumentNonBlocking(userRef, { 
        designation: currentDesignation, 
        updatedAt: serverTimestamp() 
      });
      setTimeout(() => {
        setIsEditingDesignation(false);
        setIsLogging(false);
        toast({ title: "Profile Updated", description: "Employee Status has been permanently synchronized." });
      }, 600);
    } catch {
      setIsLogging(false);
      toast({ title: "Sync Failed", description: "Could not update employee status.", variant: "destructive" });
    }
  };

  const handleCheckOut = () => {
    if (!activeVisit || !firestore) return;

    setIsLogging(true);
    const entryTime = activeVisit.timestamp?.toDate?.() ?? new Date();
    const exitTime = new Date();
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    const docRef = doc(firestore, 'visits', activeVisit.id);
    updateDocumentNonBlocking(docRef, {
      exitTimestamp: serverTimestamp(),
      durationMinutes: durationMinutes
    });

    setTimeout(() => {
      toast({ title: "Check-Out Confirmed", description: `Stay Duration: ${durationMinutes} minutes. Official ID-OUT Synchronized.` });
      setIsLogging(false);
    }, 600);
  };

  return (
    <Card className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/5 rounded-[3rem] overflow-hidden bg-white/5 backdrop-blur-3xl transition-all duration-700 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] group/registry">
      <CardHeader className="bg-gradient-to-br from-muted/40 to-muted/10 border-b border-white/5 p-[clamp(2rem,6vw,3.5rem)] relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        <CardTitle className="text-[clamp(1.5rem,4vw,2rem)] font-black italic flex items-center gap-4 uppercase tracking-tighter text-primary relative z-10 group-hover/registry:text-glow-primary transition-all duration-500">
          <div className="p-3 bg-secondary/10 rounded-2xl border border-secondary/20 group-hover/registry:scale-110 transition-transform duration-500">
             <History className="h-[clamp(1.5rem,3vw,2rem)] w-[clamp(1.5rem,3vw,2rem)] text-secondary" /> 
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">NEU Registry</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-[clamp(2rem,6vw,4.5rem)] space-y-[clamp(2rem,6vh,3rem)]">
        {(loadingVisits && !activeVisit) ? (
          <div className="flex justify-center items-center py-20 relative z-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (activeVisit || isPendingSession || isLogging) ? (
          <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-[clamp(2rem,8vw,4rem)] rounded-[2rem] text-center space-y-[clamp(1.5rem,4vh,2rem)] animate-in zoom-in duration-500 relative z-20">
            <div className="h-[clamp(4.5rem,10vw,6rem)] w-[clamp(4.5rem,10vw,6rem)] bg-card rounded-[1.5rem] shadow-xl flex items-center justify-center mx-auto border-[4px] border-primary/10">
              <Activity className="h-[clamp(2rem,5vw,3rem)] w-[clamp(2rem,5vw,3rem)] text-primary animate-pulse" />
            </div>
            <div className="space-y-[0.5rem]">
              <h3 className="text-[clamp(1.25rem,3vw,1.75rem)] font-black text-primary italic uppercase tracking-tighter leading-none">
                {isPendingSession ? "Synchronizing Session..." : "Registry Lock Engaged"}
              </h3>
              <p className="text-muted-foreground font-black uppercase text-[0.625rem] tracking-widest bg-muted/50 px-[1.25rem] py-[0.5rem] rounded-full inline-block border border-white/5 shadow-inner">
                {isPendingSession ? "NEU Access Protocol Handshake..." : `ACTIVE SESSION SINCE: ${activeVisit?.timestamp?.toDate ? activeVisit.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Synchronizing...'}`}
              </p>
            </div>
            {!isPendingSession && (
              <Button 
                onClick={handleCheckOut} 
                size="xl"
                disabled={isLogging}
                className="w-full h-[clamp(4.5rem,8vh,5rem)] bg-destructive text-white hover:bg-destructive/90 rounded-[1.75rem] font-black uppercase tracking-tighter shadow-[0_15px_30px_rgba(239,68,68,0.3)] group relative overflow-hidden transition-all hover:scale-[1.02] border-none active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex flex-col items-center leading-tight">
                   <div className="flex items-center gap-3">
                     <LogOut className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] group-hover:translate-x-1 transition-transform" />
                     <span>LOG EXIT (OUT)</span>
                   </div>
                   <span className="text-[10px] opacity-60 font-medium tracking-widest mt-1">RELEASE REGISTRY LOCK</span>
                </div>
              </Button>
            )}
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 italic">
               ID-OUT Synchronized for Records. Website session remains active.
            </p>
          </div>
        ) : (
          <div className="space-y-[clamp(2rem,6vh,3rem)] animate-in slide-in-from-bottom-4 duration-700 fade-in fill-mode-both">
            {/* Role and Identity Indicator */}
            <div className="flex items-center gap-5 bg-gradient-to-r from-primary/5 via-muted/20 to-transparent p-5 rounded-[2rem] border border-primary/10 hover:border-primary/20 transition-all duration-500 hover:shadow-lg">
              <div className="h-14 w-14 rounded-[1.25rem] bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden flex items-center justify-center border border-primary/30 shadow-inner relative">
                {profile?.photoURL ? (
                  <div className="relative h-full w-full">
                    <Image src={profile.photoURL} alt="Profile" fill className="object-cover" />
                  </div>
                ) : (
                  <UserCheck className="h-6 w-6 text-primary drop-shadow-md" />
                )}
              </div>
              <div className="flex flex-col leading-none text-left">
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Gate Synchronization active</span>
                  <span className="text-xl md:text-2xl font-black italic tracking-tighter text-primary flex items-center gap-2">
                    Welcome, {profile?.displayName?.split(' ')[0] || 'Member'}
                    <span className="text-secondary text-[0.6em] tracking-widest bg-secondary/10 px-2 py-1 rounded-md border border-secondary/20 font-black italic">
                      {profile?.designation?.toUpperCase() || 'MEMBER'}
                      {profile?.role === 'admin' && ', ADMIN'}
                      {profile?.role === 'superadmin' && ', SUPER ADMIN'}
                    </span>
                 </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[clamp(1.5rem,4vw,2.5rem)] items-end relative z-20">
              <div className="space-y-[0.75rem]">
                <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-[0.3em] ml-[0.75rem] flex items-center justify-between gap-[0.5rem]">
                  <span className="flex items-center gap-[0.5rem]"><Library className="h-[0.75rem] w-[0.75rem] text-primary" /> Academic Unit</span>
                  {profile?.college && !isEditingCollege && !isPendingSession && !activeVisit && (
                    <button 
                      onClick={() => setIsEditingCollege(true)}
                      className="text-primary hover:text-secondary transition-colors text-[8px] font-black uppercase tracking-widest border-b border-primary/20"
                    >
                      Change
                    </button>
                  )}
                </label>
                
                {profile?.college && !isEditingCollege ? (
                  <div className="h-[clamp(3.5rem,8vh,4.5rem)] flex items-center px-[1.5rem] rounded-[1.25rem] border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent shadow-inner group/unit relative overflow-hidden transition-all duration-500 hover:border-primary/40">
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-l-full opacity-50" />
                    <span className="font-black text-[1rem] md:text-[1.125rem] text-primary truncate italic pl-2 relative z-10">
                      {NEU_COLLEGES.find(c => c.id === profile.college)?.name || profile.college}
                    </span>
                    <div className="ml-auto flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md relative z-10">
                       <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                       <span className="text-[0.55rem] font-black uppercase tracking-widest opacity-60">Verified</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 relative z-30">
                    <Select value={currentCollege} onValueChange={setCurrentCollege}>
                      <SelectTrigger className="h-[clamp(3.5rem,8vh,4.5rem)] font-black text-[1rem] md:text-[1.125rem] rounded-[1.25rem] border-[2px] border-primary/10 hover:border-primary/30 transition-colors bg-muted/30 backdrop-blur-md px-[1.5rem] focus:ring-primary shadow-sm">
                        <SelectValue placeholder="Select Institutional Unit" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[1.25rem] border border-white/10 shadow-2xl bg-card/95 backdrop-blur-xl">
                        {NEU_COLLEGES.map(c => <SelectItem key={c.id} value={c.id} className="font-bold cursor-pointer transition-colors focus:bg-primary/10">{c.name} ({c.id})</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleSaveCollege}
                      disabled={!currentCollege || currentCollege === profile?.college || isLogging}
                      variant="outline"
                      size="sm"
                      className="w-full h-11 rounded-xl font-black text-[0.65rem] uppercase tracking-[0.2em] gap-2 bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-md hover:shadow-primary/20"
                    >
                       {isLogging ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                       Synchronize to Identity
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-[0.75rem] relative z-30">
                <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-[0.3em] ml-[0.75rem] flex items-center gap-[0.5rem]">
                  <Activity className="h-[0.75rem] w-[0.75rem] text-primary" /> Core Objective
                </label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger className="h-[clamp(3.5rem,8vh,4.5rem)] font-black text-[1rem] md:text-[1.125rem] rounded-[1.25rem] border-[2px] border-primary/10 hover:border-primary/30 transition-colors bg-muted/30 backdrop-blur-md px-[1.5rem] focus:ring-primary shadow-sm">
                    <SelectValue placeholder="Define Purpose" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[1.25rem] border border-white/10 shadow-2xl bg-card/95 backdrop-blur-xl">
                    {LIBRARY_PURPOSES.map(p => (
                      <SelectItem key={p.id} value={p.id} className="font-bold cursor-pointer transition-colors focus:bg-primary/10">{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-[0.75rem] relative z-30">
                <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-[0.3em] ml-[0.75rem] flex items-center justify-between gap-[0.5rem]">
                  <span className="flex items-center gap-[0.5rem]"><UserCheck className="h-[0.75rem] w-[0.75rem] text-primary" /> Employee Status</span>
                  {profile?.designation && !isEditingDesignation && !isPendingSession && !activeVisit && (
                    <button 
                      onClick={() => setIsEditingDesignation(true)}
                      className="text-primary hover:text-secondary transition-colors text-[8px] font-black uppercase tracking-widest border-b border-primary/20"
                    >
                      Change
                    </button>
                  )}
                </label>
                
                {profile?.designation && !isEditingDesignation ? (
                  <div className="h-[clamp(3.5rem,8vh,4.5rem)] flex items-center px-[1.5rem] rounded-[1.25rem] border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent shadow-inner group/unit relative overflow-hidden transition-all duration-500 hover:border-primary/40">
                    <div className="absolute inset-y-0 left-0 w-1 bg-secondary rounded-l-full opacity-50" />
                    <span className="font-black text-[1rem] md:text-[1.125rem] text-primary truncate italic pl-2 relative z-10">
                      {profile.designation.charAt(0).toUpperCase() + profile.designation.slice(1)}
                    </span>
                    <div className="ml-auto flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md relative z-10">
                       <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                       <span className="text-[0.55rem] font-black uppercase tracking-widest opacity-60">Verified</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 relative z-30">
                    <Select value={currentDesignation} onValueChange={setCurrentDesignation}>
                      <SelectTrigger className="h-[clamp(3.5rem,8vh,4.5rem)] font-black text-[1rem] md:text-[1.125rem] rounded-[1.25rem] border-[2px] border-primary/10 hover:border-primary/30 transition-colors bg-muted/30 backdrop-blur-md px-[1.5rem] focus:ring-primary shadow-sm">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[1.25rem] border border-white/10 shadow-2xl bg-card/95 backdrop-blur-xl">
                        <SelectItem value="student" className="font-bold cursor-pointer transition-colors focus:bg-primary/10">Student</SelectItem>
                        <SelectItem value="teacher" className="font-bold cursor-pointer transition-colors focus:bg-primary/10">Teacher</SelectItem>
                        <SelectItem value="staff" className="font-bold cursor-pointer transition-colors focus:bg-primary/10">Staff</SelectItem>
                        <SelectItem value="guest" className="font-bold cursor-pointer transition-colors focus:bg-primary/10">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleSaveDesignation}
                      disabled={!currentDesignation || currentDesignation === profile?.designation || isLogging}
                      variant="outline"
                      size="sm"
                      className="w-full h-11 rounded-xl font-black text-[0.65rem] uppercase tracking-[0.2em] gap-2 bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-md hover:shadow-primary/20"
                    >
                       {isLogging ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                       Synchronize Status
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={handleCheckIn} 
              disabled={!purpose || isLogging || isEditingCollege || !profile?.college} 
              size="xl"
              className="w-full h-[clamp(4.5rem,8vh,5rem)] rounded-[1.5rem] font-black tracking-tighter text-[clamp(1rem,2vw,1.25rem)] relative overflow-hidden active:scale-[0.98] disabled:grayscale disabled:opacity-50 group hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all duration-500 bg-primary text-primary-foreground border-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              {isLogging ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-8 w-8 text-secondary drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform duration-500 mr-2" />
                  <span className="drop-shadow-lg italic">LOG ENTRY (IN) / AUTHORIZE</span>
                </>
              )}
            </Button>

            {isEditingCollege && (
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-primary/40 italic">
                 Save Academic Unit to enable enrollment log
               </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
