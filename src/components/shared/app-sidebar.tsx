"use client";

import * as React from "react";
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
  BookOpen,
  RotateCcw,
  Clock,
  ChevronRight,
  History,
  X,
  UserCheck,
  UserPlus
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

interface AppSidebarProps {
  mode: 'admin' | 'member';
  activeView?: string;
  onNavigate?: (id: string) => void;
  onBack?: () => void;
}

export function AppSidebar({ mode, activeView, onNavigate, onBack }: AppSidebarProps) {
  const { profile, logout, switchViewMode } = useAuth();
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
  const { setOpen } = useSidebar();

  const isAdmin = profile?.role === 'superadmin' || profile?.isAuthorizedAdmin;

  const adminItems: NavItem[] = [
    { id: 'dashboard', label: 'Console Hub', icon: LayoutDashboard },
    { id: 'library', label: 'Catalog Root', icon: BookOpen },
    { id: 'circulation', label: 'Circulation', icon: RotateCcw, adminOnly: true },
    { id: 'visitor-log', label: 'Registry', icon: Users, adminOnly: true },
    { id: 'users', label: 'Members List', icon: UserCheck, superAdminOnly: true },
    { id: 'staff', label: 'Staff Registry', icon: UserCog, superAdminOnly: true },
    { id: 'reports', label: 'Intelligence', icon: FileText, adminOnly: true },
    { id: 'feedback', label: 'Sentiments', icon: MessageSquare, adminOnly: true },
    { id: 'audit', label: 'Audit Log', icon: History, adminOnly: true },
    { id: 'diagnostics', label: 'Diagnostics', icon: ShieldAlert, adminOnly: true },
    { id: 'notifications', label: 'Alert Stream', icon: Bell },
    { id: 'help', label: 'Directives', icon: HelpCircle },
    { id: 'settings', label: 'Telemetry', icon: Settings, adminOnly: true },
  ];

  const memberItems: NavItem[] = [
    { id: 'dashboard', label: 'Access Hub', icon: LayoutDashboard },
    { id: 'library', label: 'Knowledge', icon: BookOpen },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'feedback', label: 'Sentiments', icon: MessageSquare },
    { id: 'help', label: 'Support', icon: HelpCircle },
    { id: 'profile', label: 'Identity', icon: Settings },
  ];

  const navItems = mode === 'admin' ? adminItems : memberItems;

  return (
    <Sidebar variant="sidebar" className="border-r border-white/10 bg-[#032e41]/95 backdrop-blur-3xl w-[clamp(16rem,20vw,20rem)] transition-all overflow-hidden shadow-premium z-[200]">
      <SidebarHeader className="p-6 border-b border-white/5 relative shrink-0 flex-col gap-0">
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Close sidebar"
          className="absolute top-4 right-4 text-white/40 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 transition-colors z-[210]"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4 group cursor-pointer transition-all hover:scale-105 mt-2">
          <div className="bg-white p-2 rounded-2xl w-12 h-12 relative overflow-hidden flex items-center justify-center border border-white/10 shadow-premium-sm group-hover:rotate-6 transition-transform shrink-0">
            <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain p-1.5" sizes="48px" />
          </div>
          <div className="flex flex-col leading-tight overflow-hidden">
            <h1 className="text-lg font-black tracking-tighter text-white uppercase italic truncate">NEU Access Hub</h1>
            <span className="text-[9px] font-black text-secondary uppercase tracking-[0.4em] opacity-80 mt-1">Matrix OS v3</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <SidebarMenu className="gap-2">
          {navItems.filter(item => {
             if (item.superAdminOnly) return profile?.role === 'superadmin';
             if (item.adminOnly) return profile?.isAuthorizedAdmin;
             return true;
          }).map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                onClick={() => {
                  onNavigate?.(item.id);
                  setOpen(false); // Auto close on mobile
                }}
                isActive={activeView === item.id}
                className={cn(
                  "w-full h-14 px-5 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest transition-all flex items-center group/nav border-b-4",
                  activeView === item.id 
                    ? "bg-secondary text-primary shadow-premium-secondary scale-[1.02] border-black/10" 
                    : "text-white/60 hover:bg-white/5 hover:text-white border-transparent"
                )}
              >
                <item.icon className={cn("h-5 w-5 mr-4 shrink-0", activeView === item.id ? "text-primary animate-pulse-subtle" : "text-secondary/40 group-hover/nav:text-secondary transition-colors")} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {activeView === item.id && <ChevronRight className="h-4 w-4 opacity-50 shrink-0" />}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="pt-6 border-t border-white/5 space-y-3 shrink-0">
          {isAdmin && (
            <Button 
              variant="ghost" 
              onClick={() => switchViewMode(mode === 'admin' ? 'member' : 'admin')}
              className="w-full h-14 justify-start gap-3 px-5 rounded-2xl font-black text-[0.65rem] uppercase tracking-[0.3em] text-secondary hover:bg-secondary/10 transition-all group/mode"
            >
              <ShieldCheck className="h-5 w-5 shrink-0 group-hover/mode:rotate-12 transition-transform" />
              <span className="truncate">{mode === 'admin' ? 'Member View' : 'Admin Console'}</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            onClick={logout} 
            className="w-full h-14 justify-start gap-3 px-5 rounded-2xl font-black text-[0.65rem] uppercase tracking-[0.3em] text-destructive hover:bg-destructive/10 transition-all group/exit"
          >
            <LogOut className="h-5 w-5 shrink-0 group-hover/exit:translate-x-1 transition-transform" />
            Terminate
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
