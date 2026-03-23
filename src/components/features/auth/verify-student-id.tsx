
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldCheck, 
  Loader2, 
  GraduationCap, 
  MapPin, 
  IdCard,
  UserCircle2,
  Building2,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { NEU_COLLEGES } from "@/lib/constants";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";


export function VerifyStudentId() {
  const { profile, updateProfileData, logout } = useAuth();
  const [studentId, setStudentId] = useState("");
  const [college, setCollege] = useState(profile?.college && profile.college !== 'General Education' ? profile.college : "");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !college) {
        toast({
            title: "Required Information",
            description: "Please provide both your ID Number and Academic Unit.",
            variant: "destructive"
        });
        return;
    }

    setIsVerifying(true);
    const success = await updateProfileData({ 
        studentId: studentId.trim(),
        college: college,
        profileCompleted: true
    });
    setIsVerifying(false);

    if (success) {
      toast({
        title: "Identity Verified",
        description: "Your institutional profile is now synchronized with the registry.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-primary transform -skew-y-6 -translate-y-24 z-0" />
      
      <Card className="w-full max-w-xl relative z-10 shadow-3xl border-none overflow-hidden rounded-[2.5rem] bg-card animate-in zoom-in duration-500">
        <CardHeader className="bg-primary p-10 text-center space-y-6 text-white relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-10" />
            <div className="mx-auto w-24 h-24 relative rounded-3xl overflow-hidden border-2 border-secondary bg-card p-3 shadow-2xl">
                <Image 
                    src={logoImage?.imageUrl || ""} 
                    alt="NEU Logo" 
                    fill 
                    className="object-contain p-2"
                />
            </div>
            <div className="space-y-2 relative z-10">
                <CardTitle className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                    Institutional <br /> Onboarding
                </CardTitle>
                <CardDescription className="text-secondary font-bold text-[10px] uppercase tracking-[0.4em]">
                    Registry Synchronization Protocol
                </CardDescription>
            </div>
        </CardHeader>

        <CardContent className="p-10 md:p-14 space-y-10">
          <div className="flex items-center gap-6 p-6 bg-primary/5 rounded-3xl border border-primary/10 shadow-inner">
            <div className="h-16 w-16 rounded-2xl overflow-hidden border-4 border-white shadow-xl shrink-0">
                <Image 
                    src={profile?.photoURL || "https://picsum.photos/seed/user/100/100"} 
                    alt="Profile" 
                    width={64} 
                    height={64} 
                    className="object-cover"
                />
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-2">
                    <UserCircle2 className="h-3 w-3" /> Authenticated Account
                </p>
                <p className="text-xl font-black text-primary leading-none italic">{profile?.displayName}</p>
                <p className="text-[11px] font-bold text-muted-foreground mt-1">{profile?.email}</p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="space-y-6">
                <div className="space-y-3">
                    <Label htmlFor="studentId" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 ml-2 flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-secondary" />
                        Institutional ID Number
                    </Label>
                    <Input 
                        id="studentId"
                        placeholder="e.g. 24-13347-177" 
                        value={studentId} 
                        onChange={(e) => setStudentId(e.target.value)}
                        className="h-16 text-2xl font-black rounded-2xl border-2 focus:ring-primary shadow-inner bg-muted/30 px-8 italic"
                        required
                    />
                </div>

                <div className="space-y-3">
                    <Label htmlFor="college" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 ml-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-secondary" />
                        Academic Unit / Department
                    </Label>
                    <Select value={college} onValueChange={setCollege}>
                      <SelectTrigger className="h-16 text-lg font-black rounded-2xl border-2 focus:ring-primary shadow-inner bg-muted/30 px-8">
                        <SelectValue placeholder="Select your department..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-3xl">
                        {NEU_COLLEGES.map(c => (
                          <SelectItem key={c.id} value={c.id} className="font-bold py-3 px-4">
                            {c.name} ({c.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4 pt-6">
                <Button 
                    type="submit" 
                    className="w-full h-20 text-2xl font-black gap-4 rounded-[1.5rem] shadow-3xl bg-primary hover:bg-primary/95 transition-all group relative overflow-hidden" 
                    disabled={isVerifying || !studentId.trim() || !college}
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin" />
                            SYNCHRONIZING...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="h-8 w-8 text-secondary group-hover:scale-125 transition-transform" />
                            COMPLETE IDENTITY SYNC
                        </>
                    )}
                </Button>
                
                <Button 
                    type="button"
                    variant="ghost" 
                    onClick={logout}
                    className="w-full h-12 font-black text-xs uppercase tracking-[0.4em] text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                >
                    CANCEL & SIGN OUT
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
