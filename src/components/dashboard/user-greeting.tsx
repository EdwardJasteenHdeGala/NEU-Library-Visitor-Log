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
  Settings,
  Loader2
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
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
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
      <div className="fixed top-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/8 rounded-full blur-[100px] animate-blob pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[100px] animate-blob delay-5000 pointer-events-none z-0" />
      <div className="neu-bg-overlay" />

      <header className="relative z-[70] p-3 bg-primary text-white sticky top-0 shadow-xl border-b border-white/10 backdrop-blur-xl bg-primary/95 h-[60px] flex items-center transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 w-full">
          <div className="flex items-center gap-3">
            <div 
              className="bg-white p-1 rounded-xl shadow-2xl w-9 h-9 relative overflow-hidden flex items-center justify-center group cursor-pointer border border-white/20" 
              onClick={() => handleSubViewChange('log-entry')}
            >
                <Image 
                  src={logoImage?.imageUrl || ""} 
                  alt="NEU" 
                  fill 
                  priority 
                  className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-500"
                  data-ai-hint="university logo"
                />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <h1 className="text-sm font-black tracking-tighter italic uppercase leading-none text-white">NEU HUB</h1>
              <span className="text-[7px] font-black text-secondary uppercase tracking-[0.3em] opacity-80">Institutional Portal</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 p-1 bg-white/5 rounded-2xl backdrop-blur-3xl border border-white/10">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleSubViewChange(item.id as UserSubView)}
                    className={cn(
                        "px-6 py-2 text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2.5 rounded-xl whitespace-nowrap",
                        subView === item.id ? "bg-secondary text-primary shadow-xl" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <item.icon className={cn("h-3.5 w-3.5", subView === item.id ? "text-primary" : "text-white/30")} />
                    {item.label}
                </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {profile?.isAuthorizedAdmin && (
              <Button 
                variant="neuSecondary" 
                size="sm" 
                onClick={() => switchRole('admin')} 
                className="h-9 px-5 gap-2.5 font-black text-[9px] uppercase rounded-xl hover:scale-105 transition-all shadow-xl"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin Mode</span>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 border-2 border-secondary/50 shadow-2xl cursor-pointer hover:scale-110 transition-all duration-500 ring-4 ring-white/5">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-secondary text-primary font-black text-[10px]">{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-[2rem] p-2.5 mt-2 border-none shadow-3xl bg-white/98 backdrop-blur-3xl animate-in slide-in-from-top-3">
                <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground px-4 py-3">User Menu</DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-2 opacity-10" />
                <DropdownMenuItem onClick={() => handleSubViewChange('profile')} className="rounded-xl h-12 gap-4 cursor-pointer focus:bg-primary/5 px-4">
                  <Settings className="h-4.5 w-4.5 text-primary" />
                  <span className="font-bold text-sm text-primary">Portal Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="mx-2 opacity-10" />
                <DropdownMenuItem onClick={logout} className="rounded-xl h-12 gap-4 text-destructive focus:bg-destructive/5 cursor-pointer px-4">
                  <LogOut className="h-4.5 w-4.5" />
                  <span className="font-black uppercase text-[10px] tracking-widest">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-white h-10 w-10 hover:bg-white/10 rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-x-0 top-[60px] bg-primary/98 backdrop-blur-3xl p-5 border-t border-white/10 shadow-3xl space-y-2 animate-in slide-in-from-top-6 duration-500 z-[70]">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleSubViewChange(item.id as UserSubView)}
                        className={cn(
                            "w-full flex items-center gap-5 p-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all",
                            subView === item.id ? "bg-secondary text-primary shadow-xl" : "text-white/70 hover:bg-white/10"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </button>
                ))}
            </div>
        )}
      </header>

      <main className="relative flex-1 w-full max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-1000 pb-24">
        <div className="relative z-10 w-full">
          {subView === 'log-entry' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-8 space-y-12">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 text-center sm:text-left">
                  <div className="relative shrink-0">
                    <Avatar className="h-32 w-32 md:h-44 md:w-44 border-[6px] border-white shadow-3xl animate-in zoom-in-75 duration-700 ring-8 ring-primary/5">
                      <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                      <AvatarFallback className="bg-secondary text-primary font-black text-3xl md:text-5xl italic">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-[1.5rem] shadow-2xl border border-muted ring-4 ring-primary/5">
                       {isGuest ? <Globe className="h-6 w-6 text-primary" /> : <Sparkles className="h-6 w-6 text-primary animate-pulse" />}
                    </div>
                  </div>
                  <div className="space-y-4 pt-4">
                    <div className="inline-flex items-center gap-3 bg-primary/5 text-primary border border-primary/15 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-sm">
                       {isGuest ? "GUEST VISITOR SESSION" : `ACADEMIC CYCLE ${academicYear || "2024-25"}`}
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-primary tracking-[-0.04em] leading-[0.9] uppercase">
                      {isGuest ? "Hello," : "Welcome,"}<br />
                      <span className="text-secondary italic">Researcher {profile?.displayName?.split(' ')[0]}</span>
                    </h1>
                  </div>
                </div>

                {!hasLoggedThisSession ? (
                  <Card className="neu-card-shadow border-none overflow-hidden rounded-[3rem] bg-white relative animate-in slide-in-from-bottom-8 duration-1000 group">
                      <CardHeader className="p-8 md:p-10 border-b bg-muted/30">
                        <CardTitle className="text-2xl md:text-4xl font-black text-primary flex items-center gap-5 italic tracking-tighter uppercase">
                            <History className="h-8 w-8 text-secondary" />
                            Log Attendance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 md:p-12 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 opacity-60 flex items-center gap-3">
                                  <Building2 className="h-5 w-5" />
                                  Academic Unit
                              </label>
                              <Select value={currentCollege} onValueChange={setCurrentCollege}>
                                  <SelectTrigger className="h-20 text-lg font-black rounded-[1.5rem] border-2 border-muted focus:ring-primary shadow-inner bg-muted/5 group-hover:bg-white transition-all">
                                      <SelectValue placeholder="Department" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-[1.5rem] p-2 shadow-3xl border-none max-h-[300px]">
                                      {NEU_COLLEGES.map((college) => (
                                          <SelectItem key={college.id} value={college.id} className="rounded-xl h-14 font-black text-sm italic">
                                              {college.name} • {college.id}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 opacity-60 flex items-center gap-3">
                                  <BookOpen className="h-5 w-5" />
                                  Core Activity
                              </label>
                              <Select value={purpose} onValueChange={setPurpose}>
                                  <SelectTrigger className="h-20 text-lg font-black rounded-[1.5rem] border-2 border-muted focus:ring-primary shadow-inner bg-muted/5 group-hover:bg-white transition-all">
                                  <SelectValue placeholder="Activity Type" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-[1.5rem] p-2 shadow-3xl border-none max-h-[300px]">
                                  <SelectItem value="reading books" className="rounded-xl h-14 font-black text-sm">📖 Knowledge Retrieval</SelectItem>
                                  <SelectItem value="research in thesis" className="rounded-xl h-14 font-black text-sm">🔬 Advanced Research</SelectItem>
                                  <SelectItem value="use of computer" className="rounded-xl h-14 font-black text-sm">💻 Digital Workspace</SelectItem>
                                  <SelectItem value="doing assignments" className="rounded-xl h-14 font-black text-sm">📝 Task Execution</SelectItem>
                                  <SelectItem value="group study" className="rounded-xl h-14 font-black text-sm">🤝 Collaborative Study</SelectItem>
                                  {!isGuest && <SelectItem value="consultation" className="rounded-xl h-14 font-black text-sm">💬 Faculty Consultation</SelectItem>}
                                  <SelectItem value="charging device" className="rounded-xl h-14 font-black text-sm">⚡ Resource Charging</SelectItem>
                                  <SelectItem value="resting/waiting" className="rounded-xl h-14 font-black text-sm">⌛ Scheduled Transition</SelectItem>
                                  <SelectItem value="printing/scanning" className="rounded-xl h-14 font-black text-sm">🖨️ Media Services</SelectItem>
                                  </SelectContent>
                              </Select>
                            </div>
                        </div>

                        <Button 
                            onClick={handleLogVisit} 
                            variant="neu"
                            disabled={!purpose || !currentCollege || isLogging}
                            className="w-full h-24 text-2xl md:text-3xl font-black rounded-[1.5rem] gap-6 shadow-3xl transition-all active:scale-[0.98] group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isLogging ? (
                              <div className="flex items-center gap-6">
                                  <Loader2 className="h-8 w-8 animate-spin" />
                                  SYNCHRONIZING...
                              </div>
                            ) : (
                              <>
                                  <CheckCircle2 className="h-8 w-8 text-secondary" />
                                  CONFIRM ATTENDANCE
                              </>
                            )}
                        </Button>
                      </CardContent>
                  </Card>
                ) : (
                  <Card className="neu-card-shadow border-none overflow-hidden rounded-[4rem] bg-primary relative animate-in zoom-in duration-1000 shadow-3xl">
                     <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
                     <div className="p-16 md:p-28 flex flex-col items-center text-center gap-10 relative z-10">
                        <div className="h-28 w-28 md:h-36 md:w-36 bg-white/10 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-secondary/40 shadow-inner">
                           <Trophy className="h-14 w-14 md:h-18 md:w-18 text-secondary animate-bounce" />
                        </div>
                        <div className="space-y-5">
                           <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">Record Secured!</h2>
                           <p className="text-white/80 text-lg md:text-2xl font-medium max-w-xl mx-auto leading-relaxed">
                              Your presence has been successfully synchronized with the institutional hub. You are now authorized for research access.
                           </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg pt-8">
                            <Button 
                              variant="outline" 
                              size="xl" 
                              onClick={logout}
                              className="flex-1 h-20 border-white/20 bg-white/5 text-white hover:bg-white/10 gap-4 rounded-[1.5rem] font-black uppercase text-[12px] tracking-widest shadow-2xl"
                            >
                               <LogOut className="h-6 w-6" />
                               Sign Out
                            </Button>
                            <Button 
                              variant="neuSecondary" 
                              size="xl" 
                              onClick={() => setHasLoggedThisSession(false)}
                              className="flex-1 h-20 gap-4 rounded-[1.5rem] font-black uppercase text-[12px] tracking-widest shadow-3xl"
                            >
                               <RefreshCcw className="h-6 w-6" />
                               New Log
                            </Button>
                        </div>
                     </div>
                  </Card>
                )}
              </div>

              <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-28">
                <Card className="neu-card-shadow border-none rounded-[2.5rem] bg-white overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-700">
                  <div className="bg-primary p-10 text-center space-y-4">
                    <div className="inline-flex items-center gap-3 bg-white/10 text-white border border-white/20 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-inner">
                      <Library className="h-5 w-5 text-secondary" />
                      Status Portal
                    </div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Academic Hub</h3>
                  </div>
                  <CardContent className="p-10 space-y-10">
                      <div className="flex items-center gap-6 p-6 bg-muted/40 rounded-[1.5rem] border-2 border-muted/50 transition-all hover:border-primary/20 shadow-inner">
                          <div className="bg-primary p-4 rounded-2xl shadow-xl">
                              <Clock className="h-7 w-7 text-secondary" />
                          </div>
                          <div>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.5em] mb-1">Operational</p>
                              <p className="text-2xl font-black italic tracking-tight text-primary">08:00 - 17:00</p>
                          </div>
                      </div>
                      <div className="space-y-5 pt-2">
                        <div className="flex items-center gap-4 text-green-600">
                          <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(22,163,74,0.5)] border-2 border-white" />
                          <span className="font-black text-[11px] uppercase tracking-[0.3em]">Connectivity Active</span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed italic opacity-80">
                          Logging is mandatory for all institutional visitors to maintain active academic audit trails.
                        </p>
                      </div>
                  </CardContent>
                </Card>
                
                <LiveClock className="bg-white/80 backdrop-blur-2xl border-none shadow-3xl p-10 !flex-col text-primary rounded-[2.5rem] ring-1 ring-white/50" showSelector={false} />
              </div>
            </div>
          )}

          {subView === 'feedback' && <FeedbackView />}
          {subView === 'help' && <HelpView />}
          {subView === 'profile' && <ProfileView />}
        </div>
      </main>

      <footer className="relative z-10 p-12 bg-white/40 backdrop-blur-3xl border-t mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-5 opacity-40 group cursor-default grayscale hover:grayscale-0 transition-all duration-700">
                <Library className="h-6 w-6 text-primary" />
                <span className="font-black text-xl uppercase tracking-[0.4em] text-primary italic">NEU ACCESS HUB</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.7em] text-muted-foreground/40 text-center">
                &copy; {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB
            </p>
        </div>
      </footer>
    </div>
  );
}