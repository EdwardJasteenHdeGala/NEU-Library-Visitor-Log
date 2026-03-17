
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Shield, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ProfileView() {
  const { profile, switchRole } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-primary mb-2">Account Settings</h2>
        <p className="text-muted-foreground font-medium">Manage your profile, security, and access roles.</p>
      </div>

      {profile?.isAuthorizedAdmin && (
        <Card className="neu-card-shadow border-2 border-accent/20 bg-accent/5 overflow-hidden">
          <div className="bg-accent p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-black text-sm uppercase tracking-widest">Admin Authorization</span>
            </div>
            <ShieldCheck className="h-5 w-5 opacity-50" />
          </div>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-bold text-primary">Toggle Admin Privileges</p>
              <p className="text-xs text-muted-foreground">You are authorized to switch between User and Admin roles.</p>
            </div>
            <div className="flex items-center gap-3">
               <span className={profile.role === 'user' ? 'text-primary font-bold' : 'text-muted-foreground'}>User</span>
               <Switch 
                checked={profile.role === 'admin'} 
                onCheckedChange={(checked) => switchRole(checked ? 'admin' : 'user')}
              />
               <span className={profile.role === 'admin' ? 'text-primary font-bold' : 'text-muted-foreground'}>Admin</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="neu-card-shadow border-none">
        <CardHeader className="bg-muted/30 border-b p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                  <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground">Email:</Label>
                      <span className="font-bold text-primary">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground">Student ID:</Label>
                      <span className="font-bold text-primary">{profile?.studentId}</span>
                  </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-secondary uppercase tracking-widest text-[10px] px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                  Current Role: {profile?.role}
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
                        <Lock className="h-3 w-3" /> Security
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
            Update Profile
          </Button>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center gap-8 opacity-40">
        <div className="flex flex-col items-center gap-1">
            <Shield className="h-5 w-5" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Secure Access</p>
        </div>
        <div className="flex flex-col items-center gap-1">
            <User className="h-5 w-5" />
            <p className="text-[10px] font-bold uppercase tracking-widest">NEU Verified</p>
        </div>
      </div>
    </div>
  );
}
