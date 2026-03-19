
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
  Bell
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
import { Badge } from "@/components/ui/badge";

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

  const activeVisitQuery = useMemoFirebase(() => {
    if (!profile || !firestore) return null;
    return query(
      collection(firestore, 'visits'),
      where('userId', '==', profile.id),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
  }, [profile, firestore]);

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
    { id: 'log-entry', label: 'Attendance', icon: Library },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'feedback', label: 'Sentiments', icon: MessageSquare },
    { id: 'help', label: 'Protocols', icon: HelpCircle },
    { id: 'profile', label: 'Identity', icon: Settings },
  ];

  const handleNavClick = (view: UserSubView) => {
    setSubView(view);
  };

  const purposes = isGuest ? GUEST_PURPOSES : MEMBER_PURPOSES;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="neu-header">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 w-full">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded shadow-sm w-9 h-9 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => handleNavClick('log-entry')}>
              <Image src={logoImage?.imageUrl || ""} alt="NEU" fill priority className="object-contain p-1.5" />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-xs font-bold tracking-tight text-white uppercase italic">NEU Access Hub</h1>
              <span className="text-[7px] font-bold text-secondary uppercase tracking-widest">
                {isGuest ? "Guest Portal" : "Library Member"}
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => handleNavClick(item.id as UserSubView)} className={cn("px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 rounded-lg", subView === item.id ? "bg-white/10 text-white shadow-sm" : "text-white/60 hover:text-white")}>
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
                <DropdownMenuItem onClick={() => handleNavClick('notifications')} className="gap-2 cursor-pointer font-medium text-xs"><Bell className="h-4 w-4" /> Alerts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavClick('profile')} className="gap-2 cursor-pointer font-medium text-xs"><Settings className="h-4 w-4" /> Identity Sync</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive cursor-pointer font-medium text-xs"><LogOut className="h-4 w-4" /> Terminate Session</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        {subView === 'log-entry' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="text-center space-y-4 py-12 bg-primary text-white rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-pattern opacity-10" />
                <Library className="h-16 w-16 mx-auto mb-4 text-secondary opacity-80" />
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Welcome to NEU Library!</h2>
                <p className="text-lg opacity-80 font-medium">Your gateway to academic excellence and research discovery.</p>
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Badge variant="outline" className="text-white border-white/20 uppercase tracking-widest text-[9px] px-4 py-1">
                        Syncing: {profile?.displayName}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-8 space-y-10">
                <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50 border-b p-8 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-black italic flex items-center gap-3 uppercase tracking-tighter text-primary">
                      <History className="h-6 w-6 text-secondary" /> Attendance Registry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    {activeVisit ? (
                      <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-16 rounded-[2rem] text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <Activity className="h-12 w-12 mx-auto text-primary animate-pulse" />
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-primary italic uppercase tracking-tighter">Active Attendance Protocol</h3>
                          <p className="text-muted-foreground font-medium">Logged at {activeVisit.timestamp.toDate().toLocaleTimeString()}</p>
                        </div>
                        <Button onClick={handleCheckOut} disabled={isLogging} variant="destructive" className="h-16 px-12 font-black uppercase tracking-widest rounded-2xl shadow-xl">
                          {isLogging ? <Loader2 className="h-5 w-5 animate-spin" /> : "Terminate Session"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Academic Unit</label>
                            <Select value={currentCollege} onValueChange={setCurrentCollege}>
                              <SelectTrigger className="h-16 font-black text-lg rounded-2xl border-2 shadow-inner bg-slate-50/50">
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
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Purpose of Access</label>
                            <Select value={purpose} onValueChange={setPurpose}>
                              <SelectTrigger className="h-16 font-black text-lg rounded-2xl border-2 shadow-inner bg-slate-50/50">
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
                        <Button onClick={handleCheckIn} disabled={!purpose || isLogging} className="w-full h-20 text-2xl font-black gap-4 rounded-[1.5rem] shadow-3xl bg-primary hover:bg-primary/95 transition-all">
                          {isLogging ? <Loader2 className="h-8 w-8 animate-spin" /> : <CheckCircle2 className="h-8 w-8 text-secondary" />}
                          Confirm Attendance Entry
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <aside className="lg:col-span-4 space-y-8">
                <LiveClock className="shadow-2xl border-none bg-white p-8 rounded-[2rem]" showSelector={false} />
                <Card className="p-8 bg-secondary text-primary rounded-[2rem] shadow-xl border-none">
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                        <Globe className="h-4 w-4" /> Institutional Mode
                    </h4>
                    <p className="text-sm font-bold italic leading-relaxed">
                        Registry synchronization active. All entries are logged for academic oversight and facility optimization.
                    </p>
                </Card>
              </aside>
            </div>
          </div>
        )}
        {subView === 'notifications' && <NotificationsView onBack={() => handleNavClick('log-entry')} />}
        {subView === 'feedback' && <FeedbackView onBack={() => handleNavClick('log-entry')} />}
        {subView === 'help' && <HelpView onBack={() => handleNavClick('log-entry')} />}
        {subView === 'profile' && <ProfileView onBack={() => handleNavClick('log-entry')} />}
      </main>
    </div>
  );
}
