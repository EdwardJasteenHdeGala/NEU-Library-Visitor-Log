
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
  HelpCircle
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
        title: "Visit Logged",
        description: "Thank you for visiting NEU Library!",
      });
      setPurpose("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log visit.",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Library className="h-6 w-6" />
            <span className="font-headline tracking-tight">NEU Library Hub</span>
          </div>
          <div className="flex items-center gap-2">
            {profile?.isAuthorizedAdmin && (
              <Button variant="outline" size="sm" onClick={() => switchRole('admin')} className="hidden sm:flex gap-2 border-primary text-primary">
                <ShieldCheck className="h-4 w-4" />
                Switch to Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-black text-primary">
              Welcome to <span className="text-secondary">NEU Library!</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              Hello, <span className="text-primary font-bold">{profile?.displayName}</span>!
            </p>
            <div className="inline-block bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20">
              <p className="text-xs font-mono font-bold text-accent">Student ID: {profile?.studentId}</p>
            </div>
          </div>

          <Card className="neu-card-shadow border-none overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-primary text-white p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Log Your Visit
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Purpose of Visit</label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Select purpose..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reading books">Reading Books</SelectItem>
                      <SelectItem value="research in thesis">Research in Thesis</SelectItem>
                      <SelectItem value="use of computer">Use of Computer</SelectItem>
                      <SelectItem value="doing assignments">Doing Assignments</SelectItem>
                      <SelectItem value="group study">Group Study</SelectItem>
                      <SelectItem value="consultation">Faculty/Staff Consultation</SelectItem>
                      <SelectItem value="charging device">Charging Device</SelectItem>
                      <SelectItem value="resting/waiting">Resting/Waiting</SelectItem>
                      <SelectItem value="printing/scanning">Printing/Scanning</SelectItem>
                      <SelectItem value="resource borrowing">Borrowing/Returning Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleLogVisit} 
                  disabled={!purpose || isLogging}
                  className="w-full h-14 bg-secondary hover:bg-secondary/90 text-primary font-black text-xl shadow-lg transition-all active:scale-95"
                >
                  {isLogging ? "Logging..." : "Confirm Entry"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="aspect-video relative rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                  src={libraryImage?.imageUrl || "https://picsum.photos/seed/lib/1200/600"} 
                  alt="Library Interior" 
                  fill 
                  className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <p className="text-2xl font-black">Modern Research Environment</p>
                  <p className="text-white/80 font-medium">Equipped with thousands of resources for your academic growth.</p>
              </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="neu-card-shadow border-none">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                    <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Library Hours</p>
                    <p className="text-lg font-black text-primary">08:00 AM - 05:00 PM</p>
                    <p className="text-[10px] text-muted-foreground italic">Mon - Fri (Full Service)</p>
                </div>
            </CardContent>
          </Card>

          <Card className="neu-card-shadow border-none">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Your Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl space-y-1">
                <p className="text-sm font-bold">Location: Main Building</p>
                <p className="text-xs text-muted-foreground">Authenticated via @neu.edu.ph</p>
              </div>
              <Button variant="outline" className="w-full gap-2 border-accent text-accent hover:bg-accent/10">
                <BookOpen className="h-4 w-4" />
                Available Resources
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="ghost" className="h-20 flex-col gap-2 bg-white neu-card-shadow">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-bold uppercase">FAQ</span>
            </Button>
            <Button variant="ghost" className="h-20 flex-col gap-2 bg-white neu-card-shadow">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-bold uppercase">Profile</span>
            </Button>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground text-sm border-t mt-auto">
        <p>&copy; {new Date().getFullYear()} New Era University. All rights reserved.</p>
      </footer>
    </div>
  );
}
