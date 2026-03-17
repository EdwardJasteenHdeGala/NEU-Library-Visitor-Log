"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Loader2, UserCircle, GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function VerifyStudentId() {
  const { profile, updateProfileData, logout } = useAuth();
  const [studentId, setStudentId] = useState("");
  const [college, setCollege] = useState(profile?.college || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');
  const campusImage = PlaceHolderImages.find(img => img.id === 'neu-campus');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !college.trim()) {
        toast({
            title: "Required Fields",
            description: "Please provide both your ID and Department.",
            variant: "destructive"
        });
        return;
    }

    setIsVerifying(true);
    const success = await updateProfileData({ 
        studentId: studentId.trim(),
        college: college.trim()
    });
    setIsVerifying(false);

    if (success) {
      toast({
        title: "Profile Configured",
        description: "Your institutional identity has been successfully verified.",
      });
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${campusImage?.imageUrl})` }}
    >
      <div className="absolute inset-0 bg-primary/90 backdrop-blur-md" />
      
      <Card className="w-full max-w-lg relative z-10 shadow-2xl border-none overflow-hidden rounded-[2.5rem] animate-in zoom-in duration-500">
        <div className="bg-primary p-8 text-center space-y-4">
            <div className="mx-auto w-20 h-20 relative rounded-full overflow-hidden border-2 border-secondary bg-white p-2">
                <Image 
                    src={logoImage?.imageUrl || ""} 
                    alt="NEU Logo" 
                    fill 
                    className="object-contain p-2"
                />
            </div>
            <div className="space-y-1">
                <CardTitle className="text-2xl font-black text-white italic uppercase tracking-tight">
                    Identity Verification
                </CardTitle>
                <CardDescription className="text-secondary/80 font-bold text-[10px] uppercase tracking-[0.2em]">
                    Institutional Security Protocol
                </CardDescription>
            </div>
        </div>

        <CardContent className="p-8 md:p-12 space-y-8 bg-white">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl border-2 border-dashed border-muted-foreground/10">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary shrink-0">
                <Image 
                    src={profile?.photoURL || "https://picsum.photos/seed/user/100/100"} 
                    alt="Profile" 
                    width={48} 
                    height={48} 
                    className="object-cover"
                />
            </div>
            <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Authenticated As</p>
                <p className="text-lg font-black text-primary leading-none">{profile?.displayName}</p>
                <p className="text-[10px] font-medium text-muted-foreground">{profile?.email}</p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="studentId" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" />
                        ID Number (Student / Faculty / Guest)
                    </Label>
                    <Input 
                        id="studentId"
                        placeholder="e.g. 24-13347-177" 
                        value={studentId} 
                        onChange={(e) => setStudentId(e.target.value)}
                        className="h-14 text-xl font-black rounded-2xl border-2 focus:ring-primary shadow-inner bg-muted/20"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="college" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1 flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        College / Department / Origin
                    </Label>
                    <Input 
                        id="college"
                        placeholder="e.g. CICS, CEA, or External" 
                        value={college} 
                        onChange={(e) => setCollege(e.target.value)}
                        className="h-14 text-lg font-bold rounded-2xl border-2 focus:ring-primary shadow-inner bg-muted/20"
                        required
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <Button 
                    type="submit" 
                    variant="neu"
                    className="w-full h-16 text-xl gap-3 rounded-[1.5rem]" 
                    disabled={isVerifying || !studentId.trim() || !college.trim()}
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            SECURELY SYNCING...
                        </>
                    ) : (
                        <>
                            <GraduationCap className="h-6 w-6 text-secondary" />
                            COMPLETE REGISTRATION
                        </>
                    )}
                </Button>
                
                <Button 
                    type="button"
                    variant="ghost" 
                    onClick={logout}
                    className="w-full h-12 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                >
                    Cancel & Sign Out
                </Button>
            </div>
          </form>

          <div className="p-4 bg-primary/5 rounded-2xl flex items-start gap-3 border border-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <p className="text-[10px] font-medium text-primary/80 leading-relaxed italic">
                  This one-time setup is required for all NEU Access Hub users. Your details will be linked to your institutional log history.
              </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
