"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, History, Settings, LogOut } from "lucide-react";

export function AdminPlaceholder() {
  const { logout, profile } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="bg-primary text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-bold font-headline">NEU Hub Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90 hidden sm:inline">Admin: {profile?.displayName}</span>
            <Button variant="secondary" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Visitors Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Waiting for entries</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Capacity: 150</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Stay</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0 mins</div>
              <p className="text-xs text-muted-foreground">No data available</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest visitor log entries</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center text-muted-foreground italic">
              No recent activity to display.
            </CardContent>
          </Card>
          
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>Settings & Maintenance</CardTitle>
              <CardDescription>System configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Button variant="outline" className="w-full justify-start gap-3">
                 <Settings className="h-4 w-4" /> Export Today's Log
               </Button>
               <Button variant="outline" className="w-full justify-start gap-3">
                 <Users className="h-4 w-4" /> Manage Access Roles
               </Button>
               <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">System Status</p>
                  <div className="flex gap-2 items-center text-xs text-green-600 bg-green-50 p-2 rounded">
                    <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                    All services online and syncing with Firestore
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}