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
        title: "Missing Information",
        description: "Please select both your college/dept and a purpose for your visit.",
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
        title: "Log Recorded",
        description: `Visit for ${currentCollege} successfully registered.`,
      });
      setHasLoggedThisSession(true);
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

  const navItems = [
    { id: 'log-entry', label: 'Log Entry', icon: History },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'help', label: 'Help & Guide', icon: HelpCircle },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

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

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setSubView(item.id as UserSubView)}
                    className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-all hover:text-secondary flex items-center gap-2",
                        subView === item.id ? "text-secondary border-b-2 border-secondary pb-1" : "text-white/70"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex gap-1.5 md:gap-2">
                {profile?.isAuthorizedAdmin && (
                  <Button variant="neuSecondary" size="sm" onClick={() => switchRole('admin')} className="h-8 md:h-10 gap-1 md:gap-2 font-black text-[8px] md:text-[10px] uppercase rounded-xl">
                    <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Admin
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={logout} title="Sign Out" className="h-8 md:h-10 gap-1 md:gap-2 text-white/70 hover:text-white hover:bg-white/10 font-black text-[8px] md:text-[10px] uppercase rounded-xl transition-all">
                  <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden text-white h-9 w-9"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>
          </div>
        </div>
        
        {isMobileMenuOpen && (
            <div className="lg:hidden bg-primary p-4 border-t border-white/10 shadow-2xl space-y-2 animate-in slide-in-from-top-4">
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
                <button onClick={logout} className="w-full flex items-center gap-4 p-4 rounded-xl font-black text-xs uppercase text-red-400 hover:bg-red-400/10">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
        {subView === 'log-entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
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
              </div>

              {!hasLoggedThisSession ? (
                <Card className="neu-card-shadow border-none overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white relative">
                    <CardHeader className="p-6 md:p-12 border-b bg-muted/30">
                    <CardTitle className="text-2xl md:text-4xl font-black text-primary flex items-center gap-3 md:gap-5 italic tracking-tighter">
                        <CheckCircle2 className="h-6 w-6 md:h-10 md:w-10 text-secondary" />
                        VISITOR LOG ENTRY
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-12 lg:p-16 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        <div className="space-y-4 md:space-y-6">
                        <label className="text-[8px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.3em] md:tracking-[0.5em] ml-2 md:ml-3 opacity-70 flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5" />
                            Target Department
                        </label>
                        <Select value={currentCollege} onValueChange={setCurrentCollege}>
                            <SelectTrigger className="h-16 md:h-20 text-lg md:text-xl font-bold rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 border-muted focus:ring-primary shadow-inner px-6 md:px-10 bg-muted/10">
                                <SelectValue placeholder="Select College" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[1.5rem] md:rounded-[2.5rem] p-2 md:p-3 shadow-2xl border-none max-h-[400px]">
                                {NEU_COLLEGES.map((college) => (
                                    <SelectItem key={college.id} value={college.id} className="rounded-xl h-10 md:h-14 font-bold px-4 md:px-6 text-sm md:text-lg italic">
                                        {college.name} ({college.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                        <label className="text-[8px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.3em] md:tracking-[0.5em] ml-2 md:ml-3 opacity-70 flex items-center gap-2">
                            <BookOpen className="h-3.5 w-3.5" />
                            Reason for visit
                        </label>
                        <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger className="h-16 md:h-20 text-lg md:text-xl font-bold rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 border-muted focus:ring-primary shadow-inner px-6 md:px-10 bg-muted/10">
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
                    </div>

                    <Button 
                        onClick={handleLogVisit} 
                        variant="neu"
                        disabled={!purpose || !currentCollege || isLogging}
                        className="w-full h-16 md:h-24 text-xl md:text-3xl font-black rounded-[1.5rem] md:rounded-[2rem] py-6 md:py-10 gap-3 md:gap-5 group overflow-hidden relative shadow-2xl mt-4"
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
                    </CardContent>
                </Card>
              ) : (
                <Card className="neu-card-shadow border-none overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white relative animate-in zoom-in duration-500">
                   <div className="bg-primary p-12 md:p-20 flex flex-col items-center text-center gap-8">
                      <div className="h-32 w-32 md:h-48 md:w-48 bg-white/10 rounded-full flex items-center justify-center border-4 border-dashed border-secondary/40 animate-pulse">
                         <Trophy className="h-16 w-16 md:h-24 md:w-24 text-secondary" />
                      </div>
                      <div className="space-y-4">
                         <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white italic tracking-tighter">ENTRY RECORDED!</h2>
                         <p className="text-white/60 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
                            Your attendance has been securely transmitted to the institutional registry. Thank you for your cooperation.
                         </p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 w-full max-w-sm">
                          <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={logout}
                            className="flex-1 h-16 border-white/20 bg-white/5 text-white hover:bg-white/10 gap-3 rounded-2xl"
                          >
                             <LogOut className="h-5 w-5" />
                             Sign Out
                          </Button>
                          <Button 
                            variant="neuSecondary" 
                            size="lg" 
                            onClick={() => setHasLoggedThisSession(false)}
                            className="flex-1 h-16 gap-3 rounded-2xl"
                          >
                             <History className="h-5 w-5" />
                             Re-Entry
                          </Button>
                      </div>
                   </div>
                </Card>
              )}
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
                      Institutional access logs are required for all visitors entering the library premises. Verify your department per entry.
                    </p>
                </CardContent>
              </Card>
              
              <LiveClock className="bg-white border-2 border-muted text-primary" />
            </div>
          </div>
        )}

        {subView === 'feedback' && <FeedbackView />}
        {subView === 'help' && <HelpView />}
        {subView === 'profile' && <ProfileView />}
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
