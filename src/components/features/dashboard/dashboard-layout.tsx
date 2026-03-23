"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  FileText,
  MessageSquare, 
  Settings, 
  LogOut, 
  UserCog,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Search,
  BookOpen,
  RotateCcw,
  Clock,
  Menu,
  UserCheck,
  UserPlus
} from "lucide-react";
import dynamic from "next/dynamic";
import { AdminOverview } from "./admin-overview";
import { Card } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";

const loadingSkeleton = (text: string) => (
  <div className="h-96 w-full flex flex-col items-center justify-center gap-4 animate-pulse bg-muted/10 rounded-[2.5rem] border border-border/50">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    <span className="font-black text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground italic">Summoning {text}...</span>
  </div>
);

type ViewProps = { onBack: () => void; };

const VisitorLog = dynamic<ViewProps>(() => import("./visitor-log").then(mod => mod.VisitorLog), { ssr: false, loading: () => loadingSkeleton("Visitor Logs") });
const ReportsView = dynamic<ViewProps>(() => import("./reports-view").then(mod => mod.ReportsView), { ssr: false, loading: () => loadingSkeleton("Analytics Engine") });
const FeedbackView = dynamic<ViewProps>(() => import("./feedback-view").then(mod => mod.FeedbackView), { ssr: false, loading: () => loadingSkeleton("Feedback Core") });
const ProfileView = dynamic<ViewProps>(() => import("./profile-view").then(mod => mod.ProfileView), { ssr: false, loading: () => loadingSkeleton("Identity Profile") });
const HelpView = dynamic<ViewProps>(() => import("./help-view").then(mod => mod.HelpView), { ssr: false, loading: () => loadingSkeleton("Support Database") });
const UserManagement = dynamic<ViewProps>(() => import("./user-management").then(mod => mod.UserManagement), { ssr: false, loading: () => loadingSkeleton("User Directory") });
const AuditLogView = dynamic<ViewProps>(() => import("./audit-log-view").then(mod => mod.AuditLogView), { ssr: false, loading: () => loadingSkeleton("Audit Matrix") });
const NotificationsView = dynamic<ViewProps>(() => import("./notifications-view").then(mod => mod.NotificationsView), { ssr: false, loading: () => loadingSkeleton("Alert Stream") });
const SettingsView = dynamic<ViewProps>(() => import("./settings-view").then(mod => mod.SettingsView), { ssr: false, loading: () => loadingSkeleton("Configurations") });
const LibraryView = dynamic<ViewProps>(() => import("./library-view").then(mod => mod.LibraryView), { ssr: false, loading: () => loadingSkeleton("Library Catalog") });
const AdminCirculation = dynamic<ViewProps>(() => import("./admin-circulation").then(mod => mod.AdminCirculation), { ssr: false, loading: () => loadingSkeleton("Circulation Logic") });
const SystemDiagnosticsView = dynamic<ViewProps>(() => import("../diagnostics/diagnostics-view").then(mod => mod.SystemDiagnosticsView), { ssr: false, loading: () => loadingSkeleton("System Diagnostics") });
const StaffRegistry = dynamic<ViewProps>(() => import("./staff-registry").then(mod => mod.StaffRegistry), { ssr: false, loading: () => loadingSkeleton("Staff Registry") });

import { AIAssistant } from "../../shared/ai-assistant";
import { UnifiedLayout } from "@/components/shared/unified-layout";
import { cn } from "@/lib/utils";
import { LiveClock } from "@/components/ui/live-clock";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

type View = 'dashboard' | 'visitor-log' | 'users' | 'staff' | 'reports' | 'feedback' | 'profile' | 'help' | 'audit' | 'notifications' | 'settings' | 'diagnostics' | 'library' | 'circulation';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

function AdminSidebarTrigger() {
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

export function DashboardLayout() {
  const { logout, profile, switchViewMode } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isPending, startTransition] = useTransition();
  
  // SECURITY GUARD: Structural fail-safe for Admin Console
  if (!profile?.isAuthorizedAdmin) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#032e41] flex items-center justify-center p-6 text-white font-headline overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#032e41] via-[#032e41] to-[#0a4d68]/40 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[80%] bg-destructive/5 blur-[120px] rounded-full animate-pulse-subtle" />
        
        <Card className="max-w-md w-full border-none bg-white/[0.03] backdrop-blur-3xl p-12 text-center space-y-10 rounded-[3rem] shadow-premium ring-1 ring-white/10 relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="mx-auto w-28 h-28 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 animate-float shadow-glass-destructive">
            <ShieldAlert className="h-14 w-14 text-destructive drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-glow-destructive">Security Breach</h1>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.5em] text-destructive opacity-80">Institutional Access Restricted</p>
          </div>
          <p className="text-sm font-medium italic opacity-60 leading-relaxed px-4">
            Administrative credentials are required to synchronize with the Oversight Dashboard. This unauthorized synchronization attempt has been cached for audit.
          </p>
          <Button 
            onClick={() => switchViewMode('member')}
            className="w-full h-20 bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-widest rounded-2xl shadow-premium-secondary hover:scale-[1.05] active:scale-95 transition-all text-sm"
          >
            Authorize Return to Hub
          </Button>
        </Card>
      </div>
    );
  }

  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Library Catalog', icon: BookOpen },
    { id: 'circulation', label: 'Circulation Manager', icon: RotateCcw, adminOnly: true },
    { id: 'visitor-log', label: 'Visitor Registry', icon: Users, adminOnly: true },
    { id: 'users', label: 'Members List', icon: UserCheck, superAdminOnly: true },
    { id: 'staff', label: 'Staff Registry', icon: UserCog, superAdminOnly: true },
    { id: 'reports', label: 'Reports', icon: FileText, adminOnly: true },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, adminOnly: true },
    { id: 'audit', label: 'Audit Log', icon: Search, adminOnly: true },
    { id: 'diagnostics', label: 'Diagnostics', icon: ShieldAlert, adminOnly: true },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
  ];

  const handleNavClick = (view: string) => {
    startTransition(() => {
      setCurrentView(view as View);
    });
  };

  const renderView = () => {
    const onBack = () => handleNavClick('dashboard');
    switch (currentView) {
      case 'dashboard': return <AdminOverview onNavigate={handleNavClick} />;
      case 'visitor-log': return <VisitorLog onBack={onBack} />;
      case 'users': return <UserManagement onBack={onBack} />;
      case 'staff': return <StaffRegistry onBack={onBack} />;
      case 'reports': return <ReportsView onBack={onBack} />;
      case 'feedback': return <FeedbackView onBack={onBack} />;
      case 'audit': return <AuditLogView onBack={onBack} />;
      case 'diagnostics': return <SystemDiagnosticsView onBack={onBack} />;
      case 'notifications': return <NotificationsView onBack={onBack} />;
      case 'settings': return <SettingsView onBack={onBack} />;
      case 'help': return <HelpView onBack={onBack} />;
      case 'library': return <LibraryView onBack={onBack} />;
      case 'circulation': return <AdminCirculation onBack={onBack} />;
      case 'profile': return <ProfileView onBack={onBack} />;
      default: return <AdminOverview onNavigate={handleNavClick} />;
    }
  };

  const userInitials = profile?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  return (
    <UnifiedLayout 
      mode="admin" 
      activeView={currentView} 
      onNavigate={(id) => handleNavClick(id)}
      onBack={() => handleNavClick('dashboard')}
    >
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-primary/5">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              <ShieldCheck className="h-4 w-4 text-secondary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Administrative Authority</span>
            </div>
            <div className="flex items-center gap-4">
              <AdminSidebarTrigger />
              <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary leading-none">
                Console <br /> <span className="text-secondary text-glow-secondary">Oversight</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-primary/5 p-6 rounded-[2rem] border border-primary/10 shadow-inner">
            <div className="flex flex-col items-end leading-none gap-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Time</span>
              <LiveClock className="!bg-transparent !border-none !text-primary !p-0 font-black italic text-sm" showSelector={false} />
            </div>
          </div>
        </div>

        <div className="min-h-[60vh]">
          {renderView()}
        </div>
      </div>
    </UnifiedLayout>
  );
}
