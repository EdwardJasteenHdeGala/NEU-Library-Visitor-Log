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
  RefreshCcw,
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

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <AdminOverview />;
      case 'visitor-log': return <VisitorLog />;
      case 'users': return <UserManagement />;
      case 'reports': return <ReportsView />;
      case 'feedback': return <FeedbackView />;
      case 'help': return <HelpView />;
      case 'profile': return <ProfileView />;
      default: return <AdminOverview />;
    }
  };

  const userInitials = profile?.displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden neu-mesh-gradient">
      {/* Optimized background elements */}
      <div className="fixed top-[-5%] right-[-5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary/5 rounded-full blur-[100px] animate-blob pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-secondary/5 rounded-full blur-[100px] animate-blob delay-2000 pointer-events-none" />
      <div className="neu-bg-overlay" />

      <nav className="bg-primary text-white p-3 md:p-4 shadow-2xl sticky top-0 z-[60] border-b border-white/5 backdrop-blur-xl bg-primary/95 transition-all">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div 
              className="bg-white p-1 rounded-xl shadow-lg w-8 h-8 md:w-10 md:h-10 relative overflow-hidden flex items-center justify-center group cursor-pointer" 
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
            <div className="flex flex-col -space-y-1 hidden xs:flex">
                <h1 className="text-lg md:text-xl font-black tracking-tighter italic uppercase leading-tight">NEU HUB</h1>
                <span className="text-[8px] md:text-[9px] font-black text-secondary uppercase tracking-[0.3em] opacity-90">Institutional Admin</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id as View)}
                    className={cn(
                        "px-4 xl:px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 rounded-xl whitespace-nowrap",
                        currentView === item.id 
                          ? "bg-secondary text-primary shadow-lg scale-105" 
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <item.icon className={cn("h-4 w-4", currentView === item.id ? "text-primary" : "text-white/30")} />
                    {item.label}
                </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <LiveClock className="hidden xl:flex bg-white/5 border-white/10 text-white !py-1 !px-5 rounded-2xl" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 md:gap-4 hover:bg-white/10 p-1 md:pr-4 rounded-3xl transition-all border border-transparent hover:border-white/10 group">
                  <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-secondary/50 shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                    <AvatarFallback className="bg-secondary text-primary font-black text-[10px] md:text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start hidden sm:flex text-left">
                    <span className="text-xs font-black uppercase tracking-tight leading-none max-w-[120px] truncate">{profile?.displayName?.split(' ')[0]}</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-secondary uppercase tracking-widest opacity-80 italic">Administrator</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 md:w-72 rounded-[2rem] p-3 shadow-2xl border-none mt-4 bg-white/95 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-300">
                <DropdownMenuLabel className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground px-5 py-4">Account Management</DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-3" />
                <DropdownMenuItem onClick={() => handleNavClick('profile')} className="rounded-2xl h-12 md:h-14 gap-4 focus:bg-primary/5 cursor-pointer px-5 transition-all">
                  <Settings className="h-5 w-5 text-primary" />
                  <span className="font-bold text-sm">System Settings</span>
                </DropdownMenuItem>
                {profile?.isAuthorizedAdmin && (
                  <DropdownMenuItem onClick={() => switchRole(profile.role === 'admin' ? 'user' : 'admin')} className="rounded-2xl h-12 md:h-14 gap-4 text-blue-600 focus:bg-blue-50 cursor-pointer px-5 transition-all">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-black text-[10px] md:text-xs uppercase tracking-widest">Switch to User Mode</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="mx-3" />
                <DropdownMenuItem onClick={logout} className="rounded-2xl h-12 md:h-14 gap-4 text-destructive focus:bg-destructive/5 cursor-pointer px-5 transition-all">
                  <LogOut className="h-5 w-5" />
                  <span className="font-black uppercase text-[10px] md:text-xs tracking-widest">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-white h-9 w-9 md:h-11 md:w-11 hover:bg-white/10 rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-x-0 top-[60px] md:top-[75px] bg-primary p-6 border-t border-white/10 shadow-2xl space-y-2 animate-in slide-in-from-top-4 duration-300 z-[50] max-h-[80vh] overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id as View)}
                        className={cn(
                            "w-full flex items-center gap-5 p-4 rounded-[1.5rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all",
                            currentView === item.id ? "bg-secondary text-primary shadow-lg scale-[1.02]" : "text-white/70 hover:bg-white/10"
                        )}
                    >
                        <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                        {item.label}
                    </button>
                ))}
            </div>
        )}
      </nav>

      <main className="relative flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-10 lg:p-12 animate-in fade-in duration-1000">
        <div className="relative z-10 w-full overflow-hidden">
          {renderView()}
        </div>
      </main>

      <footer className="relative z-10 p-8 md:p-12 bg-white/40 backdrop-blur-md border-t flex flex-col items-center gap-6 md:gap-8 mt-auto">
        <div className="flex items-center gap-4 md:gap-5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default group">
            <div className="relative w-8 h-8 md:w-10 md:h-10 group-hover:rotate-[360deg] transition-transform duration-1000">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain" />
            </div>
            <div className="flex flex-col items-start -space-y-1">
              <span className="font-black text-sm md:text-lg uppercase tracking-[0.4em] text-primary leading-tight">New Era University</span>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Institutional Management</span>
            </div>
        </div>
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground/30 text-center animate-pulse">
          &copy; {new Date().getFullYear()} INTEGRITY • EXCELLENCE • DISCIPLINE
        </p>
      </footer>
    </div>
  );
}