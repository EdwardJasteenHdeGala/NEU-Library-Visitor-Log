
"use client";

import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { LoginScreen } from "@/components/auth/login-screen";
import { VerifyStudentId } from "@/components/auth/verify-student-id";
import { UserGreeting } from "@/components/dashboard/user-greeting";
import { AdminPlaceholder } from "@/components/dashboard/admin-placeholder";
import { Loader2 } from "lucide-react";

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Authenticating with NEU servers...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!profile) {
    return <VerifyStudentId />;
  }

  if (profile.role === 'admin') {
    return <AdminPlaceholder />;
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
