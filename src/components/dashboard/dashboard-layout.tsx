
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
  X
} from "lucide-react";
import { AdminOverview } from "./admin-overview";
import { VisitorLog } from "./visitor-log";
import { ReportsView } from "./reports-view";
import { FeedbackView } from "./feedback-view";
import { ProfileView } from "./profile-view";
import { HelpView } from "./help-view";
import { UserManagement } from "./user-management";
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
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type View = 'dashboard' | 'visitor-log' | 'users' | 'reports' | 'feedback' | 'profile' | 'help';

export function DashboardLayout() {
  const { logout, profile, switchRole } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'visitor-log', label: 'Registry', icon: Users },
    { id: 'users', label: 'Users', icon: UserCog },
    { id: 'reports', label: 'Analytics', icon: FileText },
    { id: 'feedback', label: 'Sentiments', icon: MessageSquare },
    { id: 'help', label: 'Resources', icon: HelpCircle },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const renderView = () => {
    const onBack = () => handleNavClick('dashboard');
    
    switch (currentView) {
      case 'dashboard': return <AdminOverview onNavigate={handleNavClick} />;
      case 'visitor-log': return <VisitorLog onBack={onBack} />;
      case 'users': return <UserManagement onBack={onBack} />;
      case 'reports': return <ReportsView onBack={onBack} />;
      case 'feedback': return <FeedbackView onBack={onBack} />;
      case 'help': return <HelpView onBack={onBack} />;
      case 'profile': return <ProfileView onBack={onBack} />;
      default: return <AdminOverview onNavigate={handleNavClick} />;
    }
  };

  const userInitials = profile?.displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden neu-mesh-gradient">
      <div className="fixed top-[-5%] right-[-5%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px] animate-blob pointer-events-none z-0" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[100px] animate-blob delay-2000 pointer-events-none z-0" />
      <div className="neu-bg-overlay" />

      {/* Global Header synchronized with UserGreeting */}
      <header className="relative z-[70] p-3 bg-primary text-white sticky top-0 shadow-xl border-b border-white/10 backdrop-blur-xl bg-primary/95 transition-all h-[60px] flex items-center">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 w-full">
          <div className="flex items-center gap-3">
            <div 
              className="bg-white p-1 rounded-xl shadow-2xl w-9 h-9 relative overflow-hidden flex items-center justify-center group cursor-pointer border border-white/20" 
              onClick={() => handleNavClick('dashboard')}
            >
                <Image 
                  src={logoImage?.imageUrl || ""} 
                  alt="NEU Logo" 
                  fill 
                  priority
                  className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                />
            </div>
            <div className="flex flex-col -space-y-0.5 hidden xs:flex">
                <h1 className="text-sm font-black tracking-tighter italic uppercase leading-none text-white">NEU HUB</h1>
                <span className="text-[7px] font-black text-secondary uppercase tracking-[0.2em] opacity-80">Institutional Admin</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id as View)}
                    className={cn(
                        "px-5 py-2 text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2.5 rounded-xl whitespace-nowrap",
                        currentView === item.id 
                          ? "bg-secondary text-primary shadow-xl" 
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <item.icon className={cn("h-3.5 w-3.5", currentView === item.id ? "text-primary" : "text-white/30")} />
                    {item.label}
                </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <LiveClock className="hidden xl:flex bg-white/5 border-white/10 text-white !py-1 !px-5 rounded-xl scale-90" showSelector={false} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-white/10 p-1.5 pr-4 rounded-full transition-all border border-transparent hover:border-white/10 group">
                  <Avatar className="h-9 w-9 border-2 border-secondary/50 shadow-2xl group-hover:scale-105 transition-all ring-4 ring-white/5">
                    <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                    <AvatarFallback className="bg-secondary text-primary font-black text-[10px]">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start hidden xs:flex text-left text-white">
                    <span className="text-[10px] font-black uppercase tracking-tight leading-none max-w-[100px] truncate">{profile?.displayName?.split(' ')[0]}</span>
                    <span className="text-[7px] font-bold text-secondary uppercase tracking-widest opacity-80 italic">Admin</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 shadow-3xl border-none mt-3 bg-white/98 backdrop-blur-3xl animate-in slide-in-from-top-3">
                <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground px-4 py-3">Account Console</DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-2 opacity-10" />
                <DropdownMenuItem onClick={() => handleNavClick('profile')} className="rounded-xl h-12 gap-4 focus:bg-primary/5 cursor-pointer px-4">
                  <Settings className="h-4.5 w-4.5 text-primary" />
                  <span className="font-bold text-sm text-primary">System Settings</span>
                </DropdownMenuItem>
                {profile?.isAuthorizedAdmin && (
                  <DropdownMenuItem onClick={() => switchRole(profile.role === 'admin' ? 'user' : 'admin')} className="rounded-xl h-12 gap-4 text-blue-600 focus:bg-blue-50 cursor-pointer px-4">
                    <ShieldCheck className="h-4.5 w-4.5" />
                    <span className="font-black text-[9px] uppercase tracking-widest">Toggle User Mode</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="mx-2 opacity-10" />
                <DropdownMenuItem onClick={logout} className="rounded-xl h-12 gap-4 text-destructive focus:bg-destructive/5 cursor-pointer px-4">
                  <LogOut className="h-4.5 w-4.5" />
                  <span className="font-black uppercase text-[10px] tracking-widest">Terminate Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-white h-10 w-10 hover:bg-white/10 rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-x-0 top-[60px] bg-primary/98 backdrop-blur-3xl p-5 border-t border-white/10 shadow-3xl space-y-2 animate-in slide-in-from-top-6 duration-500 z-[70]">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id as View)}
                        className={cn(
                            "w-full flex items-center gap-5 p-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all",
                            currentView === item.id ? "bg-secondary text-primary shadow-xl" : "text-white/70 hover:bg-white/10"
                        )}
                    >
                        <item.icon className="h-6 w-6" />
                        {item.label}
                    </button>
                ))}
            </div>
        )}
      </header>

      <main className="relative flex-1 w-full max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-700 pb-24">
        <div className="relative z-10 w-full">
          {renderView()}
        </div>
      </main>

      <footer className="relative z-10 p-12 bg-white/40 backdrop-blur-3xl border-t flex flex-col items-center gap-6 mt-auto">
        <div className="flex items-center gap-5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">
            <div className="relative w-9 h-9">
                <Image 
                  src={logoImage?.imageUrl || ""} 
                  alt="NEU" 
                  fill 
                  className="object-contain" 
                />
            </div>
            <div className="flex flex-col items-start -space-y-1">
              <span className="font-black text-sm uppercase tracking-[0.3em] text-primary italic">New Era University</span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Institutional Hub • Admin Portal</span>
            </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.7em] text-muted-foreground/40 text-center">
          &copy; {new Date().getFullYear()} INTEGRITY • EXCELLENCE • DISCIPLINE
        </p>
      </footer>
    </div>
  );
}
