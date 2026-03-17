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
  AlertTriangle
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

export function ProfileView() {
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
        title: "Profile Updated",
        description: "Your identification details have been saved.",
      });
    }
  };

  const handleResign = async () => {
    await resignAdmin();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
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
                      <Label className="text-muted-foreground text-[10px] font-black uppercase">Access Status:</Label>
                      <span className="font-bold text-green-600 text-sm uppercase tracking-widest">Verified</span>
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
              <Input value={profile?.displayName} className="h-12 bg-muted/20 border-muted" readOnly disabled />
              <p className="text-[10px] text-muted-foreground italic">Name is synchronized from your Google account.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-bold text-primary uppercase text-xs tracking-wider">Student / Guest ID Number</Label>
                    <Input 
                        placeholder="e.g. 24-13347-177" 
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="h-12 border-2 focus:ring-primary"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-bold text-primary uppercase text-xs tracking-wider">College / Department</Label>
                    <Input 
                        placeholder="e.g. CICS, CEA, or External" 
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        className="h-12 border-2 focus:ring-primary"
                    />
                </div>
            </div>

            <Button 
                onClick={handleSave} 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-xl neu-card-shadow gap-2"
                disabled={isUpdating}
            >
                {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Save Profile Changes
            </Button>
          </div>

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
        </CardContent>
      </Card>

      {profile?.isAuthorizedAdmin && (
        <Card className="neu-card-shadow border-2 border-destructive/10 bg-destructive/5 overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-black text-destructive flex items-center gap-2">
              <ShieldOff className="h-5 w-5" />
              DANGER ZONE
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-4 bg-white/50 rounded-xl border border-destructive/10 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                By resigning your admin access, you will lose the ability to manage users, view analytics, and access the administrator console. 
                {profile.isSuperAdmin ? (
                  <span className="block mt-2 font-black text-destructive uppercase tracking-widest">
                    As Super Admin, you must transfer ownership before resigning.
                  </span>
                ) : (
                  <span className="block mt-2">This action is permanent and cannot be undone without Super Admin approval.</span>
                )}
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full h-12 gap-2 font-black uppercase text-xs tracking-widest shadow-lg"
                  disabled={profile.isSuperAdmin}
                >
                  <ShieldOff className="h-4 w-4" />
                  Resign Admin Privileges
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-black text-primary italic uppercase tracking-tighter">Confirm Resignation</AlertDialogTitle>
                  <AlertDialogDescription className="text-base font-medium">
                    Are you absolutely sure? You will be demoted to a standard user and lose all administrative dashboard access immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResign}
                    className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-black"
                  >
                    Confirm Resignation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
      
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
