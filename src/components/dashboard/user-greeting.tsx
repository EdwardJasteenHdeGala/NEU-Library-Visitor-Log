"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, 
  CheckCircle2, 
  ShieldCheck, 
  History, 
  MessageSquare, 
  HelpCircle, 
  Settings, 
  Loader2,
  Activity,
  Globe,
  Library,
  Bell,
  Info,
  ChevronRight,
  Sparkles,
  Megaphone
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { collection, query, where, orderBy, limit, doc } from "firebase/firestore";
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { LiveClock } from "@/components/ui/live-clock";
import { getAcademicYear, cn } from "@/lib/utils";
import { useLibraryStatus } from "@/hooks/use-library-status";
import { FeedbackView } from "./feedback-view";
import { HelpView } from "./help-view";
import { ProfileView } from "./profile-view";
import { NotificationsView } from "./notifications-view";

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

const MEMBER_PURPOSES = [
  { value: "reading books", label: "Reading & Study" },
  { value: "research in thesis", label: "Thesis Research" },
  { value: "use of computer", label: "Computer Laboratory" },
  { value: "doing assignments", label: "Assignments" },
];

const GUEST_PURPOSES = [
  { value: "visit", label: "General Visitation" },
  { value: "inquiry", label: "Information Inquiry" },
  { value: "tour", label: "Facility Tour" },
  { value: "media use", label: "Media Consultation" },
];

type UserSubView = 'log-entry' | 'feedback' | 'help' | 'profile' | 'notifications';

export function UserGreeting() {
  const { logout, profile, switchRole } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const status = useLibraryStatus();
  
  const [subView, setSubView] = useState<UserSubView>('log-entry');
  const [purpose, setPurpose] = useState<string>("");
  const [currentCollege, setCurrentCollege] = useState<string>(profile?.college || "EXTERNAL");
  const [isLogging, setIsLogging] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const announcements = [
    "Library Registry synchronization is mandatory for all visitors.",
    "Thesis repository access now available via digital terminal.",
    "New academic resources added to the Research Archive.",
    "Quiet study protocols active in the South Wing."
  ];

  useEffect(() => {
    setAcademicYear(getAcademicYear());
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
  const isGuest = profile?.role === 'guest';

  const activeVisitQuery = useMemoFirebase(() => {
    if (!profile?.id || !firestore) return null;
    return query(
      collection(firestore, 'visits'),
      where('userId', '==', profile.id),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
  }, [profile?.id, firestore]);

  const { data: visits } = useCollection(activeVisitQuery);
  const activeVisit = visits && visits[0] && !visits[0].exitTimestamp ? visits[0] : null;

  const handleCheckIn = () => {
    if (!purpose || !profile || !firestore || !currentCollege) {
      toast({ title: "Incomplete Protocol", description: "Select academic unit and purpose.", variant: "destructive" });
      return;
    }

    setIsLogging(true);
    addDocumentNonBlocking(collection(firestore, 'visits'), {
      userId: profile.id,
      userName: profile.displayName,
      college: currentCollege,
      roleAtTime: profile.role,
      purpose: purpose,
      timestamp: new Date(),
      exitTimestamp: null,
      durationMinutes: 0,
      academicYear: getAcademicYear()
    });

    setTimeout(() => {
      toast({ title: "Check-In Confirmed", description: "Registry entry synchronized." });
      setIsLogging(false);
    }, 600);
  };

  const handleCheckOut = () => {
    if (!activeVisit || !firestore) return;

    setIsLogging(true);
    const entryTime = activeVisit.timestamp.toDate();
    const exitTime = new Date();
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    const docRef = doc(firestore, 'visits', activeVisit.id);
    updateDocumentNonBlocking(docRef, {
      exitTimestamp: exitTime,
      durationMinutes: durationMinutes
    });

    setTimeout(() => {
      toast({ title: "Check-Out Confirmed", description: `Stay Duration: ${durationMinutes} minutes.` });
      setIsLogging(false);
    }, 600);
  };

  const userInitials = profile?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'V';
  
  const navItems = [
    { id: 'log-entry', label: 'Dashboard', icon: Library },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'feedback', label: 'Sentiments', icon: MessageSquare },
    { id: 'help', label: 'Support', icon: HelpCircle },
    { id: 'profile', label: 'Identity', icon: Settings },
  ];

  const purposes = isGuest ? GUEST_PURPOSES : MEMBER_PURPOSES;

  if (subView === 'notifications') return <NotificationsView onBack={() => setSubView('log-entry')} />;
  if (subView === 'feedback') return <FeedbackView onBack={() => setSubView('log-entry')} />;
  if (subView === 'help') return <HelpView onBack={() => setSubView('log-entry')} />;
  if (subView === 'profile') return <ProfileView onBack={() => setSubView('log-entry')} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      <header className="h-[4rem] bg-primary flex items-center sticky top-0 z-[100] shadow-lg border-b border-white/10">
        <div className="max-w-[80rem] mx-auto flex justify-between items-center px-[1.5rem] w-full">
          <div className="flex items-center gap-[1rem]">
            <div className="bg-white p-[0.25rem] rounded-[0.5rem] w-[2.25rem] h-[2.25rem] relative overflow-hidden flex items-center justify-center cursor-pointer transition-transform hover:scale-105" onClick={() => setSubView('log-entry')}>
              <Image src={logoImage?.imageUrl || ""} alt="NEU" fill priority className="object-contain p-[0.375rem]" />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-[0.875rem] font-bold tracking-tight text-white uppercase italic">Access Hub</h1>
              <span className="text-[0.5rem] font-bold text-secondary uppercase tracking-widest">
                {isGuest ? "Guest Portal" : "Institutional Member"}
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-[0.25rem]">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setSubView(item.id as UserSubView)} 
                className={cn(
                  "px-[1rem] py-[0.5rem] text-[0.625rem] font-black uppercase tracking-widest transition-all flex items-center gap-[0.5rem] rounded-[0.5rem]", 
                  subView === item.id 
                    ? "bg-white/20 text-white shadow-inner" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="h-[0.875rem] w-[0.875rem]" /> {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-[1rem]">
            {profile?.isAuthorizedAdmin && (
              <Button variant="secondary" size="sm" onClick={() => switchRole('admin')} className="h-[2rem] px-[1rem] gap-[0.5rem] font-black text-[0.625rem] uppercase rounded-[0.5rem] hidden sm:flex shadow-md transition-all active:scale-95">
                <ShieldCheck className="h-[0.875rem] w-[0.875rem]" /> Admin View
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-[2.25rem] w-[2.25rem] border-2 border-white/20 cursor-pointer hover:scale-110 transition-all">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-secondary text-primary font-black text-[0.75rem]">{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[14rem] mt-[0.5rem] rounded-[1rem] shadow-2xl border-none p-[0.5rem]">
                <DropdownMenuLabel className="text-[0.625rem] font-black uppercase tracking-widest text-muted-foreground p-[0.75rem]">Institutional Identity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSubView('notifications')} className="gap-[0.75rem] cursor-pointer font-bold text-[0.75rem] h-[2.5rem] rounded-[0.5rem]"><Bell className="h-[1rem] w-[1rem]" /> System Alerts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSubView('profile')} className="gap-[0.75rem] cursor-pointer font-bold text-[0.75rem] h-[2.5rem] rounded-[0.5rem]"><Settings className="h-[1rem] w-[1rem]" /> Identity Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-[0.75rem] text-destructive cursor-pointer font-bold text-[0.75rem] h-[2.5rem] rounded-[0.5rem] hover:bg-destructive/5"><LogOut className="h-[1rem] w-[1rem]" /> Terminate Session</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="bg-secondary/10 border-b border-secondary/20 py-[0.75rem] overflow-hidden">
        <div className="max-w-[80rem] mx-auto px-[1.5rem] flex items-center gap-[1rem]">
          <Megaphone className="h-[1rem] w-[1rem] text-secondary shrink-0" />
          <div className="text-[0.75rem] font-bold text-primary italic transition-all animate-in slide-in-from-right duration-500">
            {announcements[announcementIndex]}
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[80rem] mx-auto p-[1.5rem] md:p-[3rem] space-y-[3rem]">
        <div className="animate-in fade-in slide-in-from-bottom-[1rem] duration-700">
          <Card className="border-none rounded-[2.5rem] bg-primary text-white overflow-hidden shadow-2xl relative group">
            <div className="absolute inset-0 bg-dot-pattern opacity-10" />
            <CardContent className="p-[2.5rem] md:p-[4rem] flex flex-col md:flex-row items-center justify-between gap-[2.5rem] relative z-10">
              <div className="space-y-[1.5rem] text-center md:text-left">
                <div className="inline-flex items-center gap-[0.5rem] bg-white/10 px-[1rem] py-[0.5rem] rounded-full border border-white/20">
                  <Sparkles className="h-[1rem] w-[1rem] text-secondary" />
                  <span className="text-[0.625rem] font-bold uppercase tracking-[0.2em]">Institutional Handshake Complete</span>
                </div>
                <h2 className="text-[2.5rem] md:text-[4rem] font-black italic tracking-tighter uppercase leading-none drop-shadow-lg">
                  Welcome back, <br /> 
                  <span className="text-secondary">{profile?.displayName?.split(' ')[0]}!</span>
                </h2>
                <p className="text-[1.125rem] opacity-80 font-medium max-w-[30rem] italic">
                  Advancing academic excellence through precision registry protocols. Access your resources below.
                </p>
              </div>
              <div className="flex flex-col items-center gap-[1rem] bg-white/10 p-[2rem] rounded-[2rem] backdrop-blur-md border border-white/20 min-w-[18rem] shadow-inner">
                <LiveClock className="!bg-transparent !border-none !text-white !p-0" showSelector={false} />
                <div className="h-px w-full bg-white/20" />
                <div className="flex items-center gap-[0.5rem]">
                  <div className={cn("h-[0.5rem] w-[0.5rem] rounded-full", status.isOpen ? "bg-green-400 animate-pulse" : "bg-red-400")} />
                  <span className="text-[0.625rem] font-black uppercase tracking-widest">{status.label}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="portal-grid">
          <div className="lg:col-span-8 space-y-[2.5rem]">
            <Card className="shadow-3xl border-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b p-[2rem] md:p-[3rem]">
                <CardTitle className="text-[1.5rem] font-black italic flex items-center gap-[1rem] uppercase tracking-tighter text-primary">
                  <History className="h-[2rem] w-[2rem] text-secondary" /> 
                  Attendance Registry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-[2rem] md:p-[3.5rem] space-y-[2.5rem]">
                {activeVisit ? (
                  <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-[3rem] md:p-[4rem] rounded-[2rem] text-center space-y-[2rem] animate-in zoom-in duration-500">
                    <div className="h-[6rem] w-[6rem] bg-white rounded-[1.5rem] shadow-xl flex items-center justify-center mx-auto border-4 border-primary/10">
                      <Activity className="h-[3rem] w-[3rem] text-primary animate-pulse" />
                    </div>
                    <div className="space-y-[0.5rem]">
                      <h3 className="text-[1.75rem] font-black text-primary italic uppercase tracking-tighter">Active Log Synchronization</h3>
                      <p className="text-muted-foreground font-black uppercase text-[0.625rem] tracking-widest bg-white/50 px-[1rem] py-[0.25rem] rounded-full inline-block">
                        Logged entry: {activeVisit.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button 
                      onClick={handleCheckOut} 
                      disabled={isLogging} 
                      variant="destructive" 
                      className="h-[4.5rem] px-[3rem] text-[1.125rem] font-black uppercase tracking-widest rounded-[1rem] shadow-2xl active:scale-95 transition-all w-full md:w-auto"
                    >
                      {isLogging ? <Loader2 className="h-[1.5rem] w-[1.5rem] animate-spin" /> : "TERMINATE SESSION"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-[2.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[2rem]">
                      <div className="space-y-[0.75rem]">
                        <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-[0.3em] ml-[0.75rem] flex items-center gap-[0.5rem]">
                          <Library className="h-[0.75rem] w-[0.75rem] text-primary" /> Academic Unit
                        </label>
                        <Select value={currentCollege} onValueChange={setCurrentCollege}>
                          <SelectTrigger className="h-[4rem] font-black text-[1.125rem] rounded-[1rem] border-2 shadow-inner bg-slate-50/50 px-[1.5rem] focus:ring-primary">
                            <SelectValue placeholder="Select Unit" />
                          </SelectTrigger>
                          <SelectContent className="rounded-[1rem] border-none shadow-2xl">
                            {isGuest ? (
                              <SelectItem value="EXTERNAL" className="font-bold">External Visitor</SelectItem>
                            ) : (
                              NEU_COLLEGES.map(c => <SelectItem key={c.id} value={c.id} className="font-bold">{c.name} ({c.id})</SelectItem>)
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-[0.75rem]">
                        <label className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-[0.3em] ml-[0.75rem] flex items-center gap-[0.5rem]">
                          <Activity className="h-[0.75rem] w-[0.75rem] text-primary" /> Log Purpose
                        </label>
                        <Select value={purpose} onValueChange={setPurpose}>
                          <SelectTrigger className="h-[4rem] font-black text-[1.125rem] rounded-[1rem] border-2 shadow-inner bg-slate-50/50 px-[1.5rem] focus:ring-primary">
                            <SelectValue placeholder="Select Purpose" />
                          </SelectTrigger>
                          <SelectContent className="rounded-[1rem] border-none shadow-2xl">
                            {purposes.map(p => (
                              <SelectItem key={p.value} value={p.value} className="font-bold">{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCheckIn} 
                      disabled={!purpose || isLogging} 
                      className="w-full h-[5rem] text-[1.5rem] md:text-[2rem] font-black gap-[1.5rem] rounded-[1.25rem] shadow-3xl bg-primary hover:bg-primary/95 transition-all group overflow-hidden relative active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {isLogging ? <Loader2 className="h-[2rem] w-[2rem] animate-spin" /> : <CheckCircle2 className="h-[2rem] w-[2rem] text-secondary" />}
                      CONFIRM ATTENDANCE
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-4 space-y-[2.5rem]">
            <Card className="p-[2.5rem] border-none rounded-[2rem] bg-white shadow-2xl space-y-[2rem]">
              <div className="flex items-center gap-[1rem] border-b pb-[1.5rem]">
                <div className="p-[0.75rem] bg-primary/5 rounded-[0.75rem]">
                  <Globe className="h-[1.5rem] w-[1.5rem] text-primary" />
                </div>
                <h4 className="font-black text-[0.75rem] uppercase tracking-[0.2em] text-primary">Institutional Policy</h4>
              </div>
              <p className="text-[0.875rem] font-bold italic leading-relaxed text-muted-foreground">
                Registry synchronization is mandatory for all visitors. Your academic logs are archived for institutional oversight and facility optimization compliance.
              </p>
              <div className="space-y-[1rem]">
                <div className="flex items-center gap-[1rem] p-[1rem] bg-slate-50 rounded-[1rem] border">
                  <ShieldCheck className="h-[1.25rem] w-[1.25rem] text-secondary" />
                  <span className="text-[0.625rem] font-black uppercase tracking-widest text-primary/70">Registry Synchronized</span>
                </div>
                <div className="flex items-center gap-[1rem] p-[1rem] bg-slate-50 rounded-[1rem] border">
                  <Info className="h-[1.25rem] w-[1.25rem] text-primary" />
                  <span className="text-[0.625rem] font-black uppercase tracking-widest text-primary/70">AY {academicYear} Registry</span>
                </div>
              </div>
            </Card>

            <Card className="p-[2.5rem] border-none rounded-[2rem] bg-slate-900 text-white shadow-2xl space-y-[1.5rem] relative overflow-hidden">
              <div className="absolute inset-0 bg-dot-pattern opacity-10" />
              <div className="flex items-center gap-[1rem] relative z-10">
                <Bell className="h-[1.25rem] w-[1.25rem] text-secondary" />
                <h4 className="font-black text-[0.75rem] uppercase tracking-widest">Protocol Reminder</h4>
              </div>
              <p className="text-[0.75rem] font-medium leading-relaxed opacity-70 italic relative z-10">
                Please ensure you terminate your session upon departure to maintain the integrity of the university's facility occupancy telemetry.
              </p>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="p-[2.5rem] text-center text-muted-foreground text-[0.625rem] font-black uppercase tracking-[0.4em] opacity-40 mt-auto">
        © {new Date().getFullYear()} NEW ERA UNIVERSITY • THE HUB • COLLEGE OF ENGINEERING & ARCHITECTURE
      </footer>
    </div>
  );
}