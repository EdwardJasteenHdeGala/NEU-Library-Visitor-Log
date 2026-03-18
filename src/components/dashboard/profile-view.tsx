
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Shield, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCcw, 
  LogOut, 
  Camera, 
  Save, 
  Loader2,
  ShieldOff,
  AlertTriangle,
  IdCard,
  ArrowLeft
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfileViewProps {
  onBack?: () => void;
}

export function ProfileView({ onBack }: ProfileViewProps) {
  const { profile, switchRole, logout, updateProfileData, resignAdmin } = useAuth();
  const { toast } = useToast();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    studentId: profile?.studentId || "",
    college: profile?.college || "",
  });

  const userInitials = profile?.displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ST';

  const handleSave = async () => {
    setIsUpdating(true);
    const success = await updateProfileData(formData);
    setIsUpdating(false);
    
    if (success) {
      toast({
        title: "Profile Synchronized",
        description: "Institutional identity updated.",
      });
    }
  };

  const handleResign = async () => {
    await resignAdmin();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {onBack && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2 -ml-2 text-primary/50 hover:text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-[0.2em] gap-2 rounded-xl h-8 px-4"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Hub
        </Button>
      )}

      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <Avatar className="h-40 w-40 md:h-48 md:w-48 border-[6px] border-white shadow-3xl ring-8 ring-primary/5">
            <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
            <AvatarFallback className="bg-secondary text-primary font-black text-5xl md:text-6xl italic">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-2 right-2 bg-primary text-white p-3 rounded-[1.25rem] shadow-2xl border-4 border-white cursor-pointer hover:scale-110 transition-transform">
            <Camera className="h-5 w-5" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl md:text-5xl font-black text-primary italic tracking-tighter uppercase leading-none">{profile?.displayName}</h2>
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em] opacity-60">Identity Management Console</p>
        </div>
      </div>

      {profile?.isAuthorizedAdmin && (
        <Card className="neu-card-shadow border-none rounded-[2rem] bg-accent/5 overflow-hidden shadow-xl ring-1 ring-accent/20">
          <div className="bg-accent p-6 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <ShieldAlert className="h-6 w-6" />
              <span className="font-black text-sm uppercase tracking-[0.3em] italic">Administrator Protocol</span>
            </div>
            <ShieldCheck className="h-6 w-6 opacity-40" />
          </div>
          <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-black text-primary uppercase text-sm tracking-tight">Active Duty Override</p>
              <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed">Toggle administrative privileges for this session.</p>
            </div>
            <div className="flex items-center gap-5 p-3 bg-white/50 rounded-2xl border shadow-inner">
               <span className={cn("text-[10px] font-black uppercase tracking-widest transition-all", profile.role === 'user' ? 'text-primary opacity-100' : 'text-muted-foreground opacity-40')}>User</span>
               <Switch 
                checked={profile.role === 'admin'} 
                onCheckedChange={(checked) => switchRole(checked ? 'admin' : 'user')}
                className="scale-125"
              />
               <span className={cn("text-[10px] font-black uppercase tracking-widest transition-all", profile.role === 'admin' ? 'text-primary opacity-100' : 'text-muted-foreground opacity-40')}>Admin</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="neu-card-shadow border-none rounded-[2.5rem] bg-white shadow-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b p-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-3">
                  <div className="flex items-center gap-4">
                      <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">Verified Identity:</Label>
                      <span className="font-black text-primary text-sm italic tracking-tight">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-4">
                      <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">Security Level:</Label>
                      <span className="font-black text-green-600 text-[10px] uppercase tracking-[0.3em] bg-green-50 px-4 py-1.5 rounded-full border border-green-100 shadow-sm">NEU-SECURED</span>
                  </div>
              </div>
              <div className="text-right">
                <span className="font-black text-primary uppercase tracking-[0.4em] text-[10px] px-6 py-3 bg-secondary rounded-2xl shadow-xl italic border border-primary/10">
                  {profile?.role} ACCESS
                </span>
              </div>
            </div>
        </CardHeader>
        <CardContent className="p-10 md:p-14 space-y-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="font-black text-muted-foreground uppercase text-[10px] tracking-[0.4em] ml-3 opacity-60">Institutional Name</Label>
              <Input value={profile?.displayName} className="h-16 bg-muted/20 border-2 font-black italic text-lg rounded-2xl px-8" readOnly disabled />
              <p className="text-[10px] text-muted-foreground italic ml-3">Profile name is synchronized with your institutional workspace.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <Label className="font-black text-primary uppercase text-[10px] tracking-[0.4em] ml-3 flex items-center gap-3">
                        <IdCard className="h-5 w-5 text-secondary" /> Institutional ID
                    </Label>
                    <Input 
                        placeholder="e.g. 24-13347-177" 
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="h-16 border-2 focus:ring-primary font-black text-xl rounded-2xl px-8 shadow-inner"
                    />
                </div>
                <div className="space-y-3">
                    <Label className="font-black text-primary uppercase text-[10px] tracking-[0.4em] ml-3">Academic Unit</Label>
                    <Input 
                        placeholder="e.g. CICS, CEA, or External" 
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        className="h-16 border-2 focus:ring-primary font-black text-lg rounded-2xl px-8 shadow-inner"
                    />
                </div>
            </div>

            <Button 
                onClick={handleSave} 
                className="w-full h-20 bg-primary hover:bg-primary/95 text-white font-black text-2xl rounded-[1.5rem] shadow-3xl gap-4 group transition-all"
                disabled={isUpdating}
            >
                {isUpdating ? <Loader2 className="h-8 w-8 animate-spin" /> : <Save className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform" />}
                SYNCHRONIZE PROFILE
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-muted/50">
              <Button variant="outline" onClick={logout} className="h-14 gap-4 font-black uppercase text-[10px] tracking-widest rounded-2xl border-2 hover:bg-muted transition-all shadow-md">
                  <RefreshCcw className="h-5 w-5" />
                  Switch ID
              </Button>
              <Button variant="destructive" onClick={logout} className="h-14 gap-4 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">
                  <LogOut className="h-5 w-5" />
                  Terminate
              </Button>
          </div>
        </CardContent>
      </Card>

      {profile?.isAuthorizedAdmin && (
        <Card className="neu-card-shadow border-none rounded-[2.5rem] bg-destructive/5 overflow-hidden shadow-xl ring-1 ring-destructive/10">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-destructive flex items-center gap-4 uppercase italic tracking-tighter">
              <ShieldOff className="h-7 w-7" />
              Institutional Resignation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="p-6 bg-white/50 rounded-[1.5rem] border-2 border-dashed border-destructive/20 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-1 shadow-sm" />
              <div className="space-y-3">
                <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">
                  Resigning your administrative credentials will terminate your access to the oversight console.
                </p>
                {profile.isSuperAdmin && (
                  <p className="font-black text-destructive uppercase text-[10px] tracking-[0.2em]">Super Admin: Transfer ownership before proceeding.</p>
                )}
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full h-16 gap-4 font-black uppercase text-xs tracking-[0.3em] shadow-2xl rounded-[1.25rem] hover:brightness-110 active:scale-95 transition-all"
                  disabled={profile.isSuperAdmin}
                >
                  <ShieldOff className="h-5 w-5" />
                  REVOKE ADMIN STATUS
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem] p-10 border-none shadow-3xl bg-white/98 backdrop-blur-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-3xl font-black text-primary italic uppercase tracking-tighter text-center">Confirm Demotion</AlertDialogTitle>
                  <AlertDialogDescription className="text-lg font-medium text-center opacity-70">
                    Are you absolutely sure? This action will revoke all administrative oversight privileges immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center gap-4 pt-6">
                  <AlertDialogCancel className="rounded-2xl h-14 px-10 font-bold border-2">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResign}
                    className="bg-destructive hover:bg-destructive/90 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest"
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
