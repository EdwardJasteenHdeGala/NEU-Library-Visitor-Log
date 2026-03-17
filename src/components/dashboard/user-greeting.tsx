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
  TrendingUp
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
      <header className="p-4 bg-primary text-white sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-inner border border-white/20">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" width={28} height={28} className="object-contain" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-xl font-black tracking-tighter italic uppercase leading-none">NEU ACCESS</h1>
              <span className="text-[9px] font-black text-secondary uppercase tracking-[0.2em]">Institutional Hub</span>
            </div>
          </div>

          <LiveClock className="hidden md:flex scale-90 lg:scale-100" />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 mr-4 hidden md:flex border-r border-white/10 pr-4">
                <Avatar className="h-9 w-9 border-2 border-secondary shadow-xl">
                  <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                  <AvatarFallback className="bg-secondary text-primary font-black text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-black uppercase text-white/90 truncate max-w-[100px]">{profile?.displayName?.split(' ')[0]}</span>
                    <span className="text-[8px] font-bold text-secondary uppercase">{profile?.role}</span>
                </div>
            </div>
            
            <div className="flex gap-1.5">
                {profile?.isAuthorizedAdmin && (
                  <Button variant="secondary" size="sm" onClick={() => switchRole('admin')} className="hidden sm:flex h-9 gap-2 font-black text-[10px] uppercase bg-secondary text-primary hover:bg-white transition-all shadow-lg rounded-xl">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={logout} className="h-9 gap-2 text-white/80 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase rounded-xl transition-all">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Switch</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={logout} className="h-9 gap-2 text-white/80 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase rounded-xl transition-all">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-2xl animate-in zoom-in-50 duration-500">
                <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                <AvatarFallback className="bg-secondary text-primary font-black text-3xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                   <Sparkles className="h-3 w-3 text-secondary fill-secondary" />
                   Session Active: Academic Year 2024-25
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tighter leading-[0.9]">
                  Welcome, <br />
                  <span className="text-secondary italic">{profile?.displayName?.split(' ')[0]}!</span>
                </h1>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-6">
                <div className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-xl border border-muted hover:scale-105 transition-transform cursor-default group">
                    <div className="bg-primary/5 p-2.5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors"><User className="h-5 w-5 text-primary group-hover:text-white" /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Student ID</p>
                        <p className="font-mono text-sm font-black text-primary">{profile?.studentId}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-xl border border-muted hover:scale-105 transition-transform cursor-default group">
                    <div className="bg-secondary/5 p-2.5 rounded-2xl group-hover:bg-secondary group-hover:text-primary transition-colors"><MapPin className="h-5 w-5 text-secondary" /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Assigned Dept</p>
                        <p className="text-sm font-black text-primary">{profile?.college || 'General'}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-xl border border-muted hover:scale-105 transition-transform cursor-default group">
                    <div className="bg-green-50 p-2.5 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors"><ShieldCheck className="h-5 w-5 text-green-600 group-hover:text-white" /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Access Status</p>
                        <p className="text-sm font-black text-green-700 uppercase">Verified</p>
                    </div>
                </div>
            </div>
          </div>

          <Card className="neu-card-shadow border-none overflow-hidden rounded-[3rem] bg-white relative">
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <Library className="h-32 w-32" />
            </div>
            <CardHeader className="p-10 border-b bg-muted/20">
              <CardTitle className="text-3xl font-black text-primary flex items-center gap-4 italic tracking-tight">
                <CheckCircle2 className="h-8 w-8 text-secondary" />
                LOG ENTRY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12 space-y-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">What is your objective today?</label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="h-20 text-xl font-bold rounded-3xl border-4 border-muted focus:ring-primary focus:border-primary transition-all bg-muted/10 shadow-inner px-8">
                      <SelectValue placeholder="Select Purpose of Visit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[2rem] p-2 shadow-2xl border-none">
                      <SelectItem value="reading books" className="rounded-2xl h-12 font-bold px-4">📖 Reading Materials</SelectItem>
                      <SelectItem value="research in thesis" className="rounded-2xl h-12 font-bold px-4">🔬 Thesis Research</SelectItem>
                      <SelectItem value="use of computer" className="rounded-2xl h-12 font-bold px-4">💻 Digital Laboratory</SelectItem>
                      <SelectItem value="doing assignments" className="rounded-2xl h-12 font-bold px-4">📝 Assignments</SelectItem>
                      <SelectItem value="group study" className="rounded-2xl h-12 font-bold px-4">🤝 Collaborative Study</SelectItem>
                      <SelectItem value="consultation" className="rounded-2xl h-12 font-bold px-4">💬 Faculty Consultation</SelectItem>
                      <SelectItem value="charging device" className="rounded-2xl h-12 font-bold px-4">⚡ Power/Charging</SelectItem>
                      <SelectItem value="resting/waiting" className="rounded-2xl h-12 font-bold px-4">⌛ Waiting Area</SelectItem>
                      <SelectItem value="printing/scanning" className="rounded-2xl h-12 font-bold px-4">🖨️ Printing Services</SelectItem>
                      <SelectItem value="resource borrowing" className="rounded-2xl h-12 font-bold px-4">📚 Resource Exchange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleLogVisit} 
                  disabled={!purpose || isLogging}
                  className="w-full h-24 bg-primary hover:bg-primary/95 text-white font-black text-2xl rounded-3xl shadow-2xl transition-all active:scale-[0.98] py-10 gap-4 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  {isLogging ? (
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 border-4 border-white border-t-transparent animate-spin rounded-full" />
                        SYCHRONIZING...
                    </div>
                  ) : (
                    <>
                        <CheckCircle2 className="h-8 w-8 text-secondary group-hover:scale-125 transition-transform" />
                        CONFIRM ATTENDANCE
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="aspect-[21/9] relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group">
              <Image 
                  src={libraryImage?.imageUrl || ""} 
                  alt="NEU Library" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 text-white space-y-2">
                  <div className="inline-block bg-secondary text-primary px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg">Notice</div>
                  <p className="text-4xl font-black tracking-tighter italic leading-none">The Future of Research.</p>
                  <p className="text-white/80 font-medium text-lg max-w-lg">Engage with digital repositories and specialized academic hubs designed for excellence.</p>
              </div>
          </div>
        </div>

        <div className="space-y-10 sticky top-28">
          <Card className="neu-card-shadow border-none rounded-[2.5rem] bg-primary text-white overflow-hidden relative">
            <div className="absolute -top-4 -right-4 bg-secondary/20 h-24 w-24 rounded-full blur-2xl" />
            <CardContent className="p-10 space-y-8">
                <div className="flex items-center gap-6">
                    <div className="bg-white/10 p-4 rounded-[1.5rem] shadow-inner">
                        <Clock className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Operational Phase</p>
                        <p className="text-3xl font-black italic">OPEN 08:00 - 17:00</p>
                    </div>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div className="flex items-start gap-4 italic text-white/70 leading-relaxed font-medium">
                  <span className="text-4xl font-black text-secondary/30 -mt-2">"</span>
                  <p className="text-sm">Excellence is an institutional habit. Make the library your central hub for academic discipline.</p>
                </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Button variant="outline" className="h-24 justify-start gap-6 px-8 border-4 rounded-[2rem] hover:bg-primary hover:text-white hover:border-primary transition-all group shadow-lg bg-white">
                <div className="bg-muted p-3 rounded-2xl group-hover:bg-white/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-80">E-Library</p>
                    <p className="font-black text-lg italic uppercase">Digital Resources</p>
                </div>
            </Button>
            <Button variant="outline" className="h-24 justify-start gap-6 px-8 border-4 rounded-[2rem] hover:bg-primary hover:text-white hover:border-primary transition-all group shadow-lg bg-white">
                <div className="bg-muted p-3 rounded-2xl group-hover:bg-white/20 transition-colors">
                    <TrendingUp className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-80">Activity</p>
                    <p className="font-black text-lg italic uppercase">Usage Analytics</p>
                </div>
            </Button>
            <Button variant="outline" className="h-24 justify-start gap-6 px-8 border-4 rounded-[2rem] hover:bg-primary hover:text-white hover:border-primary transition-all group shadow-lg bg-white">
                <div className="bg-muted p-3 rounded-2xl group-hover:bg-white/20 transition-colors">
                    <Settings className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-80">Profile</p>
                    <p className="font-black text-lg italic uppercase">Account Control</p>
                </div>
            </Button>
          </div>
          
          <div className="bg-secondary/5 border-4 border-secondary/10 p-8 rounded-[2.5rem] text-center space-y-4 shadow-inner relative overflow-hidden group">
             <div className="absolute top-0 left-0 h-1 w-full bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Official Institutional Protocol</p>
             <p className="text-xs font-bold text-primary/70 leading-relaxed italic">
                Please ensure you log your exit when leaving the premises to help us track occupancy levels accurately. Integrity starts with discipline.
             </p>
          </div>
        </div>
      </main>

      <footer className="p-12 text-center bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
                <div className="bg-primary p-1.5 rounded-lg shadow-lg">
                    <Library className="h-4 w-4 text-white" />
                </div>
                <span className="font-black text-xs uppercase tracking-[0.3em] text-primary">NEU ACCESS HUB</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                © {new Date().getFullYear()} NEW ERA UNIVERSITY • INTEGRITY • EXCELLENCE • DISCIPLINE
            </p>
            <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                <button className="hover:text-primary transition-colors">Privacy</button>
                <button className="hover:text-primary transition-colors">Security</button>
                <button className="hover:text-primary transition-colors">Support</button>
            </div>
        </div>
      </footer>
    </div>
  );
}
