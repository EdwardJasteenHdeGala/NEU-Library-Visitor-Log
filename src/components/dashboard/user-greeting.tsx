
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
  Info
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

  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
  const isGuest = profile?.role === 'guest';

  useEffect(() => {
    setAcademicYear(getAcademicYear());
  }, []);

  // Secure personal visit registry query
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
      role: profile.designation,
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
    { id: 'log-entry', label: 'Home', icon: Library },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'help', label: 'Support', icon: HelpCircle },
    { id: 'profile', label: 'Identity', icon: Settings },
  ];

  const purposes = isGuest ? GUEST_PURPOSES : MEMBER_PURPOSES;

  if (subView === 'notifications') return <NotificationsView onBack={() => setSubView('log-entry')} />;
  if (subView === 'feedback') return <FeedbackView onBack={() => setSubView('log-entry')} />;
  if (subView === 'help') return <HelpView onBack={() => setSubView('log-entry')} />;
  if (subView === 'profile') return <ProfileView onBack={() => setSubView('log-entry')} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="neu-header">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 w-full">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded shadow-sm w-9 h-9 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => setSubView('log-entry')}>
              <Image src={logoImage?.imageUrl || ""} alt="NEU" fill priority className="object-contain p-1.5" />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-xs font-bold tracking-tight text-white uppercase italic">NEU Access Hub</h1>
              <span className="text-[7px] font-bold text-secondary uppercase tracking-widest">
                {isGuest ? "Guest Access" : "Institutional Member"}
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setSubView(item.id as UserSubView)} 
                className={cn(
                  "px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 rounded-lg", 
                  subView === item.id ? "bg-white/10 text-white shadow-sm" : "text-white/60 hover:text-white"
                )}
              >
                <item.icon className="h-3.5 w-3.5" /> {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {profile?.isAuthorizedAdmin && (
              <Button variant="secondary" size="sm" onClick={() => switchRole('admin')} className="h-8 px-4 gap-2 font-bold text-[9px] uppercase rounded-lg hidden sm:flex">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin Portal
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 border border-white/20 cursor-pointer hover:scale-105 transition-transform">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-secondary text-primary font-bold text-[10px]">{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-2xl border-none bg-white">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registry Identity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSubView('notifications')} className="gap-2 cursor-pointer font-medium text-xs"><Bell className="h-4 w-4" /> Alerts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSubView('profile')} className="gap-2 cursor-pointer font-medium text-xs"><Settings className="h-4 w-4" /> Identity Sync</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive cursor-pointer font-medium text-xs"><LogOut className="h-4 w-4" /> Terminate Session</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-none rounded-[2.5rem] bg-primary text-white overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-10" />
            <CardContent className="p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
              <div className="space-y-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                  <Library className="h-4 w-4 text-secondary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Institutional Hub Active</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                  Welcome to <br /> NEU Library!
                </h2>
                <p className="text-lg opacity-80 font-medium max-w-lg">
                  Synchronize your attendance registry and access institutional resources with precision.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 bg-white/10 p-8 rounded-[2rem] backdrop-blur-md border border-white/20 min-w-[280px]">
                <LiveClock className="!bg-transparent !border-none !text-white !p-0" showSelector={false} />
                <div className="h-px w-full bg-white/20" />
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", status.isOpen ? "bg-green-400 animate-pulse" : "bg-red-400")} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{status.label}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <Card className="shadow-3xl border-none rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b p-10">
                <CardTitle className="text-2xl font-black italic flex items-center gap-4 uppercase tracking-tighter text-primary">
                  <History className="h-8 w-8 text-secondary" /> 
                  Attendance Registry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 md:p-14 space-y-10">
                {activeVisit ? (
                  <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-16 rounded-[2.5rem] text-center space-y-8 animate-in zoom-in duration-500">
                    <div className="h-24 w-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto border-4 border-primary/10">
                      <Activity className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter">Active Attendance Protocol</h3>
                      <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                        Logged since: {activeVisit.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button 
                      onClick={handleCheckOut} 
                      disabled={isLogging} 
                      variant="destructive" 
                      className="h-20 px-12 text-xl font-black uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95 transition-all w-full md:w-auto"
                    >
                      {isLogging ? <Loader2 className="h-6 w-6 animate-spin" /> : "TERMINATE SESSION"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-3">Academic Unit</label>
                        <Select value={currentCollege} onValueChange={setCurrentCollege}>
                          <SelectTrigger className="h-16 font-black text-lg rounded-2xl border-2 shadow-inner bg-slate-50/50 px-8">
                            <SelectValue placeholder="Select Dept" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-3xl">
                            {isGuest ? (
                              <SelectItem value="EXTERNAL" className="font-bold">External Visitor</SelectItem>
                            ) : (
                              NEU_COLLEGES.map(c => <SelectItem key={c.id} value={c.id} className="font-bold">{c.name} ({c.id})</SelectItem>)
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-3">Access Purpose</label>
                        <Select value={purpose} onValueChange={setPurpose}>
                          <SelectTrigger className="h-16 font-black text-lg rounded-2xl border-2 shadow-inner bg-slate-50/50 px-8">
                            <SelectValue placeholder="Select Purpose" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-3xl">
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
                      className="w-full h-24 text-3xl font-black gap-6 rounded-[2rem] shadow-3xl bg-primary hover:bg-primary/95 transition-all group overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {isLogging ? <Loader2 className="h-10 w-10 animate-spin" /> : <CheckCircle2 className="h-10 w-10 text-secondary" />}
                      CONFIRM ATTENDANCE
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-4 space-y-10">
            <Card className="p-10 border-none rounded-[2.5rem] bg-white shadow-2xl space-y-8">
              <div className="flex items-center gap-4 border-b pb-6">
                <div className="p-3 bg-primary/5 rounded-xl">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-primary">Institutional Policy</h4>
              </div>
              <p className="text-sm font-bold italic leading-relaxed text-muted-foreground">
                Registry synchronization is mandatory for all visitors. Your academic logs are archived for institutional oversight and facility optimization.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Secure Sync Active</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border">
                  <Info className="h-5 w-5 text-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AY {academicYear}</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="p-10 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
        © {new Date().getFullYear()} NEW ERA UNIVERSITY • INSTITUTIONAL ACCESS HUB
      </footer>
    </div>
  );
}
