"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  History, 
  LayoutDashboard, 
  Activity,
  Clock,
  AlertCircle
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLibraryStatus } from "@/hooks/use-library-status";

interface AdminOverviewProps {
  onNavigate?: (view: any) => void;
}

export function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const firestore = useFirestore();
  const { profile, loading: authLoading } = useAuth();
  const status = useLibraryStatus();
  
  // Robust admin check - strictly prevent unauthorized telemetry access
  const isAdmin = !authLoading && profile && (profile.role === 'admin' || profile.isAuthorizedAdmin);

  // Real-time queries for telemetry - strictly guarded to avoid permission errors
  const recentVisitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(15));
  }, [firestore, isAdmin]);

  const occupancyQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), where('exitTimestamp', '==', null));
  }, [firestore, isAdmin]);

  const { data: recentVisits, isLoading: isLoadingRecent } = useCollection(recentVisitsQuery);
  const { data: activeVisits } = useCollection(occupancyQuery);

  const effectiveOccupancy = activeVisits?.length || 0;

  // Defensive rendering for non-admin users
  if (!isAdmin && !authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-primary italic uppercase tracking-tighter">Access Restricted</h2>
        <p className="text-muted-foreground text-sm max-w-xs font-medium italic">
          The administrative oversight panel is reserved for authorized personnel. Please use your portal to manage your log entries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary/60 text-[10px] font-black uppercase tracking-widest italic">
            <LayoutDashboard className="h-3.5 w-3.5" /> Institutional Hub Oversight
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic">Admin Console</h2>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", status.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">
              Registry: {status.isOpen ? 'Active' : 'Standby'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-2xl border-none rounded-2xl bg-white overflow-hidden group hover:scale-105 transition-transform duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Occupancy</span>
            <Users className={cn("h-5 w-5", effectiveOccupancy > 0 ? "text-primary animate-pulse" : "text-slate-400")} />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-black text-primary">{effectiveOccupancy} <span className="text-xs text-muted-foreground font-bold italic">Members</span></div>
          </CardContent>
        </Card>
        
        <Card className="shadow-2xl border-none rounded-2xl bg-white overflow-hidden group hover:scale-105 transition-transform duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Sync State</span>
            <Activity className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-xl font-black text-green-600 uppercase italic">Encrypted</div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-none rounded-2xl bg-white overflow-hidden group hover:scale-105 transition-transform duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Next Sync</span>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-xs font-black text-primary truncate italic uppercase tracking-tight">{status.nextEvent}</div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-none rounded-2xl bg-white overflow-hidden group hover:scale-105 transition-transform duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Session Term</span>
            <History className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-xs font-black text-slate-500 uppercase italic">AY 2024-2025</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="pb-4 border-b p-8 bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-black italic flex items-center gap-3 uppercase tracking-tighter text-primary">
            <History className="h-6 w-6 text-secondary" /> Registry Telemetry
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-2">{recentVisits?.length || 0} Recent Logs</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow className="border-b">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest px-8 py-5">Member</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Academic Unit</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Log Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest px-8 text-right py-5">Synchronized</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRecent ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-24 animate-pulse text-[12px] font-black uppercase tracking-widest text-muted-foreground italic">Decrypting Registry...</TableCell></TableRow>
                ) : recentVisits?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-24 italic text-[12px] font-black uppercase text-muted-foreground">Archive Empty</TableCell></TableRow>
                ) : recentVisits?.map((visit) => (
                  <TableRow key={visit.id} className="hover:bg-primary/5 transition-colors border-b last:border-0 group">
                    <TableCell className="font-black px-8 py-6 text-sm text-primary italic group-hover:translate-x-1 transition-transform">{visit.userName}</TableCell>
                    <TableCell className="text-[11px] font-black text-primary/70 uppercase italic">{visit.college}</TableCell>
                    <TableCell>
                      <span className={cn("text-[10px] font-black uppercase tracking-tight italic px-3 py-1 rounded-full", visit.exitTimestamp ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50 animate-pulse")}>
                        {visit.exitTimestamp ? `Stay: ${visit.durationMinutes}m` : "Active Session"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[10px] font-black px-8 text-right uppercase italic tracking-tighter opacity-60">
                      {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd, HH:mm') : 'Syncing'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}