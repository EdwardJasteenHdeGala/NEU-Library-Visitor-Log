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
  UserCircle,
  Library,
  HelpCircle,
  ShieldCheck,
  User,
  UserCog,
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

type View = 'dashboard' | 'visitor-log' | 'users' | 'reports' | 'feedback' | 'profile' | 'help';

export function DashboardLayout() {
  const { logout, profile, switchRole } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'visitor-log', label: 'Visitor Log', icon: Users },
    { id: 'users', label: 'User Mgmt', icon: UserCog },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'help', label: 'Help', icon: HelpCircle },
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
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col">
      <nav className="bg-primary text-white p-4 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1.5 rounded-xl shadow-lg">
                <Library className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col -space-y-1 hidden sm:flex">
                <h1 className="text-xl font-black tracking-tighter italic">NEU ADMIN</h1>
                <span className="text-[8px] font-black text-secondary uppercase tracking-[0.3em]">Institutional Control</span>
            </div>
          </div>

          <LiveClock className="hidden md:flex scale-90 lg:scale-100" />
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden lg:flex items-center gap-6">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id as View)}
                        className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-all hover:text-secondary flex items-center gap-1.5 group",
                            currentView === item.id ? "text-secondary border-b-2 border-secondary pb-1" : "text-white/70"
                        )}
                    >
                        <item.icon className={cn("h-3.5 w-3.5 group-hover:scale-110 transition-transform", currentView === item.id ? "text-secondary" : "text-white/50")} />
                        {item.label}
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:bg-white/10 p-1.5 pr-3 rounded-2xl transition-colors border border-transparent hover:border-white/10 group">
                      <Avatar className="h-9 w-9 border-2 border-secondary shadow-xl group-hover:scale-105 transition-transform">
                        <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                        <AvatarFallback className="bg-secondary text-primary font-black text-xs">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start hidden md:flex">
                        <span className="text-xs font-black uppercase tracking-tighter leading-none">{profile?.displayName}</span>
                        <span className="text-[9px] font-bold text-secondary/70 uppercase">Master Admin</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-none">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 py-3">Management</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCurrentView('profile')} className="rounded-xl h-12 gap-3 focus:bg-primary/5 cursor-pointer">
                      <Settings className="h-4 w-4 text-primary" />
                      <span className="font-bold">System Settings</span>
                    </DropdownMenuItem>
                    {profile?.isAuthorizedAdmin && (
                      <DropdownMenuItem onClick={() => switchRole(profile.role === 'admin' ? 'user' : 'admin')} className="rounded-xl h-12 gap-3 text-blue-600 focus:bg-blue-50 cursor-pointer">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="font-black">Switch to {profile.role === 'admin' ? 'User' : 'Admin'} Mode</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="rounded-xl h-12 gap-3 focus:bg-muted cursor-pointer">
                      <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold text-muted-foreground">Switch Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="rounded-xl h-12 gap-3 text-destructive focus:bg-destructive/5 cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      <span className="font-black uppercase text-xs tracking-widest">Terminate Session</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </Button>
            </div>
          </div>
        </div>
        
        {isMobileMenuOpen && (
            <div className="lg:hidden bg-primary/95 backdrop-blur-md absolute inset-x-0 top-full p-4 border-t border-white/10 shadow-2xl space-y-2 animate-in slide-in-from-top-4 duration-300">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setCurrentView(item.id as View);
                            setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all",
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

      <main className="flex-1 max-w-7xl mx-auto p-4 md:p-10 w-full animate-in fade-in duration-1000">
        {renderView()}
      </main>

      <footer className="p-10 bg-white border-t flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <Library className="h-5 w-5 text-primary" />
            <span className="font-black text-xs uppercase tracking-[0.3em] text-primary">New Era University Library System</span>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">&copy; {new Date().getFullYear()} INTEGRITY • EXCELLENCE • DISCIPLINE</p>
      </footer>
    </div>
  );
}
