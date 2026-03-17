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

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col overflow-x-hidden">
      <nav className="bg-primary text-white p-4 shadow-xl sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1.5 rounded-xl shadow-lg w-10 h-10 relative overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                <Image 
                  src={logoImage?.imageUrl || "https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg"} 
                  alt="NEU Logo" 
                  fill 
                  className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                />
            </div>
            <div className="flex flex-col -space-y-1 hidden sm:flex">
                <h1 className="text-xl font-black tracking-tighter italic uppercase leading-tight">NEU HUB</h1>
                <span className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] opacity-90">Institutional Admin</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 p-1.5 bg-white/10 rounded-2xl border border-white/10">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as View)}
                    className={cn(
                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 rounded-xl",
                        currentView === item.id 
                          ? "bg-secondary text-primary shadow-lg" 
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <item.icon className={cn("h-3.5 w-3.5", currentView === item.id ? "text-primary" : "text-white/40")} />
                    {item.label}
                </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <LiveClock className="hidden xl:flex bg-white/5 border-white/10 text-white !py-1 !px-4" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-white/10 p-1.5 pr-4 rounded-2xl transition-all border border-transparent hover:border-white/10 group">
                  <Avatar className="h-10 w-10 border-2 border-secondary/50 shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                    <AvatarFallback className="bg-secondary text-primary font-black text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-xs font-black uppercase tracking-tight leading-none max-w-[120px] truncate">{profile?.displayName?.split(' ')[0]}</span>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-widest opacity-80 italic">Administrator</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-3xl p-3 shadow-2xl border-none mt-2">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 py-3">Management</DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-2" />
                <DropdownMenuItem onClick={() => setCurrentView('profile')} className="rounded-2xl h-12 gap-3 focus:bg-primary/5 cursor-pointer px-4">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="font-bold">System Settings</span>
                </DropdownMenuItem>
                {profile?.isAuthorizedAdmin && (
                  <DropdownMenuItem onClick={() => switchRole(profile.role === 'admin' ? 'user' : 'admin')} className="rounded-2xl h-12 gap-3 text-blue-600 focus:bg-blue-50 cursor-pointer px-4">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-black">Switch to {profile.role === 'admin' ? 'user' : 'admin'} Mode</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="mx-2" />
                <DropdownMenuItem onClick={logout} className="rounded-2xl h-12 gap-3 focus:bg-muted cursor-pointer px-4">
                  <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-muted-foreground">Switch Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="rounded-2xl h-12 gap-3 text-destructive focus:bg-destructive/5 cursor-pointer px-4">
                  <LogOut className="h-4 w-4" />
                  <span className="font-black uppercase text-xs tracking-widest">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-white h-10 w-10 hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
            <div className="lg:hidden bg-primary/95 backdrop-blur-xl absolute inset-x-0 top-full p-4 border-t border-white/10 shadow-2xl space-y-2 animate-in slide-in-from-top-4 duration-300">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setCurrentView(item.id as View);
                            setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                            currentView === item.id ? "bg-secondary text-primary shadow-lg" : "text-white/70 hover:bg-white/10"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </button>
                ))}
            </div>
        )}
      </nav>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-10 animate-in fade-in duration-700">
        <div className="w-full">
          {renderView()}
        </div>
      </main>

      <footer className="p-10 bg-white border-t flex flex-col items-center gap-6 mt-auto">
        <div className="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default group">
            <div className="relative w-8 h-8 group-hover:rotate-[360deg] transition-transform duration-700">
                <Image src={logoImage?.imageUrl || "https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg"} alt="NEU" fill className="object-contain" />
            </div>
            <div className="flex flex-col items-start -space-y-1">
              <span className="font-black text-sm uppercase tracking-[0.3em] text-primary">New Era University</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Institutional Access Management</span>
            </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 text-center">
          &copy; {new Date().getFullYear()} INTEGRITY • EXCELLENCE • DISCIPLINE
        </p>
      </footer>
    </div>
  );
}