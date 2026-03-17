
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Library, 
  LogOut, 
  BookOpen, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  User,
  Settings,
  HelpCircle,
  GraduationCap,
  RefreshCcw
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

export function UserGreeting() {
  const { logout, profile, switchRole } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [purpose, setPurpose] = useState<string>("");
  const [isLogging, setIsLogging] = useState(false);
  const libraryImage = PlaceHolderImages.find(img => img.id === 'library-interior');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleLogVisit = async () => {
    if (!purpose || !profile || !firestore) return;
    setIsLogging(true);
    try {
      await addDoc(collection(firestore, 'visits'), {
        userId: profile.id,
        userName: profile.displayName,
        college: profile.college || 'General Education',
        roleAtTime: 'student',
        purpose: purpose,
        timestamp: serverTimestamp()
      });
      toast({
        title: "Log Recorded",
        description: "Your visit has been successfully registered.",
      });
      setPurpose("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync log entry.",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <header className="p-4 bg-primary text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shadow-inner">
                <Image src={logoImage?.imageUrl || ""} alt="NEU" width={24} height={24} />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-lg font-black tracking-tight italic">NEU ACCESS</h1>
              <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">Library Services</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile?.isAuthorizedAdmin && (
              <Button variant="secondary" size="sm" onClick={() => switchRole('admin')} className="hidden sm:flex gap-2 font-bold text-xs uppercase bg-secondary text-primary hover:bg-white">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Console
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-white/80 hover:text-white hover:bg-white/10 font-bold text-xs uppercase">
              <RefreshCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Switch Account</span>
              <span className="sm:hidden">Switch</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-white/80 hover:text-white hover:bg-white/10 font-bold text-xs uppercase">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-3 animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
               <GraduationCap className="h-3 w-3" />
               Academic Year 2024-2025
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tight">
              Mabuhay, <br />
              <span className="text-secondary italic">{profile?.displayName?.split(' ')[0]}!</span>
            </h1>
            <div className="flex flex-wrap gap-4 pt-2">
                <div className="bg-white border p-3 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="bg-muted p-2 rounded-lg"><User className="h-4 w-4 text-primary" /></div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student ID</p>
                        <p className="font-mono text-xs font-bold">{profile?.studentId}</p>
                    </div>
                </div>
                <div className="bg-white border p-3 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="bg-muted p-2 rounded-lg"><MapPin className="h-4 w-4 text-primary" /></div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assigned Hub</p>
                        <p className="text-xs font-bold">{profile?.college || 'General Library'}</p>
                    </div>
                </div>
            </div>
          </div>

          <Card className="neu-card-shadow border-none overflow-hidden rounded-[2rem] bg-white">
            <CardHeader className="p-8 border-b bg-muted/30">
              <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-secondary" />
                Register Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Purpose of Visit</label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="h-16 text-lg rounded-2xl border-2 focus:ring-primary">
                      <SelectValue placeholder="What are you working on today?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="reading books">Reading Materials</SelectItem>
                      <SelectItem value="research in thesis">Thesis Research</SelectItem>
                      <SelectItem value="use of computer">Digital Laboratory Use</SelectItem>
                      <SelectItem value="doing assignments">Academic Assignments</SelectItem>
                      <SelectItem value="group study">Collaborative Study</SelectItem>
                      <SelectItem value="consultation">Faculty Consultation</SelectItem>
                      <SelectItem value="charging device">Power/Charging Access</SelectItem>
                      <SelectItem value="resting/waiting">Waiting Area</SelectItem>
                      <SelectItem value="printing/scanning">Printing Services</SelectItem>
                      <SelectItem value="resource borrowing">Resource Exchange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleLogVisit} 
                  disabled={!purpose || isLogging}
                  className="w-full h-18 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl shadow-2xl transition-all active:scale-95 py-8"
                >
                  {isLogging ? "Processing..." : "Confirm Library Entry"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="aspect-[21/9] relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
              <Image 
                  src={libraryImage?.imageUrl || ""} 
                  alt="NEU Library" 
                  fill 
                  className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white space-y-1">
                  <div className="inline-block bg-secondary text-primary px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-2">Notice</div>
                  <p className="text-3xl font-black tracking-tight leading-none">Research Hub Excellence.</p>
                  <p className="text-white/70 font-medium text-sm">Access over 50,000 physical volumes and digital repositories.</p>
              </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="neu-card-shadow border-none rounded-3xl bg-primary text-white overflow-hidden">
            <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl">
                        <Clock className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Operating Hours</p>
                        <p className="text-2xl font-black">08:00 - 17:00</p>
                    </div>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <p className="text-xs font-medium text-white/80 leading-relaxed italic">
                  "Excellence is not an act, but a habit. Make the library your second home."
                </p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Button variant="outline" className="h-20 justify-start gap-4 px-6 border-2 rounded-3xl hover:bg-primary hover:text-white hover:border-primary transition-all group">
                <div className="bg-muted p-2 rounded-xl group-hover:bg-white/20"><BookOpen className="h-5 w-5 text-primary group-hover:text-white" /></div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50">E-Library</p>
                    <p className="font-bold">Digital Resources</p>
                </div>
            </Button>
            <Button variant="outline" className="h-20 justify-start gap-4 px-6 border-2 rounded-3xl hover:bg-primary hover:text-white hover:border-primary transition-all group">
                <div className="bg-muted p-2 rounded-xl group-hover:bg-white/20"><HelpCircle className="h-5 w-5 text-primary group-hover:text-white" /></div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Assistance</p>
                    <p className="font-bold">Support Center</p>
                </div>
            </Button>
            <Button variant="outline" className="h-20 justify-start gap-4 px-6 border-2 rounded-3xl hover:bg-primary hover:text-white hover:border-primary transition-all group">
                <div className="bg-muted p-2 rounded-xl group-hover:bg-white/20"><Settings className="h-5 w-5 text-primary group-hover:text-white" /></div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Preferences</p>
                    <p className="font-bold">Account Settings</p>
                </div>
            </Button>
          </div>
          
          <div className="bg-secondary/10 border-2 border-secondary/20 p-6 rounded-3xl text-center space-y-2">
             <p className="text-xs font-black text-primary uppercase tracking-widest">Institutional Notice</p>
             <p className="text-[11px] font-medium text-primary/70">
                Please ensure you log your exit when leaving the premises to help us track occupancy levels accurately.
             </p>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] bg-white border-t mt-auto">
        <p>© {new Date().getFullYear()} NEW ERA UNIVERSITY • INTEGRITY • EXCELLENCE • DISCIPLINE</p>
      </footer>
    </div>
  );
}
