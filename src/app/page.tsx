
"use client";

import { useState } from "react";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { WelcomeScreen } from "@/components/auth/welcome-screen";
import { LoginScreen } from "@/components/auth/login-screen";
import { VerifyStudentId } from "@/components/auth/verify-student-id";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { UserGreeting } from "@/components/dashboard/user-greeting";
import { Loader2 } from "lucide-react";

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Connecting to NEU Library Hub...</p>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return <LoginScreen onBack={() => setShowLogin(false)} />;
    }
    return <WelcomeScreen onLogin={() => setShowLogin(true)} />;
  }

  if (!profile) {
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
