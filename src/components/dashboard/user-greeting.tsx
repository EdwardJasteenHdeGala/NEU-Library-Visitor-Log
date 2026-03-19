
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
  Menu, 
  X, 
  Settings, 
  Loader2,
  Activity
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
  const status = useLibraryStatus();
  
  const [subView, setSubView] = useState<UserSubView>('log-entry');
  const [purpose, setPurpose] = useState<string>("");
  const [currentCollege, setCurrentCollege] = useState<string>(profile?.college || "");
  const [isLogging, setIsLogging] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

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
      toast({ title: "Required Information", description: "Select department and purpose.", variant: "destructive" });
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
      toast({ title: "Check-In Confirmed", description: "Entry recorded in registry." });
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
    { id: 'log-entry', label: 'Dashboard', icon: History },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const handleNavClick = (view: UserSubView) => {
    setSubView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="neu-header">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 w-full">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded shadow-sm w-9 h-9 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => handleNavClick('log-entry')}>
              <Image src={logoImage?.imageUrl || ""} alt="NEU" fill priority className="object-contain p-1.5" />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-xs font-bold tracking-tight text-white uppercase">NEU Access Hub</h1>
              <span className="text-[7px] font-bold text-secondary uppercase tracking-widest">Institutional Portal</span>
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
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 border border-white/20 cursor-pointer hover:scale-105 transition-transform">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-secondary text-primary font-bold text-[10px]">{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-2xl border-none">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavClick('profile')} className="gap-2 cursor-pointer font-medium text-xs"><Settings className="h-4 w-4" /> Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive cursor-pointer font-medium text-xs"><LogOut className="h-4 w-4" /> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="lg:hidden text-white h-10 w-10" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-primary animate-in fade-in slide-in-from-top duration-300">
          <div className="p-6 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-3">
              <Image src={logoImage?.imageUrl || ""} alt="NEU" width={32} height={32} />
              <span className="font-black text-white uppercase italic tracking-tighter">NEU Access Hub</span>
            </div>
            <Button variant="ghost" size="icon" className="text-white h-10 w-10" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-8 w-8" />
            </Button>
          </div>
          <nav className="p-10 flex flex-col gap-6">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleNavClick(item.id as UserSubView)} 
                className={cn(
                  "flex items-center gap-6 text-2xl font-black uppercase italic tracking-tighter transition-all",
                  subView === item.id ? "text-secondary" : "text-white/60 hover:text-white"
                )}
              >
                <item.icon className="h-8 w-8" />
                {item.label}
              </button>
            ))}
            <div className="pt-10 mt-10 border-t border-white/10">
              <button onClick={logout} className="flex items-center gap-6 text-2xl font-black uppercase italic tracking-tighter text-destructive">
                <LogOut className="h-8 w-8" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        {subView === 'log-entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in duration-500">
            <div className="lg:col-span-8 space-y-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-xl ring-1 ring-border">
                  <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                  <AvatarFallback className="bg-slate-200 text-slate-500 font-bold text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="space-y-3 pt-4 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <div className={cn("h-2 w-2 rounded-full", status.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{status.label}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-tight leading-none italic">Welcome, <span className="text-slate-900 not-italic">{profile?.displayName?.split(' ')[0]}</span></h1>
                  <p className="text-muted-foreground font-medium">New Era University Institutional Registry</p>
                </div>
              </div>

              <Card className="shadow-xl border-border rounded-xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b p-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest"><History className="h-4 w-4 text-primary" /> Log Attendance</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  {activeVisit ? (
                    <div className="shadow-2xl border-none bg-primary text-white p-16 rounded-xl overflow-hidden relative">
                      <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                        <div className="h-20 w-20 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20 animate-pulse shadow-xl">
                          <Activity className="h-10 w-10 text-secondary" />
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-3xl font-bold uppercase tracking-tighter italic">Active Session Confirmed</h2>
                          <p className="text-white/80 text-lg">Arrival: <span className="text-secondary font-bold">{activeVisit.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                        </div>
                        <Button onClick={handleCheckOut} disabled={isLogging} variant="secondary" className="w-full max-w-xs h-14 font-black uppercase text-xs tracking-widest shadow-xl rounded-xl">
                          {isLogging ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terminate Session"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Assigned Unit</label>
                          <Select value={currentCollege} onValueChange={setCurrentCollege}>
                            <SelectTrigger className="h-14 font-bold rounded-xl border-2"><SelectValue placeholder="Select Dept" /></SelectTrigger>
                            <SelectContent className="rounded-xl">{NEU_COLLEGES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Purpose of Access</label>
                          <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger className="h-14 font-bold rounded-xl border-2"><SelectValue placeholder="Select Purpose" /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="reading books">Reading & Study</SelectItem>
                              <SelectItem value="research in thesis">Thesis Research</SelectItem>
                              <SelectItem value="use of computer">Computer Laboratory</SelectItem>
                              <SelectItem value="doing assignments">Assignments</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={handleCheckIn} disabled={!purpose || !currentCollege || isLogging} className="w-full h-16 text-lg font-bold gap-4 rounded-xl shadow-lg transition-all active:scale-95">
                        {isLogging ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5 text-secondary" />}
                        Confirm Attendance Entry
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
              <LiveClock className="shadow-sm border-border bg-white p-8 !flex-col !items-start rounded-xl" showSelector={false} />
            </aside>
          </div>
        )}
        {subView === 'feedback' && <FeedbackView onBack={() => handleNavClick('log-entry')} />}
        {subView === 'help' && <HelpView onBack={() => handleNavClick('log-entry')} />}
        {subView === 'profile' && <ProfileView onBack={() => handleNavClick('log-entry')} />}
      </main>
    </div>
  );
}
