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
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="neu-header">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 w-full">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded shadow-sm w-9 h-9 relative overflow-hidden flex items-center justify-center border border-white/20">
              <Image 
                src={logoImage?.imageUrl || ""} 
                alt="NEU Logo" 
                fill 
                priority
                className="object-contain p-1"
              />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">NEU Access Hub</h1>
              <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">Administrator Portal</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as View)}
                className={cn(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 rounded-lg",
                  currentView === item.id 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-white/60 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <LiveClock className="hidden xl:flex bg-white/5 border-white/10 text-white h-9 !py-0 !px-4 rounded-lg scale-90" showSelector={false} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-white/10 p-1.5 rounded-full transition-all group">
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                    <AvatarFallback className="bg-secondary text-primary font-bold text-[10px]">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start hidden xs:flex text-left text-white leading-none">
                    <span className="text-[10px] font-bold uppercase tracking-tight">{profile?.displayName?.split(' ')[0]}</span>
                    <span className="text-[7px] font-bold text-secondary uppercase tracking-widest opacity-80">Admin</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Console</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavClick('profile')} className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                {profile?.isAuthorizedAdmin && (
                  <DropdownMenuItem onClick={() => switchRole(profile.role === 'admin' ? 'user' : 'admin')} className="gap-2 cursor-pointer">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Switch Mode</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-white hover:bg-white/10 h-10 w-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        {renderView()}
      </main>

      <footer className="p-10 bg-white border-t flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 opacity-50">
          <Image 
            src={logoImage?.imageUrl || ""} 
            alt="NEU" 
            width={32} 
            height={32} 
            className="object-contain" 
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-xs uppercase tracking-tight text-primary">New Era University</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Institutional Hub</span>
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          &copy; {new Date().getFullYear()} INTEGRITY • EXCELLENCE • DISCIPLINE
        </p>
      </footer>
    </div>
  );
}