"use client";

import { useState } from "react";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { WelcomeScreen } from "@/components/auth/welcome-screen";
import { LoginScreen } from "@/components/auth/login-screen";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { UserGreeting } from "@/components/dashboard/user-greeting";
import { GuestView } from "@/components/guest/guest-view";
import { VerifyStudentId } from "@/components/auth/verify-student-id";
import { Loader2 } from "lucide-react";

type AuthViewState = 'welcome' | 'login' | 'guest';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [viewState, setViewState] = useState<AuthViewState>('welcome');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Connecting to NEU Library Hub...</p>
      </div>
    );
  }

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

  // If a user is logged in but profile creation failed (extremely rare case), show a small loader
  if (!profile) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Setting up your profile...</p>
        </div>
      );
  }

  // MANDATORY SETUP: If ID is pending, force profile update
  if (profile.studentId === 'PENDING-ID' || profile.studentId === 'GUEST-ID') {
    return <VerifyStudentId />;
  }

  // Role-based conditional rendering
  if (profile.role === 'admin') {
    return <DashboardLayout />;
  }

  return <UserGreeting />;
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
