
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Library, 
  LogOut, 
  BookOpen, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  User,
  Settings,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Globe
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiveClock } from "@/components/ui/live-clock";
import { getAcademicYear } from "@/lib/utils";

export function UserGreeting() {
  const { logout, profile, switchRole } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [purpose, setPurpose] = useState<string>("");
  const [isLogging, setIsLogging] = useState(false);
  const [academicYear, setAcademicYear] = useState("");

  const libraryImage = PlaceHolderImages.find(img => img.id === 'library-interior');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  useEffect(() => {
    // Avoid hydration mismatch by setting dynamic value on mount
    setAcademicYear(getAcademicYear());
  }, []);

  const handleLogVisit = async () => {
    if (!purpose || !profile || !firestore) return;
    setIsLogging(true);
    try {
      await addDoc(collection(firestore, 'visits'), {
        userId: profile.id,
        userName: profile.displayName,
        college: profile.college || 'Guest',
        roleAtTime: profile.role,
        purpose: purpose,
        timestamp: serverTimestamp(),
        academicYear: getAcademicYear()
      });
      toast({
        title: "Log Recorded",
        description: "Your visit has been successfully registered.",
      });
      setPurpose("");
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to transmit data to institutional servers.",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  const userInitials = profile?.displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'V';

  const isGuest = profile?.role === 'guest';

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col overflow-x-hidden">
      <header className="p-3 md:p-4 bg-primary text-white sticky top-0 z-50 shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-white p-1.5 rounded-xl shadow-inner border border-white/20">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" width={24} height={24} className="object-contain md:w-7 md:h-7" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-lg md:text-2xl font-black tracking-tighter italic uppercase leading-none">NEU ACCESS</h1>
              <span className="text-[7px] md:text-[9px] font-black text-secondary uppercase tracking-[0.3em] opacity-80">Institutional Hub</span>
            </div>
          </div>

          <LiveClock className="hidden lg:flex scale-75 xl:scale-90" />

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center gap-3 mr-2 md:mr-4 border-r border-white/10 pr-4 md:pr-6">
                <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-secondary shadow-2xl">
                  <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                  <AvatarFallback className="bg-secondary text-primary font-black text-[10px] md:text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start leading-tight hidden md:flex">
                    <span className="text-[10px] md:text-xs font-black uppercase text-white truncate max-w-[100px] tracking-tight">{profile?.displayName?.split(' ')[0]}</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-secondary uppercase tracking-widest">{profile?.role}</span>
                </div>
            </div>
            
            <div className="flex gap-1.5 md:gap-2">
                {profile?.isAuthorizedAdmin && (
                  <Button variant="neuSecondary" size="sm" onClick={() => switchRole('admin')} className="h-8 md:h-10 gap-1 md:gap-2 font-black text-[8px] md:text-[10px] uppercase rounded-xl">
                    <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Admin
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={logout} title="Switch Account" className="h-8 md:h-10 gap-1 md:gap-2 text-white/70 hover:text-white hover:bg-white/10 font-black text-[8px] md:text-[10px] uppercase rounded-xl transition-all">
                  <RefreshCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Switch</span>
                </Button>
                <Button variant="destructive" size="sm" onClick={logout} className="h-8 md:h-10 gap-1 md:gap-2 font-black text-[8px] md:text-[10px] uppercase rounded-xl shadow-lg border-2 border-white/10">
                  <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-start animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="lg:col-span-2 space-y-8 md:space-y-12 lg:space-y-16">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-8 text-center sm:text-left">
              <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-white shadow-2xl animate-in zoom-in-50 duration-500">
                <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                <AvatarFallback className="bg-secondary text-primary font-black text-2xl md:text-4xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 md:space-y-3">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 md:px-5 md:py-2 rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                   {isGuest ? <Globe className="h-3.5 w-3.5 text-secondary" /> : <Sparkles className="h-3.5 w-3.5 text-secondary fill-secondary" />}
                   {isGuest ? "External Visitor Access" : `Academic Year ${academicYear || "..."}`}
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-primary tracking-tighter leading-[1.1] md:leading-[0.85]">
                  {isGuest ? "Hello, Visitor" : "Welcome,"} <br />
                  <span className="text-secondary italic">{profile?.displayName?.split(' ')[0]}!</span>
                </h1>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 md:gap-5 pt-4">
                <div className="bg-white p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-3 md:gap-5 shadow-xl border border-muted hover:scale-[1.03] transition-all cursor-default group flex-1 min-w-[140px] md:min-w-[180px]">
                    <div className="bg-primary/5 p-2 md:p-3 rounded-xl md:rounded-2xl group-hover:bg-primary group-hover:text-white transition-all"><User className="h-4 w-4 md:h-6 md:w-6 text-primary group-hover:text-white" /></div>
                    <div className="overflow-hidden">
                        <p className="text-[7px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Status</p>
                        <p className="font-mono text-xs md:text-base font-black text-primary tracking-tight truncate uppercase">{profile?.role}</p>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-3 md:gap-5 shadow-xl border border-muted hover:scale-[1.03] transition-all cursor-default group flex-1 min-w-[140px] md:min-w-[180px]">
                    <div className="bg-secondary/5 p-2 md:p-3 rounded-xl md:rounded-2xl group-hover:bg-secondary group-hover:text-primary transition-all"><MapPin className="h-4 w-4 md:h-6 md:w-6 text-secondary" /></div>
                    <div className="overflow-hidden">
                        <p className="text-[7px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Location</p>
                        <p className="text-xs md:text-base font-black text-primary italic uppercase truncate">{profile?.college || 'External'}</p>
                    </div>
                </div>
            </div>
          </div>

          <Card className="neu-card-shadow border-none overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white relative">
            <div className="absolute top-0 right-0 p-6 md:p-10 opacity-[0.03] pointer-events-none">
                <Library className="h-24 w-24 md:h-48 md:w-48" />
            </div>
            <CardHeader className="p-6 md:p-12 border-b bg-muted/30">
              <CardTitle className="text-2xl md:text-4xl font-black text-primary flex items-center gap-3 md:gap-5 italic tracking-tighter">
                <CheckCircle2 className="h-6 w-6 md:h-10 md:w-10 text-secondary" />
                VISITOR LOG ENTRY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-12 lg:p-16 space-y-8 md:space-y-12">
              <div className="space-y-6 md:space-y-10">
                <div className="space-y-4 md:space-y-6">
                  <label className="text-[8px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.3em] md:tracking-[0.5em] ml-2 md:ml-3 opacity-70">Reason for visit</label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="h-16 md:h-24 text-lg md:text-2xl font-bold rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 border-muted focus:ring-primary focus:border-primary transition-all bg-muted/10 shadow-inner px-6 md:px-10">
                      <SelectValue placeholder="Select Purpose" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[1.5rem] md:rounded-[2.5rem] p-2 md:p-3 shadow-2xl border-none max-h-[300px]">
                      <SelectItem value="reading books" className="rounded-xl h-10 md:h-14 font-bold px-4 md:px-6 text-sm md:text-lg">📖 Reading Materials</SelectItem>
                      <SelectItem value="research in thesis" className="rounded-xl h-10 md:h-14 font-bold px-4 md:px-6 text-sm md:text-lg">🔬 Thesis Research</SelectItem>
                      <SelectItem value="use of computer" className="rounded-xl h-10 md:h-14 font-bold px-4 md:px-6 text-sm md:text-lg">💻 Digital Laboratory</SelectItem>
                      <SelectItem value="doing assignments" className="rounded-xl h-10 md:h-14 font-bold px-4 md:px-6 text-sm md:text-lg">📝 Assignments</SelectItem>
                      <SelectItem value="group study" className="rounded-xl h-10 md:h-14 font-bold px-4 md:px-6 text-sm md:text-lg">🤝 Collaborative Study</SelectItem>
                      {!isGuest && <SelectItem value="consultation" className="rounded-xl h-10 md:h-14 font-bold px-4 md:px-6 text-sm md:text-lg">💬 Faculty Consultation</SelectItem>}
                      <SelectItem value="charging device" className="rounded-xl h-10 md:h-14 font-bold px-4 md:px-6 text-sm md:text-lg">⚡ Power/Charging</SelectItem>
                      <SelectItem value="resting/waiting" className="rounded-xl h-10 md:h-14 font-bold px-4 md:px-6 text-sm md:text-lg">⌛ Waiting Area</SelectItem>
                      <SelectItem value="printing/scanning" className="rounded-xl h-10 md:h-14 font-bold px-4 md:px-6 text-sm md:text-lg">🖨️ Printing Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleLogVisit} 
                  variant="neu"
                  disabled={!purpose || isLogging}
                  className="w-full h-16 md:h-24 text-xl md:text-3xl font-black rounded-[1.5rem] md:rounded-[2rem] py-6 md:py-10 gap-3 md:gap-5 group overflow-hidden relative shadow-2xl"
                >
                  {isLogging ? (
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-6 w-6 md:h-8 md:w-8 border-3 md:border-4 border-white border-t-transparent animate-spin rounded-full" />
                        RECORDING...
                    </div>
                  ) : (
                    <>
                        <CheckCircle2 className="h-6 w-6 md:h-10 md:w-10 text-secondary group-hover:scale-125 transition-transform" />
                        REGISTER ENTRY
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 md:space-y-12 lg:sticky lg:top-32">
          <Card className="neu-card-shadow border-none rounded-[2rem] md:rounded-[3rem] bg-primary text-white overflow-hidden relative shadow-2xl">
            <CardContent className="p-8 md:p-12 space-y-6 md:space-y-10">
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="bg-white/10 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-inner backdrop-blur-sm">
                        <Clock className="h-6 w-6 md:h-10 md:w-10 text-secondary" />
                    </div>
                    <div>
                        <p className="text-[8px] md:text-[10px] font-black text-white/50 uppercase tracking-[0.3em] md:tracking-[0.4em]">Operational Hours</p>
                        <p className="text-2xl md:text-4xl font-black italic tracking-tight">08:00 - 17:00</p>
                    </div>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <p className="text-xs md:text-sm font-bold text-white/70 leading-relaxed italic">
                  Institutional access logs are required for all visitors entering the library premises.
                </p>
            </CardContent>
          </Card>
          
          <div className="bg-secondary/5 border-4 border-secondary/10 p-6 md:p-10 rounded-[1.5rem] md:rounded-[3rem] text-center space-y-3 md:space-y-5 shadow-inner relative overflow-hidden group">
             <p className="text-[9px] md:text-[11px] font-black text-primary uppercase tracking-[0.3em] md:tracking-[0.5em] opacity-80">Official Protocol</p>
             <p className="text-xs md:text-sm font-bold text-primary/70 leading-relaxed italic px-2">
                Your entry is being recorded as a {profile?.role?.toUpperCase()}. Please observe library policies during your stay.
             </p>
          </div>
        </div>
      </main>

      <footer className="p-8 md:p-12 text-center bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
                <Library className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="font-black text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.4em] text-primary italic">NEU ACCESS HUB</span>
            </div>
            <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                © {new Date().getFullYear()} NEW ERA UNIVERSITY • EXTERNAL ACCESS ENABLED
            </p>
        </div>
      </footer>
    </div>
  );
}
