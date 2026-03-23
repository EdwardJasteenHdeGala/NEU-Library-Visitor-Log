"use client";

import { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { WelcomeScreen } from "@/components/features/auth/welcome-screen";
import { LoginScreen } from "@/components/features/auth/login-screen";
import { BlockedScreen } from "@/components/features/auth/blocked-screen";
import { DashboardLayout } from "@/components/features/dashboard/dashboard-layout";
import { GuestView } from "@/components/features/guest/guest-view";
import { VerifyStudentId } from "@/components/features/auth/verify-student-id";

import { InstitutionalHub } from "@/components/features/dashboard/institutional-hub";
import { Loader2 } from "lucide-react";
import { OnboardingTutorial } from "@/components/features/onboarding/onboarding-tutorial";
import { UnifiedLayout } from "@/components/shared/unified-layout";

type AuthViewState = 'welcome' | 'login' | 'guest';

function ThemeWatcher() {
  const { profile } = useAuth();

  useEffect(() => {
    // 1. Prioritize authenticated profile theme
    if (profile?.theme) {
      if (profile.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('institutional-theme', profile.theme);
      return;
    }

    // 2. Fallback to localStorage for Guests/Visitors
    const localTheme = localStorage.getItem('institutional-theme');
    if (localTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (localTheme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, [profile?.theme]);

  return null;
}

function AppContent() {
  const { user, profile, viewMode, loading, logout } = useAuth();
  const [viewState, setViewState] = useState<AuthViewState>('welcome');
  const [loginTab, setLoginTab] = useState<'member' | 'guest'>('member');

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
      return (
        <UnifiedLayout mode="member" onBack={() => setViewState('welcome')} showBack hideSidebar={true}>
          <LoginScreen onBack={() => setViewState('welcome')} initialTab={loginTab} />
        </UnifiedLayout>
      );
    }
    if (viewState === 'guest') {
      return (
        <UnifiedLayout mode="member" onBack={() => setViewState('welcome')} showBack hideSidebar={true}>
          <GuestView 
              onBack={() => setViewState('welcome')} 
              onLogin={() => setViewState('login')} 
          />
        </UnifiedLayout>
      );
    }
    return (
      <UnifiedLayout mode="member" hideSidebar={true}>
        <WelcomeScreen 
            onLogin={() => { setLoginTab('member'); setViewState('login'); }} 
            onGuest={() => { setViewState('guest'); }} 
        />
      </UnifiedLayout>
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
  if (profile.profileCompleted === false) {
    return <VerifyStudentId />;
  }

  // 5. Authorized Portal Routing
  return (
    <>
      {profile.tutorialCompleted !== true && <OnboardingTutorial />}
      {viewMode === 'admin' ? <DashboardLayout /> : <InstitutionalHub />}
    </>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <ThemeWatcher />
      <AppContent />
    </AuthProvider>
  );
}
