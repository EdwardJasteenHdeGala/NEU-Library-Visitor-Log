"use client";

import { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { WelcomeScreen } from "@/components/auth/welcome-screen";
import { LoginScreen } from "@/components/auth/login-screen";
import { BlockedScreen } from "@/components/auth/blocked-screen";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { UserGreeting } from "@/components/dashboard/user-greeting";
import { GuestView } from "@/components/guest/guest-view";
import { VerifyStudentId } from "@/components/auth/verify-student-id";
import { Loader2 } from "lucide-react";

type AuthViewState = 'welcome' | 'login' | 'guest';

function ThemeWatcher() {
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.theme) return;
    
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile?.theme]);

  return null;
}

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [viewState, setViewState] = useState<AuthViewState>('welcome');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Synchronizing Identity Hub...</p>
      </div>
    );
  }

  // 1. Unauthenticated Gateway
  if (!user) {
    if (viewState === 'login') {
      return <LoginScreen onBack={() => setViewState('welcome')} />;
    }
    if (viewState === 'guest') {
      return (
        <GuestView 
            onBack={() => setViewState('welcome')} 
            onLogin={() => setViewState('login')} 
        />
      );
    }
    return (
        <WelcomeScreen 
            onLogin={() => setViewState('login')} 
            onGuest={() => setViewState('guest')} 
        />
    );
  }

  // 2. Profile Loading Guard
  if (!profile) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Configuring institutional profile...</p>
        </div>
      );
  }

  // 3. Global Security Suspension Check
  if (profile.isBlocked) {
    return <BlockedScreen />;
  }

  // 4. FIRST-TIME ONBOARDING FLOW
  // Users with 'PENDING-ID' must provide their student/staff details before continuing.
  if (profile.studentId === 'PENDING-ID') {
    return <VerifyStudentId />;
  }

  // 5. Authorized Portal Routing
  if (profile.role === 'admin') {
    return <DashboardLayout />;
  }

  return <UserGreeting />;
}

export default function Home() {
  return (
    <AuthProvider>
      <ThemeWatcher />
      <AppContent />
    </AuthProvider>
  );
}
