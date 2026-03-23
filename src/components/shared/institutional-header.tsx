'use client';

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LiveClock } from "@/components/ui/live-clock";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

import { ElementType } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: ElementType;
}

interface InstitutionalHeaderProps {
  mode: 'admin' | 'member';
  activeView?: string;
  onNavigate?: (id: string) => void;
  navItems?: NavItem[];
  showSidebarTrigger?: boolean;
}

export function InstitutionalHeader({ 
  mode, 
  activeView, 
  onNavigate, 
  navItems = [],
  showSidebarTrigger = false 
}: InstitutionalHeaderProps) {
  const { logout, profile, switchViewMode, updateProfileData, requestResignation } = useAuth();
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
  const userInitials = profile?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <header className="neu-header w-full border-b border-white/10 relative z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent shadow-glass" />
      
      <div className="max-w-[90rem] mx-auto flex justify-between items-center px-[clamp(1.5rem,5vw,3rem)] h-24 w-full gap-6 relative">
        
        {/* Left: Branding / Trigger */}
        <div className="flex items-center gap-[clamp(1rem,2vw,1.5rem)]">
          {showSidebarTrigger && (
            <SidebarTrigger className="text-white hover:bg-white/10 shrink-0 h-10 w-10 rounded-xl transition-all hover:scale-110 active:scale-90" />
          )}
          <div 
            className="flex items-center gap-[1rem] cursor-pointer group"
            onClick={() => onNavigate?.(mode === 'admin' ? 'dashboard' : 'log-entry')}
          >
            <div className="bg-white p-1 rounded-2xl w-10 h-10 md:w-12 md:h-12 relative overflow-hidden flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-premium-sm ring-2 ring-white/10">
              <Image src={logoImage?.imageUrl || ""} alt="NEU" fill className="object-contain p-2 transition-transform duration-700 group-hover:scale-105" sizes="48px" />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-[0.9rem] md:text-[1.1rem] font-black tracking-tighter text-white uppercase italic drop-shadow-premium">
                {mode === 'admin' ? 'Institutional' : 'Access'} <span className="text-secondary">Hub</span>
              </h1>
              <span className="text-[0.55rem] md:text-[0.625rem] font-black text-secondary/70 uppercase tracking-[0.4em] drop-shadow-glow">
                Protocol Matrix
              </span>
            </div>
          </div>
        </div>

        {/* Center: Nav (Member) / Clock (Admin) */}
        <div className="hidden lg:flex flex-1 justify-center px-6">
          {mode === 'member' && navItems.length > 0 ? (
            <nav className="flex items-center gap-2 bg-white/5 p-2 rounded-[1.5rem] backdrop-blur-2xl border border-white/10 shadow-glass-premium">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className={cn(
                    "px-6 py-2.5 text-[0.7rem] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 rounded-xl relative group/item",
                    activeView === item.id
                      ? "bg-white/15 text-white shadow-premium-sm ring-1 ring-white/20"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", activeView === item.id ? "text-secondary animate-pulse-subtle" : "opacity-60 group-hover/item:text-secondary transition-colors")} />
                  {item.label}
                  {activeView === item.id && (
                    <div className="absolute -bottom-1 inset-x-4 h-0.5 bg-secondary rounded-full shadow-glow-secondary" />
                  )}
                </button>
              ))}
            </nav>
          ) : null}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-[clamp(1rem,2vw,2rem)] shrink-0">
          <LiveClock 
            className="bg-white/5 border border-white/10 text-white shadow-inner h-12 px-6 hidden sm:flex rounded-2xl font-black tracking-[0.2em] text-[0.7rem] uppercase italic backdrop-blur-md hover:bg-white/10 transition-colors" 
            showSelector={true} 
            value={profile?.timezone}
            onValueChange={(tz) => updateProfileData({ timezone: tz })}
          />
          <ThemeToggle />
          
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10 relative h-12 w-12 rounded-2xl transition-all duration-500 group"
                  onClick={() => onNavigate?.('notifications')}
                >
                  <Bell className="h-[1.5rem] w-[1.5rem] group-hover:rotate-12 transition-transform" />
                  <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-secondary rounded-full animate-pulse border-2 border-primary shadow-glow-secondary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-black text-[10px] uppercase tracking-widest bg-white text-primary rounded-xl px-4 py-2 shadow-premium">
                System Alerts
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => switchViewMode(mode === 'admin' ? 'member' : 'admin')}
              className="h-12 px-6 gap-3 font-black text-[0.7rem] uppercase rounded-2xl hidden sm:flex shadow-premium-secondary hover:scale-[1.05] transition-all duration-500 text-primary bg-secondary border-none ring-1 ring-secondary/50 hover:shadow-glow-secondary active:scale-95"
            >
              <ShieldCheck className="h-5 w-5" />
              {mode === 'admin' ? 'Identity Hub' : 'Console Root'}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                aria-label="User profile settings and session management"
                className="flex items-center gap-4 hover:bg-white/5 p-2 rounded-2xl transition-all group/actor border border-transparent hover:border-white/10 hover:shadow-glass"
              >
                <Avatar className="h-10 w-10 border-2 border-white/20 group-hover/actor:border-secondary/50 transition-all duration-700 shadow-premium-sm group-hover/actor:scale-110">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-secondary text-primary font-black text-sm italic">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start hidden sm:flex leading-none gap-1">
                  <span className="text-[0.65rem] font-black uppercase tracking-tight text-white group-hover/actor:text-secondary transition-colors">
                    {profile?.displayName?.split(' ')[0]}
                  </span>
                  <span className="text-[0.45rem] font-black text-secondary/60 uppercase tracking-[0.3em] italic">
                    {mode === 'admin' ? 'SYS_ROOT' : 'MEM_ID'}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[14rem] mt-2 rounded-2xl shadow-2xl bg-card border-none p-2 p-y-3">
              <DropdownMenuLabel className="text-[0.625rem] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">
                Identity Profile
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onNavigate?.('profile')}
                className="gap-3 cursor-pointer font-bold text-[0.75rem] h-10 rounded-xl hover:bg-primary/5"
              >
                <Settings className="h-4 w-4 text-primary/60" />
                Identity Settings
              </DropdownMenuItem>

              {profile?.role === 'admin' && !profile.resignationStatus && (
                <DropdownMenuItem 
                  onClick={() => {
                    const reason = window.prompt("Please state the reason for resignation:");
                    if (reason) requestResignation(reason);
                  }}
                  className="gap-3 text-amber-600 cursor-pointer font-bold text-[0.75rem] h-10 rounded-xl hover:bg-amber-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Request Resignation
                </DropdownMenuItem>
              )}

              {profile?.resignationStatus === 'pending' && (
                <DropdownMenuLabel className="text-[0.625rem] font-black uppercase text-amber-500 px-3 py-1 italic animate-pulse">
                  Resignation Pending...
                </DropdownMenuLabel>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="gap-3 text-destructive cursor-pointer font-bold text-[0.75rem] h-10 rounded-xl hover:bg-destructive/5"
              >
                <LogOut className="h-4 w-4" />
                Sign Out of Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
