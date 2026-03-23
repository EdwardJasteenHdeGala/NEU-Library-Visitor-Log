"use client";

import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { cn } from "@/lib/utils";
import { AIAssistant } from "./ai-assistant";
import { CommandPalette } from "./command-palette";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Menu } from "lucide-react";

interface UnifiedLayoutProps {
  children: React.ReactNode;
  mode: 'admin' | 'member';
  activeView?: string;
  onNavigate?: (id: string) => void;
  onBack?: () => void;
  showBack?: boolean;
  hideSidebar?: boolean;
}

export function UnifiedLayout({ 
  children, 
  mode, 
  activeView, 
  onNavigate,
  onBack,
  showBack,
  hideSidebar
}: UnifiedLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      {!hideSidebar && <AppSidebar mode={mode} activeView={activeView} onNavigate={onNavigate} onBack={onBack} />}
      <SidebarInset className="relative flex min-h-svh flex-col bg-background selection:bg-primary/10 transition-all duration-300">
        {/* Global Controls Overlay */}
        <div className="fixed top-8 left-8 z-[110] flex items-center gap-4">
          {(showBack || (activeView && activeView !== 'dashboard')) && (
            <Button
              variant="ghost"
              onClick={onBack || (() => onNavigate?.('dashboard'))}
              className="h-14 px-6 rounded-2xl bg-card/40 backdrop-blur-3xl border border-white/10 shadow-premium hover:bg-card/60 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] text-primary group/back"
            >
              <ChevronLeft className="h-5 w-5 text-secondary group-hover/back:-translate-x-1 transition-transform" />
              Return
            </Button>
          )}
        </div>

        {/* Abstract Institutional Background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] rotate-12 pointer-events-none" />
        <div className="absolute top-[10%] right-[10%] w-[40rem] h-[40rem] bg-primary/5 blur-[120px] rounded-full animate-pulse-subtle pointer-events-none" />
        <div className="absolute bottom-[10%] left-[10%] w-[40rem] h-[40rem] bg-secondary/5 blur-[120px] rounded-full animate-float pointer-events-none" />

        {/* Central Content Card Container */}
        <div className="w-full max-w-[90rem] relative z-10 py-12 flex justify-center items-start">
          <div className="flex-1 w-full relative z-10 transition-all duration-700 ease-premium">
            <div className="w-full bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-premium p-[clamp(1.5rem,5vw,4rem)] relative overflow-hidden group/layout-card">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
      <AIAssistant />
      <CommandPalette />
    </SidebarProvider>
  );
}
