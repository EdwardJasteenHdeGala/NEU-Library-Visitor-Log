"use client";

import { useState } from "react";
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
  HelpCircle,
  GraduationCap,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  ArrowRight
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

export function UserGreeting() {
  const { logout, profile, switchRole } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [purpose, setPurpose] = useState<string>("");
  const [isLogging, setIsLogging] = useState(false);
  const libraryImage = PlaceHolderImages.find(img => img.id === 'library-interior');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleLogVisit = async () => {
    if (!purpose || !profile || !firestore) return;
    setIsLogging(true);
    try {
      await addDoc(collection(firestore, 'visits'), {
        userId: profile.id,
        userName: profile.displayName,
        college: profile.college || 'General Education',
        roleAtTime: 'student',
        purpose: purpose,
        timestamp: serverTimestamp()
      });
      toast({
        title: "Log Recorded",
        description: "Your visit has been successfully registered in real-time.",
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
    .slice(0, 2) || 'ST';

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col">
      <header className="p-4 bg-primary text-white sticky top-0 z-50 shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-inner border border-white/20">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" width={28} height={28} className="object-contain" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-2xl font-black tracking-tighter italic uppercase leading-none">NEU ACCESS</h1>
              <span className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] opacity-80">Institutional Hub</span>
            </div>
          </div>

          <LiveClock className="hidden md:flex scale-90 lg:scale-100" />

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 mr-4 border-r border-white/10 pr-6">
                <Avatar className="h-10 w-10 border-2 border-secondary shadow-2xl">
                  <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                  <AvatarFallback className="bg-secondary text-primary font-black text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-black uppercase text-white truncate max-w-[120px] tracking-tight">{profile?.displayName?.split(' ')[0]}</span>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">{profile?.role}</span>
                </div>
            </div>
            
            <div className="flex gap-2">
                {profile?.isAuthorizedAdmin && (
                  <Button variant="neuSecondary" size="sm" onClick={() => switchRole('admin')} className="hidden sm:flex h-10 gap-2 font-black text-[10px] uppercase rounded-xl">
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={logout} className="h-10 gap-2 text-white/70 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase rounded-xl transition-all">
                  <RefreshCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Switch</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={logout} className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <LogOut className="h-5 w-5" />
                </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-3 gap-16 items-start animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="lg:col-span-2 space-y-16">
          <div className="space-y-6">
            <div className="flex items-center gap-8">
              <Avatar className="h-28 w-28 border-4 border-white shadow-2xl animate-in zoom-in-50 duration-500">
                <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                <AvatarFallback className="bg-secondary text-primary font-black text-4xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                   <Sparkles className="h-3.5 w-3.5 text-secondary fill-secondary" />
                   Session Active: Academic Year 2024-25
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-[0.85]">
                  Welcome, <br />
                  <span className="text-secondary italic">{profile?.displayName?.split(' ')[0]}!</span>
                </h1>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-5 pt-4">
                <div className="bg-white p-5 rounded-[2rem] flex items-center gap-5 shadow-xl border border-muted hover:scale-[1.03] transition-all cursor-default group">
                    <div className="bg-primary/5 p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all"><User className="h-6 w-6 text-primary group-hover:text-white" /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Student ID</p>
                        <p className="font-mono text-base font-black text-primary tracking-tight">{profile?.studentId}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-[2rem] flex items-center gap-5 shadow-xl border border-muted hover:scale-[1.03] transition-all cursor-default group">
                    <div className="bg-secondary/5 p-3 rounded-2xl group-hover:bg-secondary group-hover:text-primary transition-all"><MapPin className="h-6 w-6 text-secondary" /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Assigned Dept</p>
                        <p className="text-base font-black text-primary italic uppercase">{profile?.college || 'General'}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-[2rem] flex items-center gap-5 shadow-xl border border-muted hover:scale-[1.03] transition-all cursor-default group">
                    <div className="bg-green-50 p-3 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-all"><ShieldCheck className="h-6 w-6 text-green-600 group-hover:text-white" /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Access Status</p>
                        <p className="text-base font-black text-green-700 uppercase tracking-tight">Verified</p>
                    </div>
                </div>
            </div>
          </div>

          <Card className="neu-card-shadow border-none overflow-hidden rounded-[3rem] bg-white relative">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                <Library className="h-48 w-48" />
            </div>
            <CardHeader className="p-12 border-b bg-muted/30">
              <CardTitle className="text-4xl font-black text-primary flex items-center gap-5 italic tracking-tighter">
                <CheckCircle2 className="h-10 w-10 text-secondary" />
                LOG ENTRY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-16 space-y-12">
              <div className="space-y-10">
                <div className="space-y-6">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.5em] ml-3 opacity-70">What is your objective today?</label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="h-24 text-2xl font-bold rounded-[2rem] border-4 border-muted focus:ring-primary focus:border-primary transition-all bg-muted/10 shadow-inner px-10">
                      <SelectValue placeholder="Select Purpose of Visit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[2.5rem] p-3 shadow-2xl border-none">
                      <SelectItem value="reading books" className="rounded-2xl h-14 font-bold px-6 text-lg">📖 Reading Materials</SelectItem>
                      <SelectItem value="research in thesis" className="rounded-2xl h-14 font-bold px-6 text-lg">🔬 Thesis Research</SelectItem>
                      <SelectItem value="use of computer" className="rounded-2xl h-14 font-bold px-6 text-lg">💻 Digital Laboratory</SelectItem>
                      <SelectItem value="doing assignments" className="rounded-2xl h-14 font-bold px-6 text-lg">📝 Assignments</SelectItem>
                      <SelectItem value="group study" className="rounded-2xl h-14 font-bold px-6 text-lg">🤝 Collaborative Study</SelectItem>
                      <SelectItem value="consultation" className="rounded-2xl h-14 font-bold px-6 text-lg">💬 Faculty Consultation</SelectItem>
                      <SelectItem value="charging device" className="rounded-2xl h-14 font-bold px-6 text-lg">⚡ Power/Charging</SelectItem>
                      <SelectItem value="resting/waiting" className="rounded-2xl h-14 font-bold px-6 text-lg">⌛ Waiting Area</SelectItem>
                      <SelectItem value="printing/scanning" className="rounded-2xl h-14 font-bold px-6 text-lg">🖨️ Printing Services</SelectItem>
                      <SelectItem value="resource borrowing" className="rounded-2xl h-14 font-bold px-6 text-lg">📚 Resource Exchange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleLogVisit} 
                  variant="neu"
                  disabled={!purpose || isLogging}
                  className="w-full h-24 text-3xl font-black rounded-[2rem] py-10 gap-5 group overflow-hidden relative shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  {isLogging ? (
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 border-4 border-white border-t-transparent animate-spin rounded-full" />
                        SYNCHRONIZING...
                    </div>
                  ) : (
                    <>
                        <CheckCircle2 className="h-10 w-10 text-secondary group-hover:scale-125 transition-transform" />
                        CONFIRM ATTENDANCE
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="aspect-[21/9] relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group cursor-pointer">
              <Image 
                  src={libraryImage?.imageUrl || ""} 
                  alt="NEU Library" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent" />
              <div className="absolute bottom-12 left-12 right-12 text-white space-y-3">
                  <div className="inline-block bg-secondary text-primary px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3 shadow-2xl">Institutional Notice</div>
                  <p className="text-5xl font-black tracking-tighter italic leading-none">The Future of Research.</p>
                  <p className="text-white/80 font-medium text-xl max-w-xl leading-relaxed">Engage with digital repositories and specialized academic hubs designed for institutional excellence.</p>
              </div>
          </div>
        </div>

        <div className="space-y-12 sticky top-32">
          <Card className="neu-card-shadow border-none rounded-[3rem] bg-primary text-white overflow-hidden relative shadow-2xl">
            <div className="absolute -top-6 -right-6 bg-secondary/20 h-32 w-32 rounded-full blur-3xl" />
            <CardContent className="p-12 space-y-10">
                <div className="flex items-center gap-8">
                    <div className="bg-white/10 p-5 rounded-[2rem] shadow-inner backdrop-blur-sm">
                        <Clock className="h-10 w-10 text-secondary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Operational Phase</p>
                        <p className="text-4xl font-black italic tracking-tight">08:00 - 17:00</p>
                    </div>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div className="flex items-start gap-5 italic text-white/70 leading-relaxed font-medium">
                  <span className="text-5xl font-black text-secondary/20 -mt-4 leading-none">"</span>
                  <p className="text-base tracking-tight italic">Excellence is an institutional habit. Make the library your central hub for academic discipline.</p>
                </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Button variant="outline" size="xl" className="h-28 justify-start gap-8 px-10 border-4 rounded-[2.5rem] hover:bg-primary hover:text-white hover:border-primary transition-all group bg-white shadow-xl">
                <div className="bg-muted p-4 rounded-2xl group-hover:bg-white/20 transition-all">
                    <BookOpen className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <div className="text-left space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-80">E-Library</p>
                    <p className="font-black text-2xl italic uppercase tracking-tighter">Digital Hub</p>
                </div>
            </Button>
            <Button variant="outline" size="xl" className="h-28 justify-start gap-8 px-10 border-4 rounded-[2.5rem] hover:bg-primary hover:text-white hover:border-primary transition-all group bg-white shadow-xl">
                <div className="bg-muted p-4 rounded-2xl group-hover:bg-white/20 transition-all">
                    <TrendingUp className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <div className="text-left space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-80">Activity</p>
                    <p className="font-black text-2xl italic uppercase tracking-tighter">Analytics</p>
                </div>
            </Button>
            <Button variant="outline" size="xl" className="h-28 justify-start gap-8 px-10 border-4 rounded-[2.5rem] hover:bg-primary hover:text-white hover:border-primary transition-all group bg-white shadow-xl">
                <div className="bg-muted p-4 rounded-2xl group-hover:bg-white/20 transition-all">
                    <Settings className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <div className="text-left space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-80">Profile</p>
                    <p className="font-black text-2xl italic uppercase tracking-tighter">Account</p>
                </div>
            </Button>
          </div>
          
          <div className="bg-secondary/5 border-4 border-secondary/10 p-10 rounded-[3rem] text-center space-y-5 shadow-inner relative overflow-hidden group">
             <div className="absolute top-0 left-0 h-1.5 w-full bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
             <p className="text-[11px] font-black text-primary uppercase tracking-[0.5em] opacity-80">Official Protocol</p>
             <p className="text-sm font-bold text-primary/70 leading-relaxed italic px-2">
                Please ensure you log your exit when leaving the premises to help us track occupancy accurately. Integrity starts with discipline.
             </p>
          </div>
        </div>
      </main>

      <footer className="p-12 text-center bg-white border-t mt-auto shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-4">
                <div className="bg-primary p-2 rounded-xl shadow-lg">
                    <Library className="h-5 w-5 text-white" />
                </div>
                <span className="font-black text-sm uppercase tracking-[0.4em] text-primary italic">NEU ACCESS HUB</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/50">
                © {new Date().getFullYear()} NEW ERA UNIVERSITY • EXCELLENCE
            </p>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                <button className="hover:text-primary transition-all hover:underline underline-offset-8">Privacy</button>
                <button className="hover:text-primary transition-all hover:underline underline-offset-8">Security</button>
                <button className="hover:text-primary transition-all hover:underline underline-offset-8">Support</button>
            </div>
        </div>
      </footer>
    </div>
  );
}