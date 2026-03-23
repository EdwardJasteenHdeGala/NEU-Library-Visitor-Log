"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Library, 
  Loader2, 
  UserCheck,
  Clock,
  Activity,
  History,
  Info,
  ChevronRight,
  BookOpen,
  Bell,
  MessageSquare,
  HelpCircle,
  Settings,
  Megaphone,
  Sparkles,
  Lock,
  Globe,
  ShieldCheck, 
  LogIn,
  LogOut,
  LayoutDashboard,
  ChevronLeft
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { collection, query, where, orderBy, limit, doc } from "firebase/firestore";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { LiveClock } from "@/components/ui/live-clock";
import { useSidebar } from "@/components/ui/sidebar";
import { getAcademicYear, cn } from "@/lib/utils";
import { useLibraryStatus } from "@/hooks/use-library-status";
import { Menu } from "lucide-react";
import dynamic from "next/dynamic";

const loadingSkeleton = (text: string) => (
  <div className="h-96 w-full flex flex-col items-center justify-center gap-4 animate-pulse bg-muted/10 rounded-[2.5rem] border border-border/50">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    <span className="font-black text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground italic">Summoning {text}...</span>
  </div>
);

const FeedbackView = dynamic(() => import("@/components/features/dashboard/feedback-view").then(mod => mod.FeedbackView), { ssr: false, loading: () => loadingSkeleton("Feedback Core") });
const HelpView = dynamic(() => import("@/components/features/dashboard/help-view").then(mod => mod.HelpView), { ssr: false, loading: () => loadingSkeleton("Support Database") });
const ProfileView = dynamic(() => import("@/components/features/dashboard/profile-view").then(mod => mod.ProfileView), { ssr: false, loading: () => loadingSkeleton("Identity Profile") });
const NotificationsView = dynamic(() => import("@/components/features/dashboard/notifications-view").then(mod => mod.NotificationsView), { ssr: false, loading: () => loadingSkeleton("Alert Stream") });
const LibraryView = dynamic(() => import("@/components/features/dashboard/library-view").then(mod => mod.LibraryView), { ssr: false, loading: () => loadingSkeleton("Library Catalog") });
const GovernanceView = dynamic<{ onBack: () => void }>(() => import("@/components/features/dashboard/governance-view").then(mod => mod.GovernanceView), { ssr: false, loading: () => loadingSkeleton("Governance Dashboard") });


import { AttendanceRegistryCard } from "./attendance-registry-card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UnifiedLayout } from "@/components/shared/unified-layout";
import { AIAssistant } from "../../shared/ai-assistant";
import { NEU_COLLEGES } from "@/lib/constants";



type UserSubView = 'dashboard' | 'feedback' | 'help' | 'profile' | 'notifications' | 'library' | 'governance';

function SidebarMenuTrigger() {
  const { setOpen } = useSidebar();
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={() => setOpen(true)}
      className="h-14 w-14 rounded-2xl border-primary/10 bg-white/50 backdrop-blur-xl hover:bg-white/80 text-primary shadow-premium transition-all hover:scale-[1.05] group/menu"
    >
      <Menu className="h-6 w-6 group-hover/menu:rotate-90 transition-transform duration-500" />
    </Button>
  );
}

export function InstitutionalHub() {
  const { logout, profile, switchViewMode } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const status = useLibraryStatus();
  
  const [subView, setSubView] = useState<UserSubView>('dashboard');
  const [isPending, startTransition] = useTransition();
  const [isPendingSession, setIsPendingSession] = useState(false);

  const [academicYear, setAcademicYear] = useState("");
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const advisoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'advisories'), orderBy('timestamp', 'desc'), limit(5));
  }, [firestore]);
  const { data: remoteAdvisories } = useCollection(advisoriesQuery);

  const announcements = useMemo(() => {
    return remoteAdvisories && remoteAdvisories.length > 0 
      ? remoteAdvisories.map((adv: any) => adv.message)
      : [
          "Library Registry synchronization is mandatory for all members.",
          "University thesis repository access now available via digital terminal.",
          "New academic resources added to the Research Archive."
        ];
  }, [remoteAdvisories]);

  useEffect(() => {
    setAcademicYear(getAcademicYear());
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);



  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
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

  // AUTO-RESOLVE PENDING STATE: Sync with Firestore detection
  useEffect(() => {
    if (activeVisit && isPendingSession) {
      setIsPendingSession(false);
    }
  }, [activeVisit, isPendingSession]);

  const userInitials = profile?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'V';
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Knowledge', icon: BookOpen },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'feedback', label: 'Sentiments', icon: MessageSquare },
    { id: 'help', label: 'Support', icon: HelpCircle },
    { id: 'profile', label: 'Identity', icon: Settings },
    ...(profile?.role === 'superadmin' ? [{ id: 'governance', label: 'Governance', icon: ShieldCheck }] : []),
  ];

  const renderMemberView = () => {
    const onBack = () => startTransition(() => setSubView('dashboard'));
    switch (subView) {
      case 'notifications': return <NotificationsView onBack={onBack} />;
      case 'feedback': return <FeedbackView onBack={onBack} />;
      case 'help': return <HelpView onBack={onBack} />;
      case 'profile': return <ProfileView onBack={onBack} />;
      case 'library': return <LibraryView onBack={onBack} />;
      case 'governance': return <GovernanceView onBack={onBack} />;
      default: return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Hub Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-primary/5">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-3 bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20">
                <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Identity Synchronized</span>
              </div>
              <div className="flex items-center gap-4">
                <SidebarMenuTrigger />
                <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary leading-none">
                  NEU <br /> <span className="text-secondary text-glow-secondary">Access Hub</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-primary/5 p-6 rounded-[2rem] border border-primary/10 shadow-inner">
              <LiveClock className="!bg-transparent !border-none !text-primary !p-0 scale-110" showSelector={false} />
              <div className="h-10 w-px bg-primary/10" />
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-3 w-3 rounded-full",
                  status.isOpen ? "bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.4)]" : "bg-rose-400"
                )} />
                <span className="text-xs font-black uppercase tracking-widest text-primary/70">{status.label}</span>
              </div>
            </div>
          </div>

          {/* Main Hub Content */}
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <div className="p-8 bg-primary/[0.02] rounded-[2.5rem] border border-primary/5 shadow-inner">
                 <AttendanceRegistryCard 
                  isPendingSession={isPendingSession}
                  onCheckInStart={() => setIsPendingSession(true)}
                  onCheckInComplete={() => setIsPendingSession(false)}
                />
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-8">
              <Card className="p-8 border-none rounded-[2rem] bg-background/40 backdrop-blur-xl shadow-premium space-y-6">
                <div className="flex items-center gap-4 border-b border-primary/5 pb-4">
                  <div className="p-2 bg-secondary/10 rounded-xl">
                    <Globe className="h-5 w-5 text-secondary" />
                  </div>
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary">Institutional Policy</h4>
                </div>
                <p className="text-xs font-bold italic leading-relaxed text-muted-foreground">
                  Registry synchronization is mandatory. Your logs are archived for institutional oversight and audit compliance.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Secure Protocol Active</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/5">
                    <Info className="h-4 w-4 text-secondary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">AY {academicYear} Registry</span>
                  </div>
                </div>
              </Card>

              <Card className="p-8 border-none rounded-[2rem] bg-[#032e41] text-white shadow-premium space-y-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <Bell className="h-5 w-5 text-secondary animate-pulse" />
                  <h4 className="font-black text-[10px] uppercase tracking-widest">Protocol Reminder</h4>
                </div>
                <p className="text-[11px] font-medium leading-relaxed opacity-70 italic relative z-10">
                  Please terminate your session upon departure to maintain facility occupancy telemetry integrity.
                </p>
              </Card>
            </aside>
          </div>
        </div>
      );
    }
  };

  return (
    <UnifiedLayout 
      mode="member" 
      activeView={subView} 
      onNavigate={(id) => startTransition(() => setSubView(id as UserSubView))}
      onBack={() => startTransition(() => setSubView('dashboard'))}
    >
      {renderMemberView()}
    </UnifiedLayout>
  );
}
