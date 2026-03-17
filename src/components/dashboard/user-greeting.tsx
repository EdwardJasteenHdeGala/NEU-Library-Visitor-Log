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
        description: "Please specify your college and purpose of visit.",
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
        title: "Visit Logged",
        description: `Institutional entry for ${currentCollege} recorded successfully.`,
      });
      setHasLoggedThisSession(true);
    } catch (error) {
      toast({
        title: "Transmission Failed",
        description: "Unable to sync with library servers. Please check your connection.",
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
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col overflow-x-hidden">
      <header className="p-4 bg-primary text-white sticky top-0 z-50 shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1.5 rounded-xl shadow-xl w-10 h-10 relative overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => setSubView('log-entry')}>
                <Image src={logoImage?.imageUrl || "https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg"} alt="NEU" fill className="object-contain p-1 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-xl font-black tracking-tighter italic uppercase leading-none">NEU ACCESS</h1>
              <span className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] opacity-90">Institutional Hub</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 p-1 bg-white/10 rounded-2xl">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setSubView(item.id as UserSubView)}
                    className={cn(
                        "px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 rounded-xl",
                        subView === item.id ? "bg-secondary text-primary shadow-lg" : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                {profile?.isAuthorizedAdmin && (
                  <Button variant="neuSecondary" size="sm" onClick={() => switchRole('admin')} className="h-10 px-4 gap-2 font-black text-[10px] uppercase rounded-xl hover:scale-105 transition-transform">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="hidden xs:inline">Admin Mode</span>
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 border-2 border-secondary/50 shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300">
                      <AvatarImage src={profile?.photoURL} />
                      <AvatarFallback className="bg-secondary text-primary font-black text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 mt-2 border-none shadow-2xl">
                    <DropdownMenuItem onClick={() => setSubView('profile')} className="rounded-xl h-11 gap-3 cursor-pointer">
                      <Settings className="h-4 w-4 text-primary" />
                      <span className="font-bold">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="rounded-xl h-11 gap-3 text-destructive focus:bg-destructive/5 cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      <span className="font-black uppercase text-xs tracking-widest">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden text-white h-10 w-10 hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>
          </div>
        </div>
        
        {isMobileMenuOpen && (
            <div className="lg:hidden bg-primary p-4 border-t border-white/10 shadow-2xl space-y-2 animate-in slide-in-from-top-4 duration-300">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setSubView(item.id as UserSubView);
                            setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                            subView === item.id ? "bg-secondary text-primary" : "text-white/70 hover:bg-white/10"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </button>
                ))}
            </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 lg:p-16 animate-in fade-in duration-1000">
        {subView === 'log-entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
            <div className="lg:col-span-8 space-y-10 md:space-y-16">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 md:gap-12 text-center sm:text-left">
                  <div className="relative">
                    <Avatar className="h-28 w-28 md:h-40 md:w-40 border-4 border-white shadow-2xl animate-in zoom-in-50 duration-700">
                      <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                      <AvatarFallback className="bg-secondary text-primary font-black text-4xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-xl border border-muted">
                       {isGuest ? <Globe className="h-6 w-6 text-primary" /> : <Sparkles className="h-6 w-6 text-primary" />}
                    </div>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="inline-flex items-center gap-3 bg-primary/5 text-primary border border-primary/10 px-5 py-2 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">
                       {isGuest ? "GUEST VISITOR ACCESS" : `ACADEMIC YEAR ${academicYear || "2024-25"}`}
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-primary tracking-tighter leading-[0.8] drop-shadow-sm">
                      {isGuest ? "Hello," : "Welcome,"} <br />
                      <span className="text-secondary italic drop-shadow-none">{profile?.displayName?.split(' ')[0]}!</span>
                    </h1>
                  </div>
                </div>
              </div>

              {!hasLoggedThisSession ? (
                <Card className="neu-card-shadow border-none overflow-hidden rounded-[3rem] bg-white relative">
                    <CardHeader className="p-10 md:p-16 border-b bg-muted/20">
                    <CardTitle className="text-3xl md:text-5xl font-black text-primary flex items-center gap-6 italic tracking-tighter uppercase">
                        <History className="h-8 w-8 md:h-12 md:w-12 text-secondary" />
                        Visitation Log
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 md:p-16 lg:p-20 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                        <div className="space-y-6">
                        <label className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.4em] ml-4 opacity-70 flex items-center gap-3">
                            <Building2 className="h-4 w-4" />
                            Academic Department
                        </label>
                        <Select value={currentCollege} onValueChange={setCurrentCollege}>
                            <SelectTrigger className="h-20 md:h-24 text-xl md:text-2xl font-black rounded-[2rem] border-4 border-muted focus:ring-primary shadow-inner px-10 bg-muted/10 transition-all hover:border-primary/20">
                                <SelectValue placeholder="Select Dept" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[2.5rem] p-3 shadow-2xl border-none max-h-[400px]">
                                {NEU_COLLEGES.map((college) => (
                                    <SelectItem key={college.id} value={college.id} className="rounded-2xl h-14 md:h-16 font-bold px-8 text-lg md:text-xl italic">
                                        {college.name} ({college.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        </div>

                        <div className="space-y-6">
                        <label className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.4em] ml-4 opacity-70 flex items-center gap-3">
                            <BookOpen className="h-4 w-4" />
                            Visit Purpose
                        </label>
                        <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger className="h-20 md:h-24 text-xl md:text-2xl font-black rounded-[2rem] border-4 border-muted focus:ring-primary shadow-inner px-10 bg-muted/10 transition-all hover:border-primary/20">
                            <SelectValue placeholder="Select Reason" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[2.5rem] p-3 shadow-2xl border-none max-h-[300px]">
                            <SelectItem value="reading books" className="rounded-2xl h-14 font-bold px-8 text-lg">📖 Reading Materials</SelectItem>
                            <SelectItem value="research in thesis" className="rounded-2xl h-14 font-bold px-8 text-lg">🔬 Thesis Research</SelectItem>
                            <SelectItem value="use of computer" className="rounded-2xl h-14 font-bold px-8 text-lg">💻 Digital Lab Access</SelectItem>
                            <SelectItem value="doing assignments" className="rounded-2xl h-14 font-bold px-8 text-lg">📝 Assignment Work</SelectItem>
                            <SelectItem value="group study" className="rounded-2xl h-14 font-bold px-8 text-lg">🤝 Collaborative Study</SelectItem>
                            {!isGuest && <SelectItem value="consultation" className="rounded-2xl h-14 font-bold px-8 text-lg">💬 Faculty Meeting</SelectItem>}
                            <SelectItem value="charging device" className="rounded-2xl h-14 font-bold px-8 text-lg">⚡ Power / Charging</SelectItem>
                            <SelectItem value="resting/waiting" className="rounded-2xl h-14 font-bold px-8 text-lg">⌛ Waiting Area</SelectItem>
                            <SelectItem value="printing/scanning" className="rounded-2xl h-14 font-bold px-8 text-lg">🖨️ Document Services</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </div>

                    <Button 
                        onClick={handleLogVisit} 
                        variant="neu"
                        disabled={!purpose || !currentCollege || isLogging}
                        className="w-full h-24 md:h-32 text-2xl md:text-4xl font-black rounded-[2.5rem] py-10 gap-6 group overflow-hidden relative shadow-2xl mt-6 transition-all active:scale-[0.98]"
                    >
                        {isLogging ? (
                        <div className="flex items-center gap-6">
                            <div className="h-10 w-10 border-4 border-white border-t-transparent animate-spin rounded-full" />
                            TRANSMITTING...
                        </div>
                        ) : (
                        <>
                            <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-secondary group-hover:scale-125 transition-transform duration-500" />
                            COMPLETE LOG ENTRY
                        </>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-2 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    </CardContent>
                </Card>
              ) : (
                <Card className="neu-card-shadow border-none overflow-hidden rounded-[3rem] bg-primary relative animate-in zoom-in duration-700">
                   <div className="p-20 md:p-32 flex flex-col items-center text-center gap-12">
                      <div className="h-40 w-40 md:h-60 md:w-60 bg-white/10 rounded-full flex items-center justify-center border-8 border-dashed border-secondary/30 animate-pulse">
                         <Trophy className="h-20 w-20 md:h-32 md:w-32 text-secondary" />
                      </div>
                      <div className="space-y-6">
                         <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white italic tracking-tighter uppercase">Entry Verified!</h2>
                         <p className="text-white/60 text-xl md:text-2xl font-medium max-w-lg mx-auto leading-relaxed">
                            Attendance record transmitted. You are cleared for institutional facility access.
                         </p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-6 w-full max-w-md pt-4">
                          <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={logout}
                            className="flex-1 h-20 border-white/20 bg-white/5 text-white hover:bg-white/10 gap-4 rounded-[2rem] font-black uppercase tracking-widest text-xs"
                          >
                             <LogOut className="h-5 w-5" />
                             Terminate
                          </Button>
                          <Button 
                            variant="neuSecondary" 
                            size="lg" 
                            onClick={() => setHasLoggedThisSession(false)}
                            className="flex-1 h-20 gap-4 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl"
                          >
                             <RefreshCcw className="h-5 w-5" />
                             New Log
                          </Button>
                      </div>
                   </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-4 space-y-10 md:space-y-16 lg:sticky lg:top-32">
              <Card className="neu-card-shadow border-none rounded-[3rem] bg-white overflow-hidden shadow-2xl">
                <div className="bg-primary p-12 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                    <Library className="h-3.5 w-3.5 text-secondary" />
                    Institutional Hub
                  </div>
                  <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Facility Status</h3>
                </div>
                <CardContent className="p-10 space-y-8">
                    <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-3xl border border-muted">
                        <div className="bg-primary p-4 rounded-2xl shadow-inner backdrop-blur-sm">
                            <Clock className="h-8 w-8 text-secondary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Operational</p>
                            <p className="text-2xl font-black italic tracking-tight text-primary">08:00 - 17:00</p>
                        </div>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-3 text-green-600">
                        <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse" />
                        <span className="font-black text-sm uppercase tracking-widest">Systems Online</span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                        Real-time visitor logging is mandatory for all academic facilities. Ensure your ID is valid.
                      </p>
                    </div>
                </CardContent>
              </Card>
              
              <LiveClock className="bg-white border-none shadow-2xl p-8 !flex-col text-primary rounded-[3rem]" />
            </div>
          </div>
        )}

        {subView === 'feedback' && <FeedbackView />}
        {subView === 'help' && <HelpView />}
        {subView === 'profile' && <ProfileView />}
      </main>

      <footer className="p-12 text-center bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4 group cursor-default">
                <Library className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
                <span className="font-black text-lg uppercase tracking-[0.3em] text-primary italic">NEU ACCESS HUB</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 text-center">
                © {new Date().getFullYear()} NEW ERA UNIVERSITY • EXTERNAL ACCESS ENABLED
            </p>
        </div>
      </footer>
    </div>
  );
}
