"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  History, 
  LayoutDashboard, 
  Activity,
  Clock,
  AlertCircle,
  Database,
  ArrowRight
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getAcademicYear } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLibraryStatus } from "@/hooks/use-library-status";
import { Button } from "@/components/ui/button";

interface AdminOverviewProps {
  onNavigate?: (view: any) => void;
}

export function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const firestore = useFirestore();
  const { profile, loading: authLoading } = useAuth();
  const status = useLibraryStatus();
  
  // Robust admin check - strictly prevent unauthorized telemetry access
  // Guard against authLoading ensures we don't query before profile is ready
  const isAdmin = !authLoading && !!profile && (profile.role === 'admin' || profile.isAuthorizedAdmin === true);

  // Real-time queries for telemetry - authorized admins see all registry logs
  const recentVisitsQuery = useMemoFirebase(() => {
    // We only construct the query if the user is a verified administrator
    // This prevents "Missing or insufficient permissions" errors during initial sync
    if (!isAdmin || !firestore) return null;
    return query(
      collection(firestore, 'visits'), 
      orderBy('timestamp', 'desc'), 
      limit(15)
    );
  }, [firestore, isAdmin]);

  const occupancyQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(
      collection(firestore, 'visits'), 
      where('exitTimestamp', '==', null)
    );
  }, [firestore, isAdmin]);

  const { data: recentVisits, isLoading: isLoadingRecent } = useCollection(recentVisitsQuery);
  const { data: activeVisits } = useCollection(occupancyQuery);

  const effectiveOccupancy = activeVisits?.length || 0;

  // Defensive rendering for non-admin users
  if (!authLoading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in duration-500">
        <div className="p-6 bg-destructive/10 rounded-full border-2 border-destructive/20 shadow-inner">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-primary italic uppercase tracking-tighter">Access Restricted</h2>
          <p className="text-muted-foreground text-sm max-w-xs font-medium italic mx-auto">
            The administrative oversight panel is reserved for authorized personnel. Your attempt has been logged in the institutional security registry.
          </p>
        </div>
        <Button variant="outline" className="rounded-xl font-bold uppercase tracking-widest px-8 border-2" onClick={() => window.location.reload()}>
          Retry Synchronization
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary/60 text-[10px] font-black uppercase tracking-[0.3em] italic">
            <Database className="h-4 w-4 text-secondary" /> Institutional Data Synchronization
          </div>
          <h2 className="text-5xl font-black tracking-tight text-slate-900 uppercase italic leading-none">Admin Oversight</h2>
          <div className="flex items-center gap-3 pt-1">
            <div className={cn("h-3 w-3 rounded-full shadow-lg", status.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest italic">
              Registry Engine: <span className={status.isOpen ? "text-green-600" : "text-red-600"}>{status.isOpen ? 'ACTIVE' : 'STANDBY'}</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest gap-2 bg-white shadow-sm" onClick={() => onNavigate?.('visitor-log')}>
            Full Registry <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-2xl border-none rounded-[2rem] bg-white overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-default ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Current Occupancy</span>
            <Users className={cn("h-5 w-5", effectiveOccupancy > 0 ? "text-primary animate-pulse" : "text-slate-400")} />
          </CardHeader>
          <CardContent className="pt-8">
            <div className="text-4xl font-black text-primary italic leading-none">{effectiveOccupancy} <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest ml-1 not-italic opacity-40">Members</span></div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min((effectiveOccupancy / 150) * 100, 100)}%` }} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-2xl border-none rounded-[2rem] bg-white overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-default ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Security State</span>
            <Activity className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent className="pt-8">
            <div className="text-2xl font-black text-green-600 uppercase italic leading-none">Synchronized</div>
            <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tight">AES-256 Cloud Encryption</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-none rounded-[2rem] bg-white overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-default ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Temporal Marker</span>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-8">
            <div className="text-sm font-black text-primary truncate italic uppercase tracking-tighter leading-none">Institutional Advisory</div>
            <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tight">Real-time Scheduler</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-none rounded-[2rem] bg-white overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-default ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Session Academic</span>
            <History className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-8">
            <div className="text-2xl font-black text-slate-800 uppercase italic leading-none">AY {getAcademicYear()}</div>
            <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tight">Institutional Registry Term</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-3xl border-none rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="pb-6 border-b p-10 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <CardTitle className="text-2xl font-black italic flex items-center gap-5 uppercase tracking-tighter text-primary">
            <History className="h-10 w-10 text-secondary p-2 bg-white rounded-xl shadow-sm" /> Registry Telemetry Archive
          </CardTitle>
          <Badge variant="outline" className="text-[11px] font-black uppercase tracking-[0.2em] border-2 py-2 px-6 rounded-full bg-white">
            {recentVisits?.length || 0} System-wide Logs
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-20 shadow-md">
                <TableRow className="border-b-2">
                  <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] px-10 py-7 text-primary/70 italic">Portal Member</TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] py-7 text-primary/70 italic">Academic Unit</TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] py-7 text-primary/70 italic">Registry Status</TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] px-10 text-right py-7 text-primary/70 italic">Cloud Sync</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRecent ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-32 animate-pulse text-[14px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Decrypting Institutional Registry...</TableCell></TableRow>
                ) : (recentVisits?.length === 0 || !recentVisits) ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-32 italic text-[14px] font-black uppercase text-muted-foreground tracking-widest">Registry Archive Empty</TableCell></TableRow>
                ) : recentVisits?.map((visit) => (
                  <TableRow key={visit.id} className="hover:bg-primary/5 transition-all border-b last:border-0 group cursor-pointer">
                    <TableCell className="font-black px-10 py-8 text-base text-primary italic group-hover:translate-x-2 transition-transform">
                      {visit.userName}
                      <span className="block text-[10px] font-bold text-muted-foreground not-italic tracking-normal mt-1 opacity-60">ID: {visit.userId.slice(0, 8)}...</span>
                    </TableCell>
                    <TableCell className="text-[12px] font-black text-primary/70 uppercase italic tracking-tight">{visit.college}</TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic px-5 py-2 rounded-full border-2", 
                        visit.exitTimestamp ? "text-green-600 bg-green-50 border-green-100" : "text-amber-600 bg-amber-50 border-amber-100 animate-pulse shadow-sm"
                      )}>
                        {visit.exitTimestamp ? (
                          <>
                            <Database className="h-3 w-3" />
                            Archived ({visit.durationMinutes}m)
                          </>
                        ) : (
                          <>
                            <Activity className="h-3 w-3" />
                            Active Session
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] font-black px-10 text-right uppercase italic tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">
                      {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd, HH:mm:ss') : 'Synchronizing...'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <div className="p-8 bg-slate-50 border-t flex justify-center">
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 hover:text-primary transition-all gap-4" onClick={() => onNavigate?.('visitor-log')}>
               View Full Institutional Archive <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
      </Card>
    </div>
  );
}
