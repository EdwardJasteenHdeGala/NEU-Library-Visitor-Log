"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  History, 
  LayoutDashboard, 
  Clock, 
  ShieldAlert, 
  Power, 
  RotateCcw, 
  MessageSquare, 
  XCircle, 
  Activity, 
  DoorOpen, 
  DoorClosed, 
  Megaphone 
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, limit, orderBy, query, doc, serverTimestamp, where } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLibraryStatus, AnnouncementCategory } from "@/hooks/use-library-status";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminOverviewProps {
  onNavigate?: (view: any) => void;
}

export function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const firestore = useFirestore();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { isOpen, label, nextEvent, isManual, reason, category } = useLibraryStatus();
  
  const [manualReason, setManualReason] = useState("");
  const [manualCategory, setManualCategory] = useState<AnnouncementCategory>("general");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.isSuperAdmin;

  const recentVisitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(15));
  }, [firestore, isAdmin]);

  const allVisitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), where('exitTimestamp', '==', null));
  }, [firestore, isAdmin]);

  const { data: recentVisits } = useCollection(recentVisitsQuery);
  const { data: allVisits } = useCollection(allVisitsQuery);

  const effectiveOccupancy = isOpen ? (allVisits?.length || 0) : 0;

  const handleOverride = (mode: 'automatic' | 'manual', status?: 'open' | 'closed') => {
    if (!firestore || !profile) return;
    
    setIsUpdatingStatus(true);
    const configRef = doc(firestore, 'library_config', 'main');
    
    setDocumentNonBlocking(configRef, {
      mode,
      manualStatus: status || null,
      manualReason: status === 'closed' ? manualReason : "",
      manualCategory: status === 'closed' ? manualCategory : "general",
      updatedBy: profile.id,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => {
      setIsUpdatingStatus(false);
      toast({
        title: mode === 'automatic' ? "System Schedule Restored" : `Manual Control Active`,
        description: "The institutional access protocol has been updated.",
      });
      if (mode === 'automatic') {
        setManualReason("");
        setManualCategory("general");
      }
    }, 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary/60 text-[10px] font-bold uppercase tracking-widest">
            <LayoutDashboard className="h-3.5 w-3.5" /> Institutional Overview
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase italic">Admin Console</h2>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Library {label}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-2 px-4 flex items-center gap-3 shadow-sm">
          {isOpen ? <DoorOpen className="h-4 w-4 text-green-600" /> : <DoorClosed className="h-4 w-4 text-red-600" />}
          <span className={cn("text-[10px] font-bold uppercase", isOpen ? "text-green-600" : "text-red-600")}>Status: {label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm border-border rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Real-Time Occupancy</span>
                <Users className={cn("h-4 w-4", isOpen && effectiveOccupancy > 0 ? "text-green-600 animate-pulse" : "text-slate-400")} />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-3xl font-bold tracking-tight", !isOpen ? "text-red-600" : "text-slate-900")}>{!isOpen ? "Restricted" : effectiveOccupancy}</span>
                  {isOpen && <span className="text-[10px] font-bold text-muted-foreground uppercase">Members</span>}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Registry State</span>
                <Activity className="h-4 w-4 text-primary/60" />
              </CardHeader>
              <CardContent><div className="text-xl font-bold text-green-600 uppercase">Healthy</div></CardContent>
            </Card>
            <Card className="shadow-sm border-border rounded-xl bg-slate-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">System Schedule</span>
                <Clock className="h-4 w-4 text-primary/60" />
              </CardHeader>
              <CardContent><div className="text-sm font-bold text-primary truncate">{nextEvent}</div></CardContent>
            </Card>
          </div>

          <Card className="shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-4 border-b p-6 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest"><History className="h-4 w-4 text-primary" /> Live Registry History</CardTitle>
              <Badge variant="outline" className="text-[9px] font-bold uppercase">{recentVisits?.length || 0} Recent</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[450px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest px-6">Member</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest">Unit</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest px-6 text-right">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentVisits?.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-[10px] uppercase">No Logs Recorded</TableCell></TableRow>
                    ) : recentVisits?.map((visit, i) => (
                      <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-bold px-6 text-xs">{visit.userName}</TableCell>
                        <TableCell className="text-[9px] font-bold text-primary/70 uppercase">{visit.college}</TableCell>
                        <TableCell>
                          <span className={cn("text-[9px] font-bold uppercase", visit.exitTimestamp ? "text-green-600" : "text-amber-600 animate-pulse")}>
                            {visit.exitTimestamp ? `Stay: ${visit.durationMinutes}m` : "Active"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[9px] font-bold px-6 text-right uppercase italic">
                          {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd, h:mm a') : 'Now'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className={cn("shadow-sm border-none rounded-xl overflow-hidden ring-1", isManual ? "ring-amber-500/30 bg-amber-50/50" : "ring-primary/10 bg-white")}>
            <CardHeader className={cn("p-6 text-white flex flex-row items-center justify-between shadow-sm", isManual ? "bg-amber-600" : "bg-primary")}>
              <div className="flex items-center gap-3"><ShieldAlert className="h-5 w-5" /><CardTitle className="text-[10px] font-bold uppercase tracking-widest">Library Control Protocol</CardTitle></div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between"><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Mode</span><Badge variant={isManual ? "secondary" : "default"} className="text-[8px] font-black uppercase">{isManual ? "Manual Override" : "System Automatic"}</Badge></div>
                {isManual && reason && <div className="p-4 bg-amber-100/50 border border-amber-200 rounded-lg"><p className="text-[10px] font-medium text-amber-800 italic">“{reason}”</p></div>}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" onClick={() => handleOverride('manual', 'open')} disabled={isUpdatingStatus} className="h-10 text-[9px] font-bold uppercase tracking-widest gap-2"><Power className="h-3 w-3" /> Force Open</Button>
                  <Button variant="outline" size="sm" onClick={() => handleOverride('manual', 'closed')} disabled={isUpdatingStatus} className="h-10 text-[9px] font-bold uppercase tracking-widest gap-2"><XCircle className="h-3 w-3" /> Force Close</Button>
                </div>
                {isManual && <Button variant="secondary" size="sm" onClick={() => handleOverride('automatic')} disabled={isUpdatingStatus} className="w-full h-10 text-[9px] font-bold uppercase gap-2"><RotateCcw className="h-3 w-3" /> Restore Schedule</Button>}
              </div>
              <div className="space-y-4 pt-6 border-t">
                <div className="space-y-1.5"><label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Megaphone className="h-3 w-3" /> Announcement Type</label>
                  <Select value={manualCategory} onValueChange={(v: AnnouncementCategory) => setManualCategory(v)}>
                    <SelectTrigger className="h-10 text-[10px] font-bold uppercase rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="emergency">Emergency</SelectItem><SelectItem value="institutional">Institutional</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><MessageSquare className="h-3 w-3" /> Institutional Note</label>
                  <Textarea placeholder="Formal reason for closure..." value={manualReason} onChange={(e) => setManualReason(e.target.value)} className="min-h-[100px] text-[10px] font-medium rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}