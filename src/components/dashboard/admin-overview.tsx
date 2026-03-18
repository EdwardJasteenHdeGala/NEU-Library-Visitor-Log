
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
  
  // Robust admin check - only proceed if profile is definitely loaded and user is admin
  const isAdmin = !authLoading && (profile?.role === 'admin' || profile?.isSuperAdmin);

  // Real-time queries for telemetry - strictly guarded by isAdmin state
  const recentVisitsQuery = useMemoFirebase(() => {
    // Only fetch if explicitly authorized and profile is loaded.
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

  // If not admin, show a simplified dashboard or restricted view
  if (!isAdmin && !authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-primary">Institutional Access Restricted</h2>
        <p className="text-muted-foreground text-sm max-w-xs italic">
          The administrative console is reserved for authorized personnel. Please use your member portal to manage your log entries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary/60 text-[10px] font-bold uppercase tracking-widest">
            <LayoutDashboard className="h-3.5 w-3.5" /> Institutional Overview
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase italic">Admin Console</h2>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", status.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {status.label}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-border rounded-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Occupancy</span>
            <Users className={cn("h-4 w-4", effectiveOccupancy > 0 ? "text-green-600" : "text-slate-400")} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectiveOccupancy} <span className="text-xs text-muted-foreground font-normal">Active</span></div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border rounded-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Registry State</span>
            <Activity className="h-4 w-4 text-primary/60" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600 uppercase">Healthy</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border rounded-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Next Event</span>
            <Clock className="h-4 w-4 text-primary/60" />
          </CardHeader>
          <CardContent>
            <div className="text-xs font-bold text-primary truncate italic">{status.nextEvent}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border rounded-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Academic Year</span>
            <History className="h-4 w-4 text-primary/60" />
          </CardHeader>
          <CardContent>
            <div className="text-xs font-bold text-slate-500">2024-2025</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="pb-4 border-b p-6 bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest">
            <History className="h-4 w-4 text-primary" /> Recent Registry Activity
          </CardTitle>
          <Badge variant="outline" className="text-[9px] font-bold uppercase">{recentVisits?.length || 0} Recent</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
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
                {isLoadingRecent ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 animate-pulse text-[10px] uppercase">Syncing Registry...</TableCell></TableRow>
                ) : recentVisits?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-[10px] uppercase">No Logs Recorded</TableCell></TableRow>
                ) : recentVisits?.map((visit) => (
                  <TableRow key={visit.id} className="hover:bg-slate-50 transition-colors">
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
  );
}
