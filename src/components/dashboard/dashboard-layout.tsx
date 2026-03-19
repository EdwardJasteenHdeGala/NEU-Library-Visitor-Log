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
  Menu,
  X,
  Bell,
  Search,
  History
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
        <Sidebar className="border-r border-border bg-card shadow-lg">
          <SidebarHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-primary/5 p-1 rounded-lg w-10 h-10 relative overflow-hidden flex items-center justify-center">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain p-1" />
              </div>
              <div className="flex flex-col leading-none">
                <h1 className="text-xs font-black tracking-tighter text-primary uppercase italic">NEU Hub</h1>
                <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">CICS Console</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4 space-y-1">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => handleNavClick(item.id as View)}
                    isActive={currentView === item.id}
                    className={cn(
                      "w-full h-11 justify-start gap-4 px-4 rounded-xl font-bold text-xs uppercase tracking-tight transition-all",
                      currentView === item.id 
                        ? "bg-primary text-white shadow-xl scale-105" 
                        : "text-muted-foreground hover:bg-muted hover:text-primary"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", currentView === item.id ? "text-secondary" : "text-current")} />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className="pt-6 mt-6 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="w-full h-11 justify-start gap-4 px-4 rounded-xl font-bold text-xs uppercase text-destructive hover:bg-destructive/5"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="neu-header">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 w-full">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white hover:bg-white/10" />
                <div className="flex items-center gap-4 lg:hidden">
                  <Image src={logoImage?.imageUrl || ""} alt="NEU" width={32} height={32} />
                  <h1 className="text-xs font-bold uppercase text-white hidden xs:block">NEU Access Hub</h1>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-6">
                <LiveClock className="bg-white/5 border-white/10 text-white h-9 !py-0 !px-4 rounded-lg scale-90" showSelector={false} />
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10 relative"
                  onClick={() => handleNavClick('notifications')}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-secondary rounded-full animate-pulse" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:bg-white/10 p-1.5 rounded-full transition-all text-left">
                      <Avatar className="h-8 w-8 border border-white/20">
                        <AvatarImage src={profile?.photoURL} />
                        <AvatarFallback className="bg-secondary text-primary font-bold text-[10px]">{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start hidden xs:flex leading-none">
                        <span className="text-[10px] font-bold uppercase tracking-tight text-white">{profile?.displayName?.split(' ')[0]}</span>
                        <span className="text-[7px] font-bold text-secondary uppercase tracking-widest opacity-80">Administrator</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-2xl bg-card">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Menu</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavClick('profile')} className="gap-2 cursor-pointer font-bold text-xs">
                      <Settings className="h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => switchRole('user')} className="gap-2 cursor-pointer font-bold text-xs">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      Switch to Member View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="gap-2 text-destructive cursor-pointer font-bold text-xs">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 animate-in fade-in duration-700">
            {renderView()}
          </main>

          <footer className="p-8 bg-card border-t border-border flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 opacity-30 grayscale">
              <Image src={logoImage?.imageUrl || ""} alt="NEU" width={24} height={24} />
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary">New Era University Institutional Hub • CICS</span>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
