"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  History, 
  Settings, 
  LogOut, 
  MessageSquare, 
  FileText,
  UserCircle,
  Library,
  ChevronRight
} from "lucide-react";
import { AdminOverview } from "./admin-overview";
import { VisitorLog } from "./visitor-log";
import { ReportsView } from "./reports-view";
import { FeedbackView } from "./feedback-view";
import { ProfileView } from "./profile-view";
import { cn } from "@/lib/utils";

type View = 'dashboard' | 'visitor-log' | 'reports' | 'feedback' | 'profile' | 'settings';

export function DashboardLayout() {
  const { logout, profile } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'visitor-log', label: 'Visitor Log', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <AdminOverview />;
      case 'visitor-log': return <VisitorLog />;
      case 'reports': return <ReportsView />;
      case 'feedback': return <FeedbackView />;
      case 'profile': return <ProfileView />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <nav className="bg-primary text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-md">
                <Library className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block">NEU Library Visitor Log</h1>
            <h1 className="text-xl font-black tracking-tight sm:hidden">NEU Hub</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id as View)}
                        className={cn(
                            "text-sm font-bold transition-all hover:text-secondary",
                            currentView === item.id ? "text-secondary border-b-2 border-secondary pb-1" : "text-white/80"
                        )}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setCurrentView('profile')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <UserCircle className="h-6 w-6 text-secondary" />
                    <span className="text-sm font-bold hidden md:inline">{profile?.displayName}</span>
                </button>
                <Button variant="secondary" size="sm" onClick={logout} className="h-8 font-bold text-xs gap-1">
                    <LogOut className="h-3 w-3" />
                    Logout
                </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto p-4 md:p-8 w-full">
        {renderView()}
      </main>

      <footer className="p-6 text-center text-muted-foreground text-xs border-t">
        <p>&copy; {new Date().getFullYear()} New Era University Library System. All rights reserved.</p>
      </footer>
    </div>
  );
}