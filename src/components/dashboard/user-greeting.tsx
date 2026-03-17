
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Library, LogOut, BookOpen, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function UserGreeting() {
  const { logout, profile } = useAuth();
  const libraryImage = PlaceHolderImages.find(img => img.id === 'library-interior');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Library className="h-6 w-6" />
          <span className="font-headline tracking-tight">NEU Library Hub</span>
        </div>
        <Button variant="ghost" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col justify-center gap-8">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-headline font-black text-primary leading-tight">
            Welcome to <span className="text-accent">NEU Library!</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Hello, <span className="text-primary font-bold">{profile?.displayName}</span>!
          </p>
          <div className="inline-block bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
            <p className="text-sm font-mono font-bold text-accent">ID: {profile?.studentId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <Card className="overflow-hidden shadow-xl border-none">
                <div className="aspect-video relative">
                    <Image 
                        src={libraryImage?.imageUrl || "https://picsum.photos/seed/lib/800/400"} 
                        alt="Library" 
                        fill 
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-lg font-bold">Main Reading Area</p>
                        <p className="text-sm opacity-80">Silent zone activated</p>
                    </div>
                </div>
           </Card>

           <div className="space-y-4">
              <Card className="bg-primary text-white">
                <CardContent className="p-6 flex items-center gap-4">
                    <Clock className="h-8 w-8 opacity-80" />
                    <div>
                        <p className="text-sm opacity-80 uppercase tracking-widest font-bold">Library Hours</p>
                        <p className="text-xl font-bold">08:00 AM - 05:00 PM</p>
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 text-accent mt-1" />
                        <div>
                            <p className="font-bold">Entry Status</p>
                            <p className="text-sm text-muted-foreground">Successfully logged in. Please proceed to the scanning desk if required.</p>
                        </div>
                    </div>
                    <Button className="w-full gap-2 bg-accent hover:bg-accent/90 text-white border-none shadow-md">
                        <BookOpen className="h-4 w-4" />
                        View Available Resources
                    </Button>
                </CardContent>
              </Card>
           </div>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} New Era University. All rights reserved.</p>
      </footer>
    </div>
  );
}
