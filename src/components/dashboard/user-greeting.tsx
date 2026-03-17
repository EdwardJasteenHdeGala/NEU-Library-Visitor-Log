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

  const handleSubViewChange = (view: UserSubView) => {
    setSubView(view);
    setIsMobileMenuOpen(false);
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
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden neu-mesh-gradient">
      {/* Optimized background decorations */}
      <div className="fixed top-[-5%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] animate-blob pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-secondary/5 rounded-full blur-[80px] animate-blob delay-1000 pointer-events-none" />
      <div className="neu-bg-overlay" />

      <header className="relative z-[70] p-3 md:p-4 bg-primary text-white sticky top-0 shadow-xl border-b border-white/10 backdrop-blur-xl bg-primary/95">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div 
              className="bg-white p-1 rounded-xl shadow-xl w-8 h-8 md:w-10 md:h-10 relative overflow-hidden flex items-center justify-center group cursor-pointer" 
              onClick={() => handleSubViewChange('log-entry')}
            >
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill priority className="object-contain p-1 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-lg md:text-xl font-black tracking-tighter italic uppercase leading-none">NEU ACCESS</h1>
              <span className="text-[8px] md:text-[9px] font-black text-secondary uppercase tracking-[0.3em] opacity-90">Institutional Hub</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 p-1 bg-white/10 rounded-2xl backdrop-blur-sm">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleSubViewChange(item.id as UserSubView)}
                    className={cn(
                        "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 rounded-xl whitespace-nowrap",
                        subView === item.id ? "bg-secondary text-primary shadow-lg scale-105" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {profile?.isAuthorizedAdmin && (
              <Button 
                variant="neuSecondary" 
                size="sm" 
                onClick={() => switchRole('admin')} 
                className="h-9 md:h-10 px-4 md:px-6 gap-2 font-black text-[9px] md:text-[10px] uppercase rounded-xl hover:scale-105 transition-transform shadow-xl"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden xs:inline">Admin Mode</span>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-secondary/50 shadow-2xl cursor-pointer hover:scale-110 transition-transform duration-300">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-secondary text-primary font-black text-[10px] md:text-xs">{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 mt-4 border-none shadow-2xl bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2">
                <DropdownMenuItem onClick={() => handleSubViewChange('profile')} className="rounded-2xl h-12 md:h-14 gap-4 cursor-pointer focus:bg-primary/5 transition-all">
                  <Settings className="h-5 w-5 text-primary" />
                  <span className="font-bold text-sm text-primary">My Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="rounded-2xl h-12 md:h-14 gap-4 text-destructive focus:bg-destructive/5 cursor-pointer transition-all">
                  <LogOut className="h-5 w-5" />
                  <span className="font-black uppercase text-[10px] md:text-xs tracking-widest">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-white h-9 w-9 md:h-11 md:w-11 hover:bg-white/10 rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Nav */}
        {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-x-0 top-[60px] md:top-[75px] bg-primary p-6 border-t border-white/10 shadow-2xl space-y-2 animate-in slide-in-from-top-4 duration-300 z-[60] max-h-[80vh] overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleSubViewChange(item.id as UserSubView)}
                        className={cn(
                            "w-full flex items-center gap-5 p-4 rounded-[1.5rem] font-black text-xs md:text-sm uppercase tracking-widest transition-all",
                            subView === item.id ? "bg-secondary text-primary shadow-xl scale-[1.02]" : "text-white/70 hover:bg-white/10"
                        )}
                    >
                        <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                        {item.label}
                    </button>
                ))}
            </div>
        )}
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 md:p-12 lg:p-16 animate-in fade-in duration-1000">
        {subView === 'log-entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            <div className="lg:col-span-8 space-y-8 md:space-y-12">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 text-center sm:text-left">
                  <div className="relative shrink-0">
                    <Avatar className="h-28 w-28 md:h-40 md:w-40 border-4 border-white shadow-2xl animate-in zoom-in-50 duration-700">
                      <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                      <AvatarFallback className="bg-secondary text-primary font-black text-3xl md:text-4xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 md:p-2.5 rounded-2xl shadow-xl border border-muted animate-in fade-in zoom-in duration-1000 delay-500">
                       {isGuest ? <Globe className="h-5 w-5 md:h-7 md:w-7 text-primary" /> : <Sparkles className="h-5 w-5 md:h-7 md:w-7 text-primary" />}
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-4 pt-2">
                    <div className="inline-flex items-center gap-3 bg-primary/5 text-primary border border-primary/10 px-4 md:px-5 py-2 rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-[0.3em] shadow-sm animate-in slide-in-from-left-4 duration-700">
                       {isGuest ? "GUEST VISITOR ACCESS" : `ACADEMIC YEAR ${academicYear || "2024-25"}`}
                    </div>
                    <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-primary tracking-tighter leading-[0.85]">
                      {isGuest ? "Hello," : "Welcome,"} <br className="hidden xs:block" />
                      <span className="text-secondary italic">{profile?.displayName?.split(' ')[0]}!</span>
                    </h1>
                  </div>
                </div>
              </div>

              {!hasLoggedThisSession ? (
                <Card className="neu-card-shadow border-none overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white relative animate-in slide-in-from-bottom-8 duration-700 delay-300">
                    <CardHeader className="p-6 md:p-10 border-b bg-muted/20">
                    <CardTitle className="text-2xl md:text-4xl font-black text-primary flex items-center gap-4 md:gap-6 italic tracking-tighter uppercase">
                        <History className="h-6 w-6 md:h-10 md:w-10 text-secondary" />
                        Log Your Entry
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10 space-y-8 md:space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        <div className="space-y-3 md:space-y-4">
                        <label className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 md:ml-4 opacity-60 flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            Department
                        </label>
                        <Select value={currentCollege} onValueChange={setCurrentCollege}>
                            <SelectTrigger className="h-14 md:h-16 text-base md:text-lg font-black rounded-2xl border-2 border-muted focus:ring-primary shadow-inner px-4 md:px-6 bg-muted/10">
                                <SelectValue placeholder="Target" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl md:rounded-[2rem] p-2 md:p-3 shadow-3xl border-none max-h-[300px] md:max-h-[350px]">
                                {NEU_COLLEGES.map((college) => (
                                    <SelectItem key={college.id} value={college.id} className="rounded-xl h-12 md:h-14 font-bold px-4 md:px-6 text-xs md:text-sm italic">
                                        {college.name} ({college.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                        <label className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] ml-2 md:ml-4 opacity-60 flex items-center gap-2">
                            <BookOpen className="h-3 w-3" />
                            Core Purpose
                        </label>
                        <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger className="h-14 md:h-16 text-base md:text-lg font-black rounded-2xl border-2 border-muted focus:ring-primary shadow-inner px-4 md:px-6 bg-muted/10">
                            <SelectValue placeholder="Activity" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl md:rounded-[2rem] p-2 md:p-3 shadow-3xl border-none max-h-[300px] md:max-h-[350px]">
                            <SelectItem value="reading books" className="rounded-xl h-12 md:h-14 font-bold px-4 md:px-6 text-xs md:text-sm">📖 Research Reading</SelectItem>
                            <SelectItem value="research in thesis" className="rounded-xl h-12 md:h-14 font-bold px-4 md:px-6 text-xs md:text-sm">🔬 Capstone Study</SelectItem>
                            <SelectItem value="use of computer" className="rounded-xl h-12 md:h-14 font-bold px-4 md:px-6 text-xs md:text-sm">💻 Computer Access</SelectItem>
                            <SelectItem value="doing assignments" className="rounded-xl h-12 md:h-14 font-bold px-4 md:px-6 text-xs md:text-sm">📝 Task Completion</SelectItem>
                            <SelectItem value="group study" className="rounded-xl h-12 md:h-14 font-bold px-4 md:px-6 text-xs md:text-sm">🤝 Group Sessions</SelectItem>
                            {!isGuest && <SelectItem value="consultation" className="rounded-xl h-12 md:h-14 font-bold px-4 md:px-6 text-xs md:text-sm">💬 Faculty Consult</SelectItem>}
                            <SelectItem value="charging device" className="rounded-xl h-12 md:h-14 font-bold px-4 md:px-6 text-xs md:text-sm">⚡ Device Charging</SelectItem>
                            <SelectItem value="resting/waiting" className="rounded-xl h-12 md:h-14 font-bold px-4 md:px-6 text-xs md:text-sm">⌛ Hub Waiting</SelectItem>
                            <SelectItem value="printing/scanning" className="rounded-xl h-12 md:h-14 font-bold px-4 md:px-6 text-xs md:text-sm">🖨️ Document Lab</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </div>

                    <Button 
                        onClick={handleLogVisit} 
                        variant="neu"
                        disabled={!purpose || !currentCollege || isLogging}
                        className="w-full h-16 md:h-24 text-xl md:text-3xl font-black rounded-2xl md:rounded-[2rem] gap-4 md:gap-6 shadow-2xl transition-all active:scale-[0.98] hover:scale-[1.01]"
                    >
                        {isLogging ? (
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="h-8 w-8 md:h-10 md:w-10 border-4 border-white border-t-transparent animate-spin rounded-full" />
                            TRANSMITTING...
                        </div>
                        ) : (
                        <>
                            <CheckCircle2 className="h-8 w-8 md:h-12 md:w-12 text-secondary group-hover:scale-125 transition-transform duration-700" />
                            AUTHORIZE ENTRY
                        </>
                        )}
                    </Button>
                    </CardContent>
                </Card>
              ) : (
                <Card className="neu-card-shadow border-none overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-primary relative animate-in zoom-in duration-1000">
                   <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                   
                   <div className="p-10 md:p-24 flex flex-col items-center text-center gap-8 md:gap-10 relative z-10">
                      <div className="h-28 w-28 md:h-44 md:w-44 bg-white/10 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center border-4 border-dashed border-secondary/30 animate-pulse">
                         <Trophy className="h-14 w-14 md:h-24 md:w-24 text-secondary" />
                      </div>
                      <div className="space-y-4 md:space-y-6">
                         <h2 className="text-3xl md:text-6xl font-black text-white italic tracking-tighter uppercase">Entry Synced!</h2>
                         <p className="text-white/60 text-base md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
                            Academic attendance record secured. You are now authorized for institutional facility access.
                         </p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-md pt-4">
                          <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={logout}
                            className="flex-1 h-14 md:h-16 border-white/20 bg-white/5 text-white hover:bg-white/10 gap-3 rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px]"
                          >
                             <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                             Terminate
                          </Button>
                          <Button 
                            variant="neuSecondary" 
                            size="lg" 
                            onClick={() => setHasLoggedThisSession(false)}
                            className="flex-1 h-14 md:h-16 gap-3 rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-3xl"
                          >
                             <RefreshCcw className="h-4 w-4 md:h-5 md:w-5" />
                             Repeat Log
                          </Button>
                      </div>
                   </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6 md:space-y-10 lg:sticky lg:top-36">
              <Card className="neu-card-shadow border-none rounded-[2rem] md:rounded-[2.5rem] bg-white overflow-hidden shadow-2xl relative group">
                <div className="bg-primary p-6 md:p-10 text-center space-y-3 md:space-y-4 relative">
                  <div className="inline-flex items-center gap-2 md:gap-3 bg-white/10 text-white border border-white/20 px-4 md:px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                    <Library className="h-4 w-4 text-secondary animate-pulse" />
                    Live Status
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Library Hub</h3>
                </div>
                <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-muted/30 rounded-2xl md:rounded-3xl border-2 border-muted transition-all hover:border-primary/10">
                        <div className="bg-primary p-3 md:p-4 rounded-xl shadow-xl backdrop-blur-sm">
                            <Clock className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-1">Operational</p>
                            <p className="text-xl md:text-2xl font-black italic tracking-tight text-primary">08:00 - 17:00</p>
                        </div>
                    </div>
                    <div className="space-y-3 md:space-y-4 pt-2">
                      <div className="flex items-center gap-2 md:gap-3 text-green-600">
                        <div className="h-2 w-2 md:h-3 md:w-3 bg-green-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(22,163,74,0.5)]" />
                        <span className="font-black text-[10px] md:text-xs uppercase tracking-widest">Connectivity Secured</span>
                      </div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground leading-relaxed italic">
                        Real-time logging is strictly mandatory. Visit synchronization ensures academic integrity.
                      </p>
                    </div>
                </CardContent>
              </Card>
              
              <LiveClock className="bg-white border-none shadow-2xl p-6 md:p-8 !flex-col text-primary rounded-[2rem] md:rounded-[2.5rem] animate-in slide-in-from-right-8 duration-1000 delay-500" />
            </div>
          </div>
        )}

        {subView === 'feedback' && <FeedbackView />}
        {subView === 'help' && <HelpView />}
        {subView === 'profile' && <ProfileView />}
      </main>

      <footer className="relative z-10 p-8 md:p-12 text-center bg-white/30 backdrop-blur-md border-t mt-auto animate-in fade-in duration-1000">
        <div className="max-w-7xl auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <div className="flex items-center gap-4 md:gap-5 group cursor-default">
                <Library className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                <span className="font-black text-lg md:text-xl uppercase tracking-[0.3em] text-primary italic leading-none">NEU ACCESS HUB</span>
            </div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 text-center animate-pulse">
                © {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB
            </p>
        </div>
      </footer>
    </div>
  );
}