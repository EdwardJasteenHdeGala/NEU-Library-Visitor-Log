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
      {/* Dynamic Blobs for Background Life */}
      <div className="fixed top-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/8 rounded-full blur-[100px] animate-blob pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[100px] animate-blob delay-5000 pointer-events-none" />
      <div className="neu-bg-overlay" />

      <header className="relative z-[70] p-3 bg-primary text-white sticky top-0 shadow-2xl border-b border-white/10 backdrop-blur-2xl bg-primary/95 h-[60px] flex items-center">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 w-full">
          <div className="flex items-center gap-3">
            <div 
              className="bg-white p-1 rounded-xl shadow-2xl w-9 h-9 relative overflow-hidden flex items-center justify-center group cursor-pointer border border-white/20" 
              onClick={() => handleSubViewChange('log-entry')}
            >
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill priority className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <h1 className="text-sm font-black tracking-tighter italic uppercase leading-none text-white">NEU HUB</h1>
              <span className="text-[7px] font-black text-secondary uppercase tracking-[0.3em] opacity-80">Institutional Portal</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 p-1 bg-white/5 rounded-[1rem] backdrop-blur-3xl border border-white/10">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleSubViewChange(item.id as UserSubView)}
                    className={cn(
                        "px-6 py-2 text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2.5 rounded-xl whitespace-nowrap",
                        subView === item.id ? "bg-secondary text-primary shadow-2xl" : "text-white/60 hover:bg-white/5 hover:text-white"
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
                className="h-9 px-5 gap-2.5 font-black text-[9px] uppercase rounded-xl hover:scale-105 transition-all shadow-2xl"
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
              <DropdownMenuContent align="end" className="w-60 rounded-[1.5rem] p-2.5 mt-2 border-none shadow-3xl bg-white/98 backdrop-blur-3xl animate-in slide-in-from-top-3">
                <DropdownMenuItem onClick={() => handleSubViewChange('profile')} className="rounded-xl h-12 gap-4 cursor-pointer focus:bg-primary/5 px-4">
                  <Settings className="h-4.5 w-4.5 text-primary" />
                  <span className="font-bold text-sm text-primary">Security Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="rounded-xl h-12 gap-4 text-destructive focus:bg-destructive/5 cursor-pointer px-4">
                  <LogOut className="h-4.5 w-4.5" />
                  <span className="font-black uppercase text-[10px] tracking-widest">Terminate Session</span>
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
        
        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-x-0 top-[60px] bg-primary/98 backdrop-blur-3xl p-5 border-t border-white/10 shadow-3xl space-y-2 animate-in slide-in-from-top-6 duration-500 z-[70]">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleSubViewChange(item.id as UserSubView)}
                        className={cn(
                            "w-full flex items-center gap-5 p-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all",
                            subView === item.id ? "bg-secondary text-primary shadow-2xl" : "text-white/70 hover:bg-white/10"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </button>
                ))}
            </div>
        )}
      </header>

      <main className="relative flex-1 w-full max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-700 pb-24">
        <div className="relative z-10 w-full">
          {subView === 'log-entry' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-8 space-y-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
                  <div className="relative shrink-0">
                    <Avatar className="h-28 w-28 md:h-40 md:w-40 border-[6px] border-white shadow-3xl animate-in zoom-in-75 duration-700 ring-8 ring-primary/5">
                      <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                      <AvatarFallback className="bg-secondary text-primary font-black text-3xl md:text-5xl italic">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-[1.25rem] shadow-2xl border border-muted ring-4 ring-primary/5">
                       {isGuest ? <Globe className="h-5 w-5 text-primary" /> : <Sparkles className="h-5 w-5 text-primary animate-pulse" />}
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="inline-flex items-center gap-3 bg-primary/5 text-primary border border-primary/15 px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-sm">
                       {isGuest ? "GUEST VISITOR ACCESS" : `ACADEMIC CYCLE ${academicYear || "2024-25"}`}
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-primary tracking-[-0.03em] leading-tight uppercase">
                      {isGuest ? "Hello," : "Welcome,"}<br className="hidden xs:block" />
                      <span className="text-secondary italic">Researcher {profile?.displayName?.split(' ')[0]}</span>
                    </h1>
                  </div>
                </div>

                {!hasLoggedThisSession ? (
                  <Card className="neu-card-shadow border-none overflow-hidden rounded-[2.5rem] bg-white relative animate-in slide-in-from-bottom-8 duration-700 group">
                      <CardHeader className="p-8 border-b bg-muted/30">
                        <CardTitle className="text-2xl md:text-3xl font-black text-primary flex items-center gap-4 italic tracking-tighter uppercase">
                            <History className="h-7 w-7 text-secondary" />
                            Synchronize Presence
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 md:p-12 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 opacity-60 flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  Institutional Unit
                              </label>
                              <Select value={currentCollege} onValueChange={setCurrentCollege}>
                                  <SelectTrigger className="h-16 text-base font-black rounded-2xl border-2 border-muted focus:ring-primary shadow-inner bg-muted/5 group-hover:bg-white transition-all">
                                      <SelectValue placeholder="Target Department" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl p-2 shadow-3xl border-none max-h-[300px]">
                                      {NEU_COLLEGES.map((college) => (
                                          <SelectItem key={college.id} value={college.id} className="rounded-xl h-12 font-black text-xs italic">
                                              {college.name} • {college.id}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 opacity-60 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  Utilization Purpose
                              </label>
                              <Select value={purpose} onValueChange={setPurpose}>
                                  <SelectTrigger className="h-16 text-base font-black rounded-2xl border-2 border-muted focus:ring-primary shadow-inner bg-muted/5 group-hover:bg-white transition-all">
                                  <SelectValue placeholder="Access Activity" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl p-2 shadow-3xl border-none max-h-[300px]">
                                  <SelectItem value="reading books" className="rounded-xl h-12 font-black text-xs">📖 Knowledge Retrieval</SelectItem>
                                  <SelectItem value="research in thesis" className="rounded-xl h-12 font-black text-xs">🔬 Advanced Research</SelectItem>
                                  <SelectItem value="use of computer" className="rounded-xl h-12 font-black text-xs">💻 Digital Workspace</SelectItem>
                                  <SelectItem value="doing assignments" className="rounded-xl h-12 font-black text-xs">📝 Task Execution</SelectItem>
                                  <SelectItem value="group study" className="rounded-xl h-12 font-black text-xs">🤝 Collaborative Study</SelectItem>
                                  {!isGuest && <SelectItem value="consultation" className="rounded-xl h-12 font-black text-xs">💬 Faculty Consultation</SelectItem>}
                                  <SelectItem value="charging device" className="rounded-xl h-12 font-black text-xs">⚡ Resource Charging</SelectItem>
                                  <SelectItem value="resting/waiting" className="rounded-xl h-12 font-black text-xs">⌛ Scheduled Transition</SelectItem>
                                  <SelectItem value="printing/scanning" className="rounded-xl h-12 font-black text-xs">🖨️ Media Services</SelectItem>
                                  </SelectContent>
                              </Select>
                            </div>
                        </div>

                        <Button 
                            onClick={handleLogVisit} 
                            variant="neu"
                            disabled={!purpose || !currentCollege || isLogging}
                            className="w-full h-20 text-xl md:text-2xl font-black rounded-2xl gap-4 shadow-3xl transition-all active:scale-[0.98] group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isLogging ? (
                              <div className="flex items-center gap-4">
                                  <Loader2 className="h-7 w-7 animate-spin" />
                                  SYCHRONIZING...
                              </div>
                            ) : (
                              <>
                                  <CheckCircle2 className="h-7 w-7 text-secondary" />
                                  AUTHORIZE ENTRY
                              </>
                            )}
                        </Button>
                      </CardContent>
                  </Card>
                ) : (
                  <Card className="neu-card-shadow border-none overflow-hidden rounded-[3rem] bg-primary relative animate-in zoom-in duration-700 shadow-3xl">
                     <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
                     <div className="p-12 md:p-24 flex flex-col items-center text-center gap-8 relative z-10">
                        <div className="h-24 w-24 md:h-32 md:w-32 bg-white/10 rounded-3xl flex items-center justify-center border-2 border-dashed border-secondary/40 shadow-inner">
                           <Trophy className="h-12 w-12 md:h-16 md:w-16 text-secondary animate-bounce" />
                        </div>
                        <div className="space-y-4">
                           <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Record Secured!</h2>
                           <p className="text-white/70 text-base md:text-xl font-medium max-w-md mx-auto leading-relaxed">
                              Your presence has been successfully synchronized. You are now authorized for institutional hub access.
                           </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-sm pt-6">
                            <Button 
                              variant="outline" 
                              size="xl" 
                              onClick={logout}
                              className="flex-1 h-16 border-white/20 bg-white/5 text-white hover:bg-white/10 gap-3 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                            >
                               <LogOut className="h-5 w-5" />
                               Sign Out
                            </Button>
                            <Button 
                              variant="neuSecondary" 
                              size="xl" 
                              onClick={() => setHasLoggedThisSession(false)}
                              className="flex-1 h-16 gap-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-3xl"
                            >
                               <RefreshCcw className="h-5 w-5" />
                               New Log
                            </Button>
                        </div>
                     </div>
                  </Card>
                )}
              </div>

              <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28">
                <Card className="neu-card-shadow border-none rounded-[2rem] bg-white overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-500">
                  <div className="bg-primary p-8 text-center space-y-3">
                    <div className="inline-flex items-center gap-2.5 bg-white/10 text-white border border-white/20 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-inner">
                      <Library className="h-4 w-4 text-secondary" />
                      Institutional Status
                    </div>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Library Hub</h3>
                  </div>
                  <CardContent className="p-8 space-y-8">
                      <div className="flex items-center gap-5 p-5 bg-muted/40 rounded-2xl border-2 border-muted/50 transition-all hover:border-primary/20 shadow-inner">
                          <div className="bg-primary p-3 rounded-xl shadow-xl">
                              <Clock className="h-6 w-6 text-secondary" />
                          </div>
                          <div>
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-1">Operational</p>
                              <p className="text-xl font-black italic tracking-tight text-primary">08:00 - 17:00</p>
                          </div>
                      </div>
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-3 text-green-600">
                          <div className="h-2.5 w-2.5 bg-green-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(22,163,74,0.5)]" />
                          <span className="font-black text-[10px] uppercase tracking-widest">Connectivity Valid</span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed italic opacity-80">
                          Logging is mandatory for all institutional visitors to maintain academic audit trails.
                        </p>
                      </div>
                  </CardContent>
                </Card>
                
                <LiveClock className="bg-white/80 backdrop-blur-2xl border-none shadow-3xl p-8 !flex-col text-primary rounded-[2rem] scale-95 ring-1 ring-white/50" showSelector={false} />
              </div>
            </div>
          )}

          {subView === 'feedback' && <FeedbackView />}
          {subView === 'help' && <HelpView />}
          {subView === 'profile' && <ProfileView />}
        </div>
      </main>

      <footer className="relative z-10 p-10 text-center bg-white/40 backdrop-blur-3xl border-t mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 opacity-40 group cursor-default grayscale hover:grayscale-0 transition-all duration-700">
                <Library className="h-5 w-5 text-primary" />
                <span className="font-black text-base uppercase tracking-[0.3em] text-primary italic">NEU ACCESS HUB</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.6em] text-muted-foreground/40 text-center">
                &copy; {new Date().getFullYear()} NEW ERA UNIVERSITY • EXCELLENCE • DISCIPLINE
            </p>
        </div>
      </footer>
    </div>
  );
}