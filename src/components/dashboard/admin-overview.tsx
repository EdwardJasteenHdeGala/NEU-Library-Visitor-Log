
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Users, 
  History, 
  Building2, 
  LayoutDashboard, 
  Loader2, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Calendar,
  Settings,
  ShieldAlert,
  Power,
  RotateCcw,
  MessageSquare,
  XCircle,
  Activity,
  AlertTriangle,
  DoorOpen,
  DoorClosed,
  Megaphone
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, limit, orderBy, query, doc, serverTimestamp } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { format } from "date-fns";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  Pie,
  PieChart as RePieChart,
  Area,
  AreaChart,
  CartesianGrid
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const isAdmin = profile?.role === 'admin';

  const recentVisitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(15));
  }, [firestore, isAdmin]);

  const allVisitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(500));
  }, [firestore, isAdmin]);

  const { data: recentVisits, isLoading: isLoadingRecent } = useCollection(recentVisitsQuery);
  const { data: allVisits, isLoading: isLoadingAll } = useCollection(allVisitsQuery);

  const isLoading = isLoadingRecent || isLoadingAll;

  // Real-time Occupancy Logic
  const activeOccupancy = allVisits?.filter(v => !v.exitTimestamp).length || 0;
  const effectiveOccupancy = isOpen ? activeOccupancy : 0;

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
        title: mode === 'automatic' ? "Automatic Mode Restored" : `Manual ${status?.toUpperCase()} Active`,
        description: "The institutional access protocol has been updated.",
      });
      if (mode === 'automatic') {
        setManualReason("");
        setManualCategory("general");
      }
    }, 500);
  };

  const collegeData = allVisits ? Object.entries(
    allVisits.reduce((acc: any, visit) => {
      acc[visit.college] = (acc[visit.college] || 0) + 1;
      return acc;
    }, {})
  ).map(([college, visits]) => ({ college, visits }))
  .sort((a, b) => b.visits - a.visits) : [];

  const chartConfig = {
    visits: { label: "Visits", color: "hsl(var(--primary))" },
    count: { label: "Occupancy", color: "hsl(var(--secondary))" },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary/60 text-[10px] font-bold uppercase tracking-widest">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Institutional Overview
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase italic">Admin Console</h2>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Library {label} • {nextEvent}
            </p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-2 px-4 flex items-center gap-3 shadow-sm">
          {isOpen ? <DoorOpen className="h-4 w-4 text-green-600" /> : <DoorClosed className="h-4 w-4 text-red-600" />}
          <span className={cn("text-[10px] font-bold uppercase tracking-widest", isOpen ? "text-green-600" : "text-red-600")}>
            Status: {label}
          </span>
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
                  <span className={cn("text-3xl font-bold tracking-tight", !isOpen ? "text-red-600" : effectiveOccupancy > 0 ? "text-green-600" : "text-slate-400")}>
                    {!isOpen ? "Restricted" : effectiveOccupancy}
                  </span>
                  {isOpen && (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {effectiveOccupancy === 1 ? 'Person' : 'People'}
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
                  {!isOpen ? "Facility Logging Disabled" : effectiveOccupancy === 0 ? "No one inside" : "Active Session Tracking"}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Unit Utilization</span>
                <Building2 className="h-4 w-4 text-primary/60" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary tracking-tight">{collegeData.length}</div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Active Departmental Units</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border rounded-xl bg-slate-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Next Schedule Shift</span>
                <Clock className="h-4 w-4 text-primary/60" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-primary truncate">{nextEvent}</div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 italic">Institutional Timing</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-4 border-b p-6 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest">
                <History className="h-4 w-4 text-primary" />
                Live Registry History
              </CardTitle>
              <Badge variant="outline" className="text-[9px] font-bold uppercase">{recentVisits?.length || 0} Recent</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[450px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest px-6">Visitor</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest">Department</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest px-6 text-right">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingRecent ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-20 uppercase font-bold text-[9px] tracking-widest text-muted-foreground animate-pulse">Syncing Registry...</TableCell></TableRow>
                    ) : recentVisits?.length === 0 ? (
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
            <CardFooter className="bg-slate-50 border-t p-3 flex justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate?.('visitor-log')}
                className="text-[9px] font-bold uppercase tracking-widest text-primary gap-2"
              >
                Access Full Institutional Registry
                <ArrowRight className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className={cn("shadow-sm border-none rounded-xl overflow-hidden ring-1", isManual ? "ring-amber-500/30 bg-amber-50/50" : "ring-primary/10 bg-white")}>
            <CardHeader className={cn("p-6 text-white flex flex-row items-center justify-between shadow-sm", isManual ? "bg-amber-600" : "bg-primary")}>
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Library Control Protocol</CardTitle>
              </div>
              <Settings className="h-4 w-4 opacity-40" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Current Strategy</span>
                  <Badge variant={isManual ? "secondary" : "default"} className="text-[8px] font-black uppercase h-5 px-2">
                    {isManual ? "Manual Override" : "Automatic Schedule"}
                  </Badge>
                </div>
                
                {isManual && (
                  <div className="p-4 bg-amber-100/50 border border-amber-200 rounded-lg space-y-2">
                    <p className="text-[9px] font-bold text-amber-900 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert className="h-3 w-3" /> Priority Access Restricted
                    </p>
                    {reason && <p className="text-[10px] font-medium text-amber-800 italic leading-relaxed">"{reason}"</p>}
                    <p className="text-[8px] font-bold text-amber-700/60 uppercase tracking-widest border-t border-amber-200 pt-2 mt-2">
                      Category: {category}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOverride('manual', 'open')}
                    disabled={isUpdatingStatus}
                    className="h-10 text-[9px] font-bold uppercase tracking-widest gap-2 rounded-lg border-2 hover:bg-green-50 hover:text-green-700 hover:border-green-200 shadow-sm"
                  >
                    <Power className="h-3.5 w-3.5" />
                    Force Open
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOverride('manual', 'closed')}
                    disabled={isUpdatingStatus}
                    className="h-10 text-[9px] font-bold uppercase tracking-widest gap-2 rounded-lg border-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200 shadow-sm"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Force Close
                  </Button>
                </div>

                {isManual && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleOverride('automatic')}
                    disabled={isUpdatingStatus}
                    className="w-full h-10 text-[9px] font-bold uppercase tracking-widest gap-2 rounded-lg shadow-md"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore System Schedule
                  </Button>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Megaphone className="h-3 w-3" /> Announcement Type
                  </label>
                  <Select value={manualCategory} onValueChange={(v: AnnouncementCategory) => setManualCategory(v)}>
                    <SelectTrigger className="h-10 text-[10px] font-bold uppercase tracking-widest rounded-lg border-2 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="general" className="text-[10px] font-bold uppercase tracking-widest">General Announcement</SelectItem>
                      <SelectItem value="emergency" className="text-[10px] font-bold uppercase tracking-widest text-red-600">Emergency Notice</SelectItem>
                      <SelectItem value="institutional" className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Institutional Suspension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Institutional Note
                  </label>
                  <Textarea 
                    placeholder="Provide a formal reason for closure..." 
                    value={manualReason}
                    onChange={(e) => setManualReason(e.target.value)}
                    className="min-h-[100px] text-[10px] font-medium rounded-lg border-2 resize-none bg-white p-3"
                  />
                  <p className="text-[8px] text-muted-foreground italic mt-1">Note: This message will be broadcasted to all Student and Guest portals.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border rounded-xl bg-slate-50/50 p-6">
            <div className="flex items-center gap-3 text-primary mb-4">
              <Activity className="h-4 w-4" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">System Health</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 font-bold text-[9px] uppercase tracking-widest">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                Registry Core: Operational
              </div>
              <div className="flex items-center gap-2 text-green-600 font-bold text-[9px] uppercase tracking-widest">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                Auth Gateway: Secured
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
