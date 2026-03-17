
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Shield, Lock, ShieldAlert, ShieldCheck, RefreshCcw, LogOut, Camera } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileView() {
  const { profile, switchRole, logout } = useAuth();

  const userInitials = profile?.displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ST';

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
            <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
            <AvatarFallback className="bg-secondary text-primary font-black text-4xl">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white">
            <Camera className="h-4 w-4" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-primary mb-1">{profile?.displayName}</h2>
          <p className="text-muted-foreground font-medium">Manage your NEU Hub identity and access.</p>
        </div>
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
                      <Label className="text-muted-foreground text-[10px] font-black uppercase">Email:</Label>
                      <span className="font-bold text-primary text-sm">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground text-[10px] font-black uppercase">Student ID:</Label>
                      <span className="font-bold text-primary text-sm">{profile?.studentId}</span>
                  </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-secondary uppercase tracking-widest text-[10px] px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                  {profile?.role} Access
                </span>
              </div>
            </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Display Name</Label>
              <Input defaultValue={profile?.displayName} className="h-12 bg-muted/20 border-muted" readOnly />
              <p className="text-[10px] text-muted-foreground italic">Profile information is synchronized from your institutional Google account.</p>
            </div>
            
            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground flex items-center gap-1 font-bold">
                        <Shield className="h-3 w-3" /> Institutional Verification
                    </span>
                </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-xl space-y-2">
               <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-primary uppercase">College / Dept</span>
                 <span className="text-xs font-black text-secondary">{profile?.college || 'N/A'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-primary uppercase">Profile Status</span>
                 <span className="text-xs font-black text-green-600">VERIFIED</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-xl neu-card-shadow">
              Sync Google Profile
            </Button>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
                <Button variant="outline" onClick={logout} className="h-12 gap-2 font-bold uppercase text-xs">
                    <RefreshCcw className="h-4 w-4" />
                    Switch Account
                </Button>
                <Button variant="destructive" onClick={logout} className="h-12 gap-2 font-bold uppercase text-xs">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
          </div>
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
