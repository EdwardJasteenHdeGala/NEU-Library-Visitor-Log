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
  CheckCircle2, 
  ShieldCheck, 
  RefreshCcw, 
  Sparkles,
  Building2,
  Trophy,
  History,
  MessageSquare,
  HelpCircle,
  Menu,
  X,
  Globe,
  Settings
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiveClock } from "@/components/ui/live-clock";
import { getAcademicYear } from "@/lib/utils";
import { FeedbackView } from "./feedback-view";
import { HelpView } from "./help-view";
import { ProfileView } from "./profile-view";
import { cn } from "@/lib/utils";

const NEU_COLLEGES = [
  { id: "CICS", name: "Computer & Info Sciences" },
  { id: "CEA", name: "Engineering & Architecture" },
  { id: "CAS", name: "Arts & Sciences" },
  { id: "CBA", name: "Business Administration" },
  { id: "COED", name: "Education" },
  { id: "CON", name: "Nursing" },
  { id: "COM", name: "Medicine" },
  { id: "COL", name: "Law" },
  { id: "GRAD", name: "Graduate School" },
  { id: "SHS", name: "Senior High School" },
  { id: "HS", name: "High School" },
  { id: "EXTERNAL", name: "External / Guest" },
];

type UserSubView = 'log-entry' | 'feedback' | 'help' | 'profile';

export function UserGreeting() {
  const { logout, profile, switchRole } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [subView, setSubView] = useState<UserSubView>('log-entry');
  const [purpose, setPurpose] = useState<string>("");
  const [currentCollege, setCurrentCollege] = useState<string>(profile?.college || "");
  const [isLogging, setIsLogging] = useState(false);
  const [hasLoggedThisSession, setHasLoggedThisSession] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  useEffect(() => {
    setAcademicYear(getAcademicYear());
  }, []);

  const handleLogVisit = async () => {
    if (!purpose || !profile || !firestore || !currentCollege) {
      toast({
        title: "Incomplete Details",
        description: "Please specify your department and purpose of visit.",
        variant: "destructive"
      });
      return;
    }

    setIsLogging(true);
    try {
      await addDoc(collection(firestore, 'visits'), {
        userId: profile.id,
        userName: profile.displayName,
        college: currentCollege,
        roleAtTime: profile.role,
        purpose: purpose,
        timestamp: serverTimestamp(),
        academicYear: getAcademicYear()
      });
      toast({
        title: "Visit Transmitted",
        description: `Your presence in ${currentCollege} has been officially recorded.`,
      });
      setHasLoggedThisSession(true);
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Institutional servers are currently unreachable. Retrying...",
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

  const navItems = [
    { id: 'log-entry', label: 'Entry Log', icon: History },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'help', label: 'Help Guide', icon: HelpCircle },
    { id: 'profile', label: 'My Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col overflow-hidden neu-mesh-gradient">
      {/* Dynamic background decorations */}
      <div className="fixed top-[-5%] left-[-5%] w-[350px] h-[350px] bg-primary/5 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[350px] h-[350px] bg-secondary/5 rounded-full blur-3xl animate-blob delay-1000 pointer-events-none" />
      <div className="fixed top-[40%] right-[10%] w-[200px] h-[200px] bg-primary/5 rounded-full blur-3xl animate-blob delay-2000 pointer-events-none" />

      <header className="relative z-50 p-4 bg-primary text-white sticky top-0 shadow-2xl border-b border-white/10 backdrop-blur-md bg-primary/95">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1.5 rounded-xl shadow-xl w-10 h-10 relative overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => setSubView('log-entry')}>
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain p-1 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-xl font-black tracking-tighter italic uppercase leading-none">NEU ACCESS</h1>
              <span className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] opacity-90">Institutional Hub</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 p-1 bg-white/10 rounded-2xl backdrop-blur-sm">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setSubView(item.id as UserSubView)}
                    className={cn(
                        "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 rounded-xl",
                        subView === item.id ? "bg-secondary text-primary shadow-lg scale-105" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                {profile?.isAuthorizedAdmin && (
                  <Button variant="neuSecondary" size="sm" onClick={() => switchRole('admin')} className="h-10 px-6 gap-2 font-black text-[10px] uppercase rounded-xl hover:scale-105 transition-transform shadow-xl">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="hidden xs:inline">Admin Mode</span>
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-11 w-11 border-2 border-secondary/50 shadow-2xl cursor-pointer hover:scale-110 transition-transform duration-300">
                      <AvatarImage src={profile?.photoURL} />
                      <AvatarFallback className="bg-secondary text-primary font-black text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 mt-4 border-none shadow-2xl bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2">
                    <DropdownMenuItem onClick={() => setSubView('profile')} className="rounded-2xl h-14 gap-4 cursor-pointer focus:bg-primary/5 transition-all">
                      <Settings className="h-5 w-5 text-primary" />
                      <span className="font-bold text-sm text-primary">My Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="rounded-2xl h-14 gap-4 text-destructive focus:bg-destructive/5 cursor-pointer transition-all">
                      <LogOut className="h-5 w-5" />
                      <span className="font-black uppercase text-xs tracking-widest">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden text-white h-11 w-11 hover:bg-white/10 rounded-2xl"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                </Button>
            </div>
          </div>
        </div>
        
        {isMobileMenuOpen && (
            <div className="lg:hidden bg-primary p-6 border-t border-white/10 shadow-2xl space-y-3 animate-in slide-in-from-top-4 duration-300">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setSubView(item.id as UserSubView);
                            setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                            "w-full flex items-center gap-5 p-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all",
                            subView === item.id ? "bg-secondary text-primary shadow-xl scale-105" : "text-white/70 hover:bg-white/10"
                        )}
                    >
                        <item.icon className="h-6 w-6" />
                        {item.label}
                    </button>
                ))}
            </div>
        )}
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 lg:p-16 animate-in fade-in duration-1000">
        {subView === 'log-entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-start">
            <div className="lg:col-span-8 space-y-12 md:space-y-20">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 md:gap-14 text-center sm:text-left">
                  <div className="relative">
                    <Avatar className="h-32 w-32 md:h-44 md:w-44 border-4 border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] animate-in zoom-in-50 duration-700">
                      <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                      <AvatarFallback className="bg-secondary text-primary font-black text-4xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-2xl shadow-xl border border-muted animate-in fade-in zoom-in duration-1000 delay-500">
                       {isGuest ? <Globe className="h-8 w-8 text-primary" /> : <Sparkles className="h-8 w-8 text-primary" />}
                    </div>
                  </div>
                  <div className="space-y-5 pt-4">
                    <div className="inline-flex items-center gap-3 bg-primary/5 text-primary border border-primary/10 px-6 py-2 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.3em] shadow-sm animate-in slide-in-from-left-4 duration-700">
                       {isGuest ? "GUEST VISITOR ACCESS" : `ACADEMIC YEAR ${academicYear || "2024-25"}`}
                    </div>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-primary tracking-tighter leading-[0.8] drop-shadow-sm">
                      {isGuest ? "Hello," : "Welcome,"} <br />
                      <span className="text-secondary italic drop-shadow-none">{profile?.displayName?.split(' ')[0]}!</span>
                    </h1>
                  </div>
                </div>
              </div>

              {!hasLoggedThisSession ? (
                <Card className="neu-card-shadow border-none overflow-hidden rounded-[3.5rem] bg-white relative animate-in slide-in-from-bottom-8 duration-700 delay-300">
                    <CardHeader className="p-12 md:p-20 border-b bg-muted/20">
                    <CardTitle className="text-4xl md:text-6xl font-black text-primary flex items-center gap-8 italic tracking-tighter uppercase">
                        <History className="h-10 w-10 md:h-14 md:w-14 text-secondary" />
                        Log Your Entry
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="p-12 md:p-20 lg:p-24 space-y-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
                        <div className="space-y-8">
                        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.5em] ml-6 opacity-60 flex items-center gap-3">
                            <Building2 className="h-4 w-4" />
                            Department
                        </label>
                        <Select value={currentCollege} onValueChange={setCurrentCollege}>
                            <SelectTrigger className="h-24 md:h-28 text-2xl md:text-3xl font-black rounded-[2.5rem] border-4 border-muted focus:ring-primary shadow-inner px-12 bg-muted/10 transition-all hover:border-primary/20 hover:scale-[1.01]">
                                <SelectValue placeholder="Target" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[3rem] p-4 shadow-3xl border-none max-h-[400px]">
                                {NEU_COLLEGES.map((college) => (
                                    <SelectItem key={college.id} value={college.id} className="rounded-2xl h-16 md:h-20 font-bold px-10 text-xl md:text-2xl italic">
                                        {college.name} ({college.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        </div>

                        <div className="space-y-8">
                        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.5em] ml-6 opacity-60 flex items-center gap-3">
                            <BookOpen className="h-4 w-4" />
                            Core Purpose
                        </label>
                        <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger className="h-24 md:h-28 text-2xl md:text-3xl font-black rounded-[2.5rem] border-4 border-muted focus:ring-primary shadow-inner px-12 bg-muted/10 transition-all hover:border-primary/20 hover:scale-[1.01]">
                            <SelectValue placeholder="Activity" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[3rem] p-4 shadow-3xl border-none max-h-[350px]">
                            <SelectItem value="reading books" className="rounded-2xl h-16 font-bold px-10 text-xl">📖 Research Reading</SelectItem>
                            <SelectItem value="research in thesis" className="rounded-2xl h-16 font-bold px-10 text-xl">🔬 Capstone Study</SelectItem>
                            <SelectItem value="use of computer" className="rounded-2xl h-16 font-bold px-10 text-xl">💻 Computer Access</SelectItem>
                            <SelectItem value="doing assignments" className="rounded-2xl h-16 font-bold px-10 text-xl">📝 Task Completion</SelectItem>
                            <SelectItem value="group study" className="rounded-2xl h-16 font-bold px-10 text-xl">🤝 Group Sessions</SelectItem>
                            {!isGuest && <SelectItem value="consultation" className="rounded-2xl h-16 font-bold px-10 text-xl">💬 Faculty Consult</SelectItem>}
                            <SelectItem value="charging device" className="rounded-2xl h-16 font-bold px-10 text-xl">⚡ Device Charging</SelectItem>
                            <SelectItem value="resting/waiting" className="rounded-2xl h-16 font-bold px-10 text-xl">⌛ Hub Waiting</SelectItem>
                            <SelectItem value="printing/scanning" className="rounded-2xl h-16 font-bold px-10 text-xl">🖨️ Document Lab</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </div>

                    <Button 
                        onClick={handleLogVisit} 
                        variant="neu"
                        disabled={!purpose || !currentCollege || isLogging}
                        className="w-full h-28 md:h-36 text-3xl md:text-4xl font-black rounded-[3rem] py-10 gap-8 group overflow-hidden relative shadow-[0_32px_80px_-20px_rgba(0,77,38,0.25)] mt-8 transition-all active:scale-[0.98] hover:scale-[1.01]"
                    >
                        {isLogging ? (
                        <div className="flex items-center gap-8">
                            <div className="h-12 w-12 border-4 border-white border-t-transparent animate-spin rounded-full" />
                            TRANSMITTING...
                        </div>
                        ) : (
                        <>
                            <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-secondary group-hover:scale-125 transition-transform duration-700" />
                            AUTHORIZE ENTRY
                        </>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-3 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    </CardContent>
                </Card>
              ) : (
                <Card className="neu-card-shadow border-none overflow-hidden rounded-[4rem] bg-primary relative animate-in zoom-in duration-1000">
                   {/* Animated background internal to success card */}
                   <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                   
                   <div className="p-24 md:p-36 flex flex-col items-center text-center gap-14 relative z-10">
                      <div className="h-48 w-48 md:h-64 md:w-64 bg-white/10 rounded-[3rem] flex items-center justify-center border-8 border-dashed border-secondary/30 animate-pulse group">
                         <Trophy className="h-24 w-24 md:h-36 md:w-36 text-secondary group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="space-y-8">
                         <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white italic tracking-tighter uppercase">Entry Synced!</h2>
                         <p className="text-white/60 text-2xl md:text-3xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Academic attendance record secured. You are now authorized for institutional facility access.
                         </p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-8 w-full max-w-xl pt-6">
                          <Button 
                            variant="outline" 
                            size="xl" 
                            onClick={logout}
                            className="flex-1 h-24 border-white/20 bg-white/5 text-white hover:bg-white/10 gap-5 rounded-[2.5rem] font-black uppercase tracking-widest text-sm transition-all"
                          >
                             <LogOut className="h-6 w-6" />
                             Terminate
                          </Button>
                          <Button 
                            variant="neuSecondary" 
                            size="xl" 
                            onClick={() => setHasLoggedThisSession(false)}
                            className="flex-1 h-24 gap-5 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-3xl hover:scale-105 active:scale-95 transition-all"
                          >
                             <RefreshCcw className="h-6 w-6" />
                             Repeat Log
                          </Button>
                      </div>
                   </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-4 space-y-12 md:space-y-20 lg:sticky lg:top-36">
              <Card className="neu-card-shadow border-none rounded-[3.5rem] bg-white overflow-hidden shadow-2xl relative group">
                {/* Subtle hover overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-700 pointer-events-none" />
                
                <div className="bg-primary p-12 text-center space-y-5 relative">
                  <div className="inline-flex items-center gap-3 bg-white/10 text-white border border-white/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                    <Library className="h-4 w-4 text-secondary animate-pulse" />
                    Live Status
                  </div>
                  <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Library Hub</h3>
                </div>
                <CardContent className="p-12 space-y-10">
                    <div className="flex items-center gap-8 p-8 bg-muted/30 rounded-[2.5rem] border-2 border-muted transition-all hover:border-primary/10">
                        <div className="bg-primary p-5 rounded-3xl shadow-xl backdrop-blur-sm">
                            <Clock className="h-10 w-10 text-secondary" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-1">Operational</p>
                            <p className="text-3xl font-black italic tracking-tight text-primary">08:00 - 17:00</p>
                        </div>
                    </div>
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center gap-4 text-green-600">
                        <div className="h-4 w-4 bg-green-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(22,163,74,0.5)]" />
                        <span className="font-black text-base uppercase tracking-widest">Connectivity Secured</span>
                      </div>
                      <p className="text-base font-medium text-muted-foreground leading-relaxed italic">
                        Real-time logging is strictly mandatory. Visit synchronization ensures academic integrity and resource planning.
                      </p>
                    </div>
                </CardContent>
              </Card>
              
              <LiveClock className="bg-white border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-10 !flex-col text-primary rounded-[3.5rem] animate-in slide-in-from-right-8 duration-1000 delay-500" />
            </div>
          </div>
        )}

        {subView === 'feedback' && <FeedbackView />}
        {subView === 'help' && <HelpView />}
        {subView === 'profile' && <ProfileView />}
      </main>

      <footer className="relative z-10 p-14 text-center bg-white/50 backdrop-blur-md border-t mt-auto animate-in fade-in duration-1000">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-5 group cursor-default">
                <Library className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform duration-500" />
                <span className="font-black text-2xl uppercase tracking-[0.4em] text-primary italic">NEU ACCESS HUB</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-muted-foreground/40 text-center animate-pulse">
                © {new Date().getFullYear()} NEW ERA UNIVERSITY • INSTITUTIONAL GATEWAY
            </p>
        </div>
      </footer>
    </div>
  );
}