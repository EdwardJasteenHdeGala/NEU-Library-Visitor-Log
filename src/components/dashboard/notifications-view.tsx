
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, ShieldAlert, Clock, ArrowLeft, Trash2 } from "lucide-react";
import { collection, query, where, orderBy, doc, writeBatch } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface NotificationsViewProps {
  onBack?: () => void;
}

export function NotificationsView({ onBack }: NotificationsViewProps) {
  const { profile } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const notificationsQuery = useMemoFirebase(() => {
    if (!profile || !firestore) return null;
    return query(
      collection(firestore, 'notifications'),
      where('userId', '==', profile.id),
      orderBy('timestamp', 'desc')
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2 text-primary/50 hover:text-primary font-black text-[10px] uppercase gap-2">
            <ArrowLeft className="h-3 w-3" /> Back
          </Button>
          <h2 className="text-3xl font-black text-primary italic uppercase tracking-tighter">System Alerts</h2>
          <p className="text-muted-foreground font-medium text-lg">Institutional updates and activity logs.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={markAllRead} variant="outline" className="gap-2 font-black text-[10px] uppercase h-11 border-2 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-green-600" /> Mark All Read
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 font-bold text-muted-foreground uppercase animate-pulse">Syncing Alerts...</div>
        ) : notifications?.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-2 rounded-[2rem] bg-white/50">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="font-bold text-muted-foreground italic">No institutional alerts recorded.</p>
          </Card>
        ) : notifications?.map((n) => (
          <Card 
            key={n.id} 
            className={cn(
              "neu-card-shadow border-none rounded-2xl overflow-hidden transition-all duration-300",
              n.read ? "bg-white opacity-70" : "bg-white border-l-8 border-l-primary scale-[1.01] shadow-xl"
            )}
            onClick={() => !n.read && markRead(n.id)}
          >
            <CardContent className="p-6 flex items-start gap-6 cursor-pointer">
              <div className={cn(
                "p-3 rounded-xl",
                n.read ? "bg-slate-100 text-slate-400" : "bg-primary/5 text-primary"
              )}>
                {n.title.toLowerCase().includes('alert') ? <ShieldAlert className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-primary text-base italic uppercase tracking-tight">{n.title}</h4>
                  <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase italic tracking-widest">
                    <Clock className="h-3 w-3" />
                    {n.timestamp?.seconds ? format(n.timestamp.seconds * 1000, 'MMM dd, HH:mm') : 'Just now'}
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600">{n.message}</p>
              </div>
              {!n.read && <div className="h-2 w-2 bg-secondary rounded-full" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
