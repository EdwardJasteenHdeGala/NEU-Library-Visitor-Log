"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { profile, updateProfileData } = useAuth();

  const setTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    // 1. Update the DOM class immediately for instant feedback
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isSystemDark);
    }

    // 2. Persist for Guests/Visitors
    localStorage.setItem('institutional-theme', newTheme);

    // 3. Persist for Institutional Members
    if (profile) {
      await updateProfileData({ theme: newTheme });
    }
  };

  const currentTheme = profile?.theme || 'light';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full text-white hover:bg-white/10 transition-all border border-white/10"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl border-none shadow-3xl bg-card">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-3 font-bold text-[0.75rem] uppercase tracking-widest cursor-pointer hover:bg-primary/5">
          <Sun className="h-4 w-4 text-amber-500" /> Light Mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-3 font-bold text-[0.75rem] uppercase tracking-widest cursor-pointer hover:bg-primary/5">
          <Moon className="h-4 w-4 text-indigo-400" /> Dark Mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-3 font-bold text-[0.75rem] uppercase tracking-widest cursor-pointer hover:bg-primary/5">
          <Monitor className="h-4 w-4 text-emerald-500" /> System Sync
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
