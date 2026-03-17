"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Shield, Lock } from "lucide-react";

export function ProfileView() {
  const { profile } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-primary mb-2">My Profile</h2>
        <p className="text-muted-foreground font-medium">Manage your personal information and security.</p>
      </div>

      <Card className="neu-card-shadow border-none">
        <CardHeader className="bg-muted/30 border-b p-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Email:</Label>
                    <span className="font-bold text-primary">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Role:</Label>
                    <span className="font-bold text-secondary uppercase tracking-widest text-xs px-2 py-0.5 bg-secondary/10 rounded-full border border-secondary/20">
                        {profile?.role}
                    </span>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Full Name</Label>
              <Input defaultValue={profile?.displayName} className="h-12 bg-muted/20 border-muted" />
            </div>
            
            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground flex items-center gap-1 font-bold">
                        <Lock className="h-3 w-3" /> Change Password
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-muted-foreground uppercase text-xs tracking-wider">New Password</Label>
                <Input type="password" placeholder="••••••••" className="h-12 bg-muted/20 border-muted" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Confirm Password</Label>
                <Input type="password" placeholder="••••••••" className="h-12 bg-muted/20 border-muted" />
              </div>
            </div>
          </div>

          <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-xl neu-card-shadow">
            Save Changes
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-4 opacity-50">
        <div className="p-4 border border-dashed rounded-lg flex flex-col items-center gap-2 text-center">
            <Shield className="h-6 w-6" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Privacy Protected</p>
        </div>
        <div className="p-4 border border-dashed rounded-lg flex flex-col items-center gap-2 text-center">
            <User className="h-6 w-6" />
            <p className="text-[10px] font-bold uppercase tracking-widest">NEU Verified</p>
        </div>
      </div>
    </div>
  );
}