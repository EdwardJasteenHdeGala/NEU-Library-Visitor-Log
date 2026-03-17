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
    { id: 'profile', label: 'My Profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden neu-mesh-gradient">
      <div className="fixed top-[-5%] left-[-5%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[60px] animate-blob pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[60px] animate-blob delay-1000 pointer-events-none" />
      <div className="neu-bg-overlay" />

      <header className="relative z-[70] p-3 bg-primary text-white sticky top-0 shadow-xl border-b border-white/10 backdrop-blur-xl bg-primary/95">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="bg-white p-1 rounded-lg shadow-lg w-8 h-8 relative overflow-hidden flex items-center justify-center group cursor-pointer" 
              onClick={() => handleSubViewChange('log-entry')}
            >
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill priority className="object-contain p-1 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <h1 className="text-sm font-black tracking-tighter italic uppercase leading-none">NEU ACCESS</h1>
              <span className="text-[6px] font-black text-secondary uppercase tracking-[0.2em] opacity-80">Institutional Hub</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-0.5 p-1 bg-white/10 rounded-xl backdrop-blur-sm">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleSubViewChange(item.id as UserSubView)}
                    className={cn(
                        "px-5 py-2 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 rounded-lg whitespace-nowrap",
                        subView === item.id ? "bg-secondary text-primary shadow-lg" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {profile?.isAuthorizedAdmin && (
              <Button 
                variant="neuSecondary" 
                size="sm" 
                onClick={() => switchRole('admin')} 
                className="h-8 px-4 gap-2 font-black text-[8px] uppercase rounded-lg hover:scale-105 transition-all shadow-lg"
              >
                <ShieldCheck className="h-3 w-3" />
                <span className="hidden xs:inline">Admin Mode</span>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-secondary/50 shadow-xl cursor-pointer hover:scale-105 transition-all">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-secondary text-primary font-black text-[9px]">{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 mt-2 border-none shadow-2xl bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2">
                <DropdownMenuItem onClick={() => handleSubViewChange('profile')} className="rounded-xl h-11 gap-3 cursor-pointer focus:bg-primary/5">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="font-bold text-xs text-primary">Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="rounded-xl h-11 gap-3 text-destructive focus:bg-destructive/5 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <span className="font-black uppercase text-[9px] tracking-widest">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-white h-9 w-9 hover:bg-white/10 rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Nav */}
        {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-x-0 top-[60px] bg-primary p-4 border-t border-white/10 shadow-2xl space-y-1 animate-in slide-in-from-top-4 duration-300 z-[60]">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleSubViewChange(item.id as UserSubView)}
                        className={cn(
                            "w-full flex items-center gap-4 p-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                            subView === item.id ? "bg-secondary text-primary shadow-lg" : "text-white/70 hover:bg-white/10"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </button>
                ))}
            </div>
        )}
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 animate-in fade-in duration-700">
        {subView === 'log-entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <div className="relative shrink-0">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-2xl animate-in zoom-in-50 duration-500">
                    <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                    <AvatarFallback className="bg-secondary text-primary font-black text-2xl md:text-3xl">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-lg border border-muted">
                     {isGuest ? <Globe className="h-4 w-4 text-primary" /> : <Sparkles className="h-4 w-4 text-primary" />}
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2 pt-1">
                  <div className="inline-flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm">
                     {isGuest ? "GUEST VISITOR ACCESS" : `ACADEMIC YEAR ${academicYear || "2024-25"}`}
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-primary tracking-tighter leading-tight">
                    {isGuest ? "Hello," : "Welcome,"} <br className="hidden xs:block" />
                    <span className="text-secondary italic">{profile?.displayName?.split(' ')[0]}!</span>
                  </h1>
                </div>
              </div>

              {!hasLoggedThisSession ? (
                <Card className="neu-card-shadow border-none overflow-hidden rounded-[1.5rem] bg-white relative animate-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="p-6 border-b bg-muted/20">
                    <CardTitle className="text-xl md:text-2xl font-black text-primary flex items-center gap-3 italic tracking-tighter uppercase">
                        <History className="h-5 w-5 text-secondary" />
                        Log Your Entry
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                        <label className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2 opacity-60 flex items-center gap-1.5">
                            <Building2 className="h-3 w-3" />
                            Department
                        </label>
                        <Select value={currentCollege} onValueChange={setCurrentCollege}>
                            <SelectTrigger className="h-12 text-sm font-black rounded-xl border-2 border-muted focus:ring-primary shadow-inner bg-muted/10">
                                <SelectValue placeholder="Target" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl p-2 shadow-2xl border-none max-h-[250px]">
                                {NEU_COLLEGES.map((college) => (
                                    <SelectItem key={college.id} value={college.id} className="rounded-lg h-10 font-bold text-xs italic">
                                        {college.name} ({college.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        </div>

                        <div className="space-y-2">
                        <label className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2 opacity-60 flex items-center gap-1.5">
                            <BookOpen className="h-3 w-3" />
                            Core Purpose
                        </label>
                        <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger className="h-12 text-sm font-black rounded-xl border-2 border-muted focus:ring-primary shadow-inner bg-muted/10">
                            <SelectValue placeholder="Activity" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl p-2 shadow-2xl border-none max-h-[250px]">
                            <SelectItem value="reading books" className="rounded-lg h-10 font-bold text-xs">📖 Research Reading</SelectItem>
                            <SelectItem value="research in thesis" className="rounded-lg h-10 font-bold text-xs">🔬 Capstone Study</SelectItem>
                            <SelectItem value="use of computer" className="rounded-lg h-10 font-bold text-xs">💻 Computer Access</SelectItem>
                            <SelectItem value="doing assignments" className="rounded-lg h-10 font-bold text-xs">📝 Task Completion</SelectItem>
                            <SelectItem value="group study" className="rounded-lg h-10 font-bold text-xs">🤝 Group Sessions</SelectItem>
                            {!isGuest && <SelectItem value="consultation" className="rounded-lg h-10 font-bold text-xs">💬 Faculty Consult</SelectItem>}
                            <SelectItem value="charging device" className="rounded-lg h-10 font-bold text-xs">⚡ Device Charging</SelectItem>
                            <SelectItem value="resting/waiting" className="rounded-lg h-10 font-bold text-xs">⌛ Hub Waiting</SelectItem>
                            <SelectItem value="printing/scanning" className="rounded-lg h-10 font-bold text-xs">🖨️ Document Lab</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </div>

                    <Button 
                        onClick={handleLogVisit} 
                        variant="neu"
                        disabled={!purpose || !currentCollege || isLogging}
                        className="w-full h-16 text-lg md:text-xl font-black rounded-xl gap-3 shadow-xl transition-all active:scale-[0.98]"
                    >
                        {isLogging ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Transmitting...
                        </div>
                        ) : (
                        <>
                            <CheckCircle2 className="h-6 w-6 text-secondary" />
                            Authorize Entry
                        </>
                        )}
                    </Button>
                    </CardContent>
                </Card>
              ) : (
                <Card className="neu-card-shadow border-none overflow-hidden rounded-[2rem] bg-primary relative animate-in zoom-in duration-500">
                   <div className="p-10 md:p-16 flex flex-col items-center text-center gap-6 relative z-10">
                      <div className="h-20 w-20 md:h-24 md:h-24 bg-white/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-secondary/30">
                         <Trophy className="h-10 w-10 md:h-12 md:w-12 text-secondary" />
                      </div>
                      <div className="space-y-2">
                         <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase">Entry Synced!</h2>
                         <p className="text-white/60 text-sm md:text-base font-medium max-w-sm mx-auto leading-relaxed">
                            Academic record secured. You are now authorized for institutional facility access.
                         </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs pt-4">
                          <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={logout}
                            className="flex-1 h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 gap-2 rounded-xl font-black uppercase text-[8px] tracking-widest"
                          >
                             <LogOut className="h-4 w-4" />
                             Sign Out
                          </Button>
                          <Button 
                            variant="neuSecondary" 
                            size="lg" 
                            onClick={() => setHasLoggedThisSession(false)}
                            className="flex-1 h-12 gap-2 rounded-xl font-black uppercase text-[8px] tracking-widest shadow-xl"
                          >
                             <RefreshCcw className="h-4 w-4" />
                             Repeat Log
                          </Button>
                      </div>
                   </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <Card className="neu-card-shadow border-none rounded-[1.5rem] bg-white overflow-hidden shadow-xl">
                <div className="bg-primary p-6 text-center space-y-2">
                  <div className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                    <Library className="h-3.5 w-3.5 text-secondary" />
                    Live Status
                  </div>
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Library Hub</h3>
                </div>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border-2 border-muted transition-all">
                        <div className="bg-primary p-2.5 rounded-lg shadow-lg">
                            <Clock className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                            <p className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-0.5">Operational</p>
                            <p className="text-lg font-black italic tracking-tight text-primary">08:00 - 17:00</p>
                        </div>
                    </div>
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.4)]" />
                        <span className="font-black text-[9px] uppercase tracking-widest">Connectivity Online</span>
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic opacity-80">
                        Real-time logging is strictly mandatory for all institutional visitors.
                      </p>
                    </div>
                </CardContent>
              </Card>
              
              <LiveClock className="bg-white border-none shadow-xl p-6 !flex-col text-primary rounded-[1.5rem] scale-95" showSelector={false} />
            </div>
          </div>
        )}

        {subView === 'feedback' && <FeedbackView />}
        {subView === 'help' && <HelpView />}
        {subView === 'profile' && <ProfileView />}
      </main>

      <footer className="relative z-10 p-8 text-center bg-white/30 backdrop-blur-md border-t mt-auto">
        <div className="max-w-7xl auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 opacity-40 group cursor-default">
                <Library className="h-4 w-4 text-primary" />
                <span className="font-black text-sm uppercase tracking-[0.2em] text-primary italic">NEU ACCESS HUB</span>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 text-center">
                © {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB
            </p>
        </div>
      </footer>
    </div>
  );
}