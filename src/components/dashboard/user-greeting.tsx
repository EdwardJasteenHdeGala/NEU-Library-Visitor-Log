"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Library, 
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
  Clock,
  ArrowRight,
  AlertCircle,
  ShieldAlert,
  Users
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
import { collection, query, where, orderBy, limit, doc } from "firebase/firestore";
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiveClock } from "@/components/ui/live-clock";
import { getAcademicYear, cn } from "@/lib/utils";
import { FeedbackView } from "./feedback-view";
import { HelpView } from "./help-view";
import { ProfileView } from "./profile-view";
import { useLibraryStatus } from "@/hooks/use-library-status";

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
  const { isOpen, label, nextEvent, isManual, reason } = useLibraryStatus();
  
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

  // Tracking Active Session
  const activeVisitQuery = useMemoFirebase(() => {
    if (!profile || !firestore) return null;
    return query(
      collection(firestore, 'visits'),
      where('userId', '==', profile.id),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
  }, [profile, firestore]);

  const { data: visits, isLoading: isLoadingVisit } = useCollection(activeVisitQuery);
  const activeVisit = visits && visits[0] && !visits[0].exitTimestamp ? visits[0] : null;

  // Tracking Global Occupancy
  const globalOccupancyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'visits'), where('exitTimestamp', '==', null));
  }, [firestore]);
  const { data: activeVisits } = useCollection(globalOccupancyQuery);
  
  const currentOccupancy = isOpen ? (activeVisits?.length || 0) : 0;

  const handleCheckIn = () => {
    if (!isOpen) {
      toast({
        title: "Access Restricted",
        description: isManual ? "The library has been manually closed by administration." : "Library entries are currently disabled based on the institutional schedule.",
        variant: "destructive"
      });
      return;
    }

    if (!purpose || !profile || !firestore || !currentCollege) {
      toast({
        title: "Required Information",
        description: "Please select your department and purpose.",
        variant: "destructive"
      });
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
      toast({
        title: "Check-In Confirmed",
        description: "Your entry has been recorded in the institutional registry.",
      });
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
      toast({
        title: "Check-Out Confirmed",
        description: `Stay Duration: ${durationMinutes} minutes. Session terminated.`,
      });
      setIsLogging(false);
    }, 600);
  };

  const userInitials = profile?.displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'V';

  const navItems = [
    { id: 'log-entry', label: 'Home', icon: History },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'help', label: 'Support', icon: HelpCircle },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="neu-header">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 w-full">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded shadow-sm w-9 h-9 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => setSubView('log-entry')}>
              <Image 
                src={logoImage?.imageUrl || ""} 
                alt="NEU" 
                fill 
                priority 
                className="object-contain p-1.5"
              />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-xs font-bold tracking-tight text-white uppercase">NEU Access Hub</h1>
              <span className="text-[7px] font-bold text-secondary uppercase tracking-widest">Portal Console</span>
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
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {profile?.isAuthorizedAdmin && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => switchRole('admin')} 
                className="h-8 px-4 gap-2 font-bold text-[9px] uppercase rounded-lg"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Panel
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 border border-white/20 cursor-pointer">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-secondary text-primary font-bold text-[10px]">{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSubView('profile')} className="gap-2 cursor-pointer font-medium text-xs">
                  <Settings className="h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive cursor-pointer font-medium text-xs">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-white h-10 w-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        {subView === 'log-entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-sm ring-1 ring-border">
                  <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                  <AvatarFallback className="bg-slate-200 text-slate-500 font-bold text-2xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3 pt-4 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 border px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                    {profile?.role === 'guest' ? "Guest Access" : `Academic Cycle ${academicYear}`}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                    {profile?.role === 'guest' ? "Welcome," : "Greetings,"} <span className="text-slate-900">{profile?.displayName?.split(' ')[0]}</span>
                  </h1>
                  <p className="text-muted-foreground font-medium text-sm">Institutional attendance and research tracking.</p>
                </div>
              </div>

              {!isLoadingVisit ? (
                !activeVisit ? (
                  <Card className={cn("shadow-sm border-border rounded-xl overflow-hidden", isManual && !isOpen && "border-amber-500 shadow-amber-100")}>
                    <CardHeader className={cn("bg-slate-50 border-b p-6 flex flex-row items-center justify-between", isManual && !isOpen && "bg-amber-50 border-amber-100")}>
                      <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight">
                        <History className="h-4 w-4 text-primary" />
                        Check-In Registration
                      </CardTitle>
                      <div className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest", isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {label}
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      {!isOpen ? (
                        <div className={cn("p-8 border-2 border-dashed rounded-xl flex flex-col items-center text-center gap-4", isManual ? "bg-amber-50/50 border-amber-200" : "bg-slate-50/50 border-slate-200")}>
                          {isManual ? <ShieldAlert className="h-10 w-10 text-amber-500" /> : <AlertCircle className="h-10 w-10 text-red-400" />}
                          <div className="space-y-2">
                            <h3 className={cn("font-bold uppercase", isManual ? "text-amber-900" : "text-slate-900")}>
                              {isManual ? "Manual Closure Active" : "Library Closed"}
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                              {isManual && reason ? (
                                <span className="font-bold text-amber-700 italic block mb-2">“{reason}”</span>
                              ) : null}
                              Access logging is currently disabled. <br />
                              <span className="text-primary font-bold">{nextEvent}</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                Current Department
                              </label>
                              <Select value={currentCollege} onValueChange={setCurrentCollege}>
                                <SelectTrigger className="h-11 font-medium text-sm rounded-lg">
                                  <SelectValue placeholder="Select Dept" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {NEU_COLLEGES.map((college) => (
                                    <SelectItem key={college.id} value={college.id} className="text-xs font-medium">
                                      {college.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                Purpose of Entry
                              </label>
                              <Select value={purpose} onValueChange={setPurpose}>
                                <SelectTrigger className="h-11 font-medium text-sm rounded-lg">
                                  <SelectValue placeholder="Select Purpose" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="reading books" className="text-xs font-medium">General Reading</SelectItem>
                                  <SelectItem value="research in thesis" className="text-xs font-medium">Academic Research</SelectItem>
                                  <SelectItem value="use of computer" className="text-xs font-medium">Computer Use</SelectItem>
                                  <SelectItem value="doing assignments" className="text-xs font-medium">Assignments</SelectItem>
                                  <SelectItem value="group study" className="text-xs font-medium">Collaborative Study</SelectItem>
                                  <SelectItem value="resource borrowing" className="text-xs font-medium">Resource Access</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Button 
                            onClick={handleCheckIn} 
                            disabled={!purpose || !currentCollege || isLogging}
                            className="w-full h-14 text-sm font-bold gap-3 rounded-xl"
                          >
                            {isLogging ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Confirm Attendance
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-lg border-primary bg-primary text-white p-12 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                      <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 animate-pulse">
                        <Clock className="h-8 w-8 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Active Session</h2>
                        <p className="text-white/70 text-sm font-medium">Checked In At: <span className="text-secondary">{activeVisit.timestamp.toDate().toLocaleTimeString()}</span></p>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">{activeVisit.purpose}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                        <Button 
                          onClick={handleCheckOut} 
                          disabled={isLogging}
                          variant="secondary" 
                          className="flex-1 h-12 font-bold uppercase text-[10px] tracking-widest"
                        >
                          {isLogging ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terminate Session"}
                        </Button>
                      </div>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] italic">Stay duration will be recorded upon exit.</p>
                    </div>
                  </Card>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verifying state...</p>
                </div>
              )}
            </div>

            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <Card className="shadow-sm rounded-xl">
                <CardHeader className="bg-primary text-white p-5">
                  <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-tight">
                    <Library className="h-3.5 w-3.5 text-secondary" />
                    Institutional Hub
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border rounded-lg">
                    <div className={cn("p-2 rounded-lg", isOpen ? "bg-green-100" : "bg-red-100")}>
                      <Clock className={cn("h-5 w-5", isOpen ? "text-green-600" : "text-red-600")} />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Facility Status</p>
                      <p className={cn("text-xs font-bold", isOpen ? "text-green-600" : "text-red-600")}>{label}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 border rounded-lg">
                    <div className={cn("p-2 rounded-lg", currentOccupancy > 0 ? "bg-primary/10" : "bg-slate-200")}>
                      <Users className={cn("h-5 w-5", currentOccupancy > 0 ? "text-primary" : "text-slate-400")} />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Live Occupancy</p>
                      <p className="text-xs font-bold text-slate-700">
                        {currentOccupancy} {currentOccupancy === 1 ? 'Person' : 'People'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Next Schedule Change</p>
                    <p className="text-xs font-medium text-slate-700 italic">{nextEvent}</p>
                  </div>
                  {isManual && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
                      <ShieldAlert className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] font-bold text-amber-800 uppercase leading-tight">Manual Override Active</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-green-600 font-bold text-[9px] uppercase tracking-widest">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                    Registry Online
                  </div>
                </CardContent>
              </Card>
              
              <LiveClock className="shadow-sm border bg-white p-6 !flex-col !items-start rounded-xl" showSelector={false} />
            </aside>
          </div>
        )}

        {subView === 'feedback' && <FeedbackView onBack={() => setSubView('log-entry')} />}
        {subView === 'help' && <HelpView onBack={() => setSubView('log-entry')} />}
        {subView === 'profile' && <ProfileView onBack={() => setSubView('log-entry')} />}
      </main>

      <footer className="p-10 border-t bg-white mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <Library className="h-4 w-4 text-primary" />
            <span className="font-bold text-xs uppercase tracking-widest text-primary">NEU Access Hub</span>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
            &copy; {new Date().getFullYear()} New Era University
          </p>
        </div>
      </footer>
    </div>
  );
}
