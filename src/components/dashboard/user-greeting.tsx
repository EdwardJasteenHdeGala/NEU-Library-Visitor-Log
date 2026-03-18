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
import { collection, doc } from "firebase/firestore";
import { useFirebase, addDocumentNonBlocking } from "@/firebase";
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

  const handleLogVisit = () => {
    if (!purpose || !profile || !firestore || !currentCollege) {
      toast({
        title: "Incomplete Details",
        description: "Please complete all fields before confirming attendance.",
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
      academicYear: getAcademicYear()
    });

    setTimeout(() => {
      toast({
        title: "Visit Logged",
        description: `Your entry for ${currentCollege} has been recorded.`,
      });
      setHasLoggedThisSession(true);
      setIsLogging(false);
    }, 600);
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
            <div className="bg-white p-1 rounded shadow-sm w-9 h-9 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => handleSubViewChange('log-entry')}>
              <Image 
                src={logoImage?.imageUrl || ""} 
                alt="NEU" 
                fill 
                priority 
                className="object-contain p-1.5"
              />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">NEU Access Hub</h1>
              <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">Student Portal</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSubViewChange(item.id as UserSubView)}
                className={cn(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 rounded-lg",
                  subView === item.id ? "bg-white/10 text-white shadow-sm" : "text-white/60 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
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
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSubViewChange('profile')} className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive cursor-pointer">
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
        
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[60px] bg-primary p-4 border-t border-white/10 shadow-lg space-y-1 z-[70]">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSubViewChange(item.id as UserSubView)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all",
                  subView === item.id ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        {subView === 'log-entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-sm ring-1 ring-border">
                  <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                  <AvatarFallback className="bg-slate-200 text-slate-500 font-bold text-2xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 pt-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {isGuest ? "Guest Access" : `Academic Cycle ${academicYear || "2024-25"}`}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
                    {isGuest ? "Hello," : "Welcome,"} <span className="text-slate-900">{profile?.displayName?.split(' ')[0]}</span>
                  </h1>
                  <p className="text-muted-foreground font-medium">Please confirm your institutional attendance.</p>
                </div>
              </div>

              {!hasLoggedThisSession ? (
                <Card className="shadow-sm border-border">
                  <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Attendance Registry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                          Academic Unit / Department
                        </label>
                        <Select value={currentCollege} onValueChange={setCurrentCollege}>
                          <SelectTrigger className="h-12 font-semibold">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            {NEU_COLLEGES.map((college) => (
                              <SelectItem key={college.id} value={college.id} className="font-semibold">
                                {college.name} ({college.id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                          Purpose of Visit
                        </label>
                        <Select value={purpose} onValueChange={setPurpose}>
                          <SelectTrigger className="h-12 font-semibold">
                            <SelectValue placeholder="Select Purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reading books" className="font-semibold">General Reading</SelectItem>
                            <SelectItem value="research in thesis" className="font-semibold">Academic Research</SelectItem>
                            <SelectItem value="use of computer" className="font-semibold">Computer Utilization</SelectItem>
                            <SelectItem value="doing assignments" className="font-semibold">Course Assignments</SelectItem>
                            <SelectItem value="group study" className="font-semibold">Collaborative Study</SelectItem>
                            <SelectItem value="charging device" className="font-semibold">Power Utilization</SelectItem>
                            <SelectItem value="printing/scanning" className="font-semibold">Media Services</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={handleLogVisit} 
                      disabled={!purpose || !currentCollege || isLogging}
                      className="w-full h-14 text-base font-bold gap-3"
                    >
                      {isLogging ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                      Confirm Attendance
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg border-primary bg-primary text-white text-center py-16 px-8 rounded-2xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                  <div className="relative z-10 space-y-6">
                    <div className="h-20 w-20 bg-white/10 rounded-full flex items-center justify-center mx-auto border-2 border-white/20">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold">Attendance Confirmed</h2>
                      <p className="text-white/70 max-w-sm mx-auto">Your institutional presence has been successfully synchronized with the Hub.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white font-bold h-12 px-8" onClick={logout}>Sign Out</Button>
                      <Button variant="secondary" className="font-bold h-12 px-8" onClick={() => setHasLoggedThisSession(false)}>New Entry</Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <Card className="shadow-sm">
                <CardHeader className="bg-primary text-white p-6">
                  <CardTitle className="text-base font-bold flex items-center gap-2 uppercase tracking-tight">
                    <Library className="h-4 w-4 text-secondary" />
                    Hub Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                    <div className="leading-tight">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operational Hours</p>
                      <p className="text-sm font-bold text-primary">08:00 AM - 05:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    System Online
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Access logging is mandatory for all institutional visitors. Please ensure your session is recorded accurately.
                  </p>
                </CardContent>
              </Card>
              
              <LiveClock className="shadow-sm border bg-white p-6 !flex-col !items-start" showSelector={false} />
            </aside>
          </div>
        )}

        {subView === 'feedback' && <FeedbackView onBack={() => setSubView('log-entry')} />}
        {subView === 'help' && <HelpView onBack={() => setSubView('log-entry')} />}
        {subView === 'profile' && <ProfileView onBack={() => setSubView('log-entry')} />}
      </main>

      <footer className="p-10 border-t bg-white mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <div className="flex items-center gap-3">
            <Library className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm uppercase tracking-widest text-primary">NEU Access Hub</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            &copy; {new Date().getFullYear()} New Era University
          </p>
        </div>
      </footer>
    </div>
  );
}