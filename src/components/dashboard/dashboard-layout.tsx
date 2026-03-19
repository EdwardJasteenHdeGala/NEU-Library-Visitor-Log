"use client";

import { useState } from "react";
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
  Bell,
  Search
} from "lucide-react";
import { AdminOverview } from "./admin-overview";
import { VisitorLog } from "./visitor-log";
import { ReportsView } from "./reports-view";
import { FeedbackView } from "./feedback-view";
import { ProfileView } from "./profile-view";
import { HelpView } from "./help-view";
import { UserManagement } from "./user-management";
import { AuditLogView } from "./audit-log-view";
import { NotificationsView } from "./notifications-view";
import { SettingsView } from "./settings-view";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiveClock } from "@/components/ui/live-clock";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type View = 'dashboard' | 'visitor-log' | 'users' | 'reports' | 'feedback' | 'profile' | 'help' | 'audit' | 'notifications' | 'settings';

export function DashboardLayout() {
  const { logout, profile, switchRole } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'visitor-log', label: 'Visitor Log', icon: Users },
    { id: 'users', label: 'User Admin', icon: UserCog },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'audit', label: 'Audit Log', icon: Search },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: View) => {
    setCurrentView(view);
  };

  const renderView = () => {
    const onBack = () => handleNavClick('dashboard');
    switch (currentView) {
      case 'dashboard': return <AdminOverview onNavigate={handleNavClick} />;
      case 'visitor-log': return <VisitorLog onBack={onBack} />;
      case 'users': return <UserManagement onBack={onBack} />;
      case 'reports': return <ReportsView onBack={onBack} />;
      case 'feedback': return <FeedbackView onBack={onBack} />;
      case 'audit': return <AuditLogView onBack={onBack} />;
      case 'notifications': return <NotificationsView onBack={onBack} />;
      case 'settings': return <SettingsView onBack={onBack} />;
      case 'help': return <HelpView onBack={onBack} />;
      case 'profile': return <ProfileView onBack={onBack} />;
      default: return <AdminOverview onNavigate={handleNavClick} />;
    }
  };

  const userInitials = profile?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <Sidebar className="border-r border-border bg-card shadow-lg w-[clamp(14rem,20vw,18rem)]">
          <SidebarHeader className="p-[clamp(1rem,3vh,1.5rem)] border-b">
            <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
              <div className="bg-primary/5 p-[0.25rem] rounded-lg w-[2.5rem] h-[2.25rem] relative overflow-hidden flex items-center justify-center">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain p-[0.25rem]" />
              </div>
              <div className="flex flex-col leading-none">
                <h1 className="text-[0.75rem] font-black tracking-tighter text-primary uppercase italic">NEU Hub</h1>
                <span className="text-[0.4375rem] font-bold text-muted-foreground uppercase tracking-widest">CICS Console</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-[0.75rem] space-y-[0.25rem]">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => handleNavClick(item.id as View)}
                    isActive={currentView === item.id}
                    className={cn(
                      "w-full h-[2.75rem] justify-start gap-[1rem] px-[1rem] rounded-[0.75rem] font-bold text-[0.75rem] uppercase tracking-tight transition-all",
                      currentView === item.id 
                        ? "bg-primary text-white shadow-xl scale-105" 
                        : "text-muted-foreground hover:bg-muted hover:text-primary"
                    )}
                  >
                    <item.icon className={cn("h-[1rem] w-[1rem]", currentView === item.id ? "text-secondary" : "text-current")} />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className="pt-[1.5rem] mt-[1.5rem] border-t border-border">
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="w-full h-[2.75rem] justify-start gap-[1rem] px-[1rem] rounded-[0.75rem] font-bold text-[0.75rem] uppercase text-destructive hover:bg-destructive/5"
              >
                <LogOut className="h-[1rem] w-[1rem]" />
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="neu-header">
            <div className="max-w-[80rem] mx-auto flex justify-between items-center px-[clamp(1rem,5vw,1.5rem)] w-full">
              <div className="flex items-center gap-[1rem]">
                <SidebarTrigger className="text-white hover:bg-white/10" />
                <div className="flex items-center gap-[1rem] lg:hidden">
                  <Image src={logoImage?.imageUrl || ""} alt="NEU" width={32} height={32} />
                  <h1 className="text-[0.75rem] font-bold uppercase text-white hidden xs:block">NEU Access Hub</h1>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-[1.5rem]">
                <LiveClock className="bg-white/5 border-white/10 text-white h-[2.25rem] !py-0 !px-[1rem] rounded-lg scale-90" showSelector={false} />
              </div>

              <div className="flex items-center gap-[clamp(0.5rem,2vw,1rem)] ml-auto">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10 relative"
                  onClick={() => handleNavClick('notifications')}
                >
                  <Bell className="h-[1.25rem] w-[1.25rem]" />
                  <span className="absolute top-[0.5rem] right-[0.5rem] h-[0.5rem] w-[0.5rem] bg-secondary rounded-full animate-pulse" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-[0.75rem] hover:bg-white/10 p-[0.375rem] rounded-full transition-all text-left">
                      <Avatar className="h-[2rem] w-[2.25rem] border border-white/20">
                        <AvatarImage src={profile?.photoURL} />
                        <AvatarFallback className="bg-secondary text-primary font-bold text-[0.625rem]">{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start hidden xs:flex leading-none">
                        <span className="text-[0.625rem] font-bold uppercase tracking-tight text-white">{profile?.displayName?.split(' ')[0]}</span>
                        <span className="text-[0.4375rem] font-bold text-secondary uppercase tracking-widest opacity-80">Administrator</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[14rem] mt-[0.5rem] rounded-[1rem] shadow-2xl bg-card border-none">
                    <DropdownMenuLabel className="text-[0.625rem] font-black uppercase tracking-widest text-muted-foreground p-[0.75rem]">Admin Menu</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavClick('profile')} className="gap-[0.5rem] cursor-pointer font-bold text-[0.75rem] h-[2.5rem]">
                      <Settings className="h-[1rem] w-[1rem]" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => switchRole('user')} className="gap-[0.5rem] cursor-pointer font-bold text-[0.75rem] h-[2.5rem]">
                      <ShieldCheck className="h-[1rem] w-[1rem] text-green-600" />
                      Switch to Member View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="gap-[0.5rem] text-destructive cursor-pointer font-bold text-[0.75rem] h-[2.5rem]">
                      <LogOut className="h-[1rem] w-[1rem]" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 w-full max-w-[80rem] mx-auto p-[clamp(1rem,5vw,2.5rem)] animate-in fade-in duration-700">
            {renderView()}
          </main>

          <footer className="p-[2rem] bg-card border-t border-border flex flex-col items-center gap-[1rem]">
            <div className="flex items-center gap-[0.75rem] opacity-30 grayscale">
              <Image src={logoImage?.imageUrl || ""} alt="NEU" width={24} height={24} />
              <span className="text-[0.5rem] font-black uppercase tracking-[0.4em] text-primary">© 2026 New Era University Institutional Hub • CICS</span>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}