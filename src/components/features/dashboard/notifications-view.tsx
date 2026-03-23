"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, ShieldAlert, Clock, ArrowLeft } from "lucide-react";
import { collection, query, orderBy, doc, writeBatch, where, limit } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface NotificationsViewProps {
  onBack?: () => void;
}

export function NotificationsView({ onBack }: NotificationsViewProps) {
  const { profile, viewMode } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const notificationsQuery = useMemoFirebase(() => {
    if (!profile?.id || !firestore) return null;
    
    if (viewMode === 'admin') {
      return query(collection(firestore, 'notifications'), orderBy('timestamp', 'desc'), limit(100));
    }
    
    return query(
      collection(firestore, 'notifications'),
      where('userId', 'in', [profile.id, 'global']),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
  }, [firestore, profile]);

  const { data: notifications, isLoading } = useCollection(notificationsQuery);

  const markAllRead = async () => {
    if (!notifications || !firestore) return;
    const batch = writeBatch(firestore);
    notifications.forEach(n => {
      if (!n.read) {
        batch.update(doc(firestore, 'notifications', n.id), { read: true });
      }
    });
    await batch.commit();
    toast({ title: "Notifications Cleared", description: "All alerts marked as read." });
  };

  const markRead = (id: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'notifications', id), { read: true });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-[2.5rem] animate-in fade-in duration-700 pb-[5rem]">
      {/* Header Alignment */}
      <div className="flex flex-col gap-[1.5rem]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-[1.5rem]">
          <div className="space-y-[0.5rem]">
            <h2 className="text-[2rem] md:text-[3.5rem] font-black text-primary italic uppercase tracking-tighter leading-none text-glow-primary">System Alerts</h2>
            <p className="text-[0.625rem] md:text-[0.875rem] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 leading-none">Institutional Updates & Activity Logs</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={markAllRead} variant="outline" className="h-[3.5rem] px-8 gap-3 font-black text-[0.75rem] uppercase tracking-widest rounded-[1.25rem] shadow-xl hover:scale-105 transition-all active:scale-95 border-2">
              <CheckCircle2 className="h-[1.25rem] w-[1.25rem] text-green-600" /> Mark All Read
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 font-bold text-muted-foreground uppercase animate-pulse tracking-[0.3em] text-[10px]">Syncing Alerts...</div>
        ) : notifications?.length === 0 ? (
          <EmptyState 
            icon={Bell} 
            title="No Active Alerts" 
            message="Institutional notifications and system updates will appear here." 
          />
        ) : notifications?.map((n) => (
          <Card 
            key={n.id} 
            className={cn(
              "neu-card-shadow border-none rounded-[1.5rem] overflow-hidden transition-all duration-300 cursor-pointer ring-1 ring-border",
              n.read ? "bg-card opacity-70" : "bg-card border-l-8 border-l-primary scale-[1.01] shadow-2xl"
            )}
            onClick={() => !n.read && markRead(n.id)}
          >
            <CardContent className="p-6 flex items-start gap-6">
              <div className={cn(
                "p-4 rounded-xl shadow-inner",
                n.read ? "bg-muted text-muted-foreground" : "bg-primary/5 text-primary"
              )}>
                {n.title?.toLowerCase().includes('alert') ? <ShieldAlert className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-primary text-base italic uppercase tracking-tight">{n.title}</h4>
                  <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase italic tracking-widest opacity-40">
                    <Clock className="h-3 w-3" />
                    {n.timestamp?.seconds ? format(n.timestamp.seconds * 1000, 'MMM dd, HH:mm') : 'Just now'}
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed italic opacity-80">&quot;{n.message}&quot;</p>
              </div>
              {!n.read && <div className="h-3 w-3 bg-secondary rounded-full shadow-[0_0_15px_rgba(242,201,76,0.5)] animate-pulse mt-2" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}