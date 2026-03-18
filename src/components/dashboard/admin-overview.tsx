
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Users, 
  History, 
  TrendingUp, 
  Filter, 
  BarChart3, 
  PieChart, 
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
  MessageSquare
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { collection, limit, orderBy, query, doc, serverTimestamp } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
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
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLibraryStatus } from "@/hooks/use-library-status";
import { useToast } from "@/hooks/use-toast";

interface AdminOverviewProps {
  onNavigate?: (view: any) => void;
}

export function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const firestore = useFirestore();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { isOpen, label, nextEvent, isManual, reason } = useLibraryStatus();
  
  const [manualReason, setManualReason] = useState("");
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

  const activeOccupancy = allVisits?.filter(v => !v.exitTimestamp).length || 0;

  const purposeData = allVisits ? Object.entries(
    allVisits.reduce((acc: any, visit) => {
      acc[visit.purpose] = (acc[visit.purpose] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })) : [];

  const collegeData = allVisits ? Object.entries(
    allVisits.reduce((acc: any, visit) => {
      acc[visit.college] = (acc[visit.college] || 0) + 1;
      return acc;
    }, {})
  ).map(([college, visits]) => ({ college, visits }))
  .sort((a, b) => b.visits - a.visits) : [];

  const avgDuration = allVisits 
    ? Math.round(allVisits.filter(v => !!v.exitTimestamp).reduce((acc, v) => acc + (v.durationMinutes || 0), 0) / (allVisits.filter(v => !!v.exitTimestamp).length || 1)) || 0
    : 0;

  const handleOverride = (mode: 'automatic' | 'manual', status?: 'open' | 'closed') => {
    if (!firestore || !profile) return;
    
    setIsUpdatingStatus(true);
    const configRef = doc(firestore, 'library_config', 'main');
    
    setDocumentNonBlocking(configRef, {
      mode,
      manualStatus: status || null,
      manualReason: status === 'closed' ? manualReason : "",
      updatedBy: profile.id,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => {
      setIsUpdatingStatus(false);
      toast({
        title: mode === 'automatic' ? "Automatic Mode Restored" : `Manual ${status?.toUpperCase()} Active`,
        description: "The institutional access protocol has been updated.",
      });
      if (mode === 'automatic') setManualReason("");
    }, 500);
  };

  const stats = [
    { title: "Total Logs", value: allVisits?.length || "0", icon: Users },
    { title: "Active Occupancy", value: isOpen ? activeOccupancy : 0, icon: ShieldCheck },
    { title: "Avg. Duration", value: `${avgDuration}m`, icon: Clock },
    { title: "Unit Coverage", value: collegeData.length || "0", icon: Building2 },
  ];

  const chartConfig = {
    visits: { label: "Visits", color: "hsl(var(--primary))" },
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
        <div className="flex items-center gap-3">
          <div className="bg-white border rounded-lg p-1.5 px-3 flex items-center gap-3 shadow-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-700">Audit Range: Today</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="shadow-sm border-border hover:shadow-md transition-shadow rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</span>
                  <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-primary italic">{stat.value}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-sm rounded-lg">
              <CardHeader className="pb-4 border-b p-6">
                <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
                  <Building2 className="h-4 w-4 text-primary" />
                  Unit Utilization
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : collegeData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart data={collegeData} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="college" type="category" axisLine={false} tickLine={false} width={80} className="text-[9px] font-bold uppercase" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-[10px] italic uppercase">No data found</div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm rounded-lg">
              <CardHeader className="pb-4 border-b p-6">
                <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
                  <PieChart className="h-4 w-4 text-primary" />
                  Activity Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center pt-6">
                {isLoading ? (
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : purposeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={purposeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        {purposeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground text-[10px] italic uppercase">Empty Registry</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className={cn("shadow-lg border-none rounded-xl overflow-hidden ring-1", isManual ? "ring-amber-500/30 bg-amber-50/50" : "ring-primary/10 bg-white")}>
            <CardHeader className={cn("p-6 text-white flex flex-row items-center justify-between", isManual ? "bg-amber-600" : "bg-primary")}>
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Control Protocol</CardTitle>
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
                  <div className="p-3 bg-amber-100/50 border border-amber-200 rounded-lg space-y-2">
                    <p className="text-[9px] font-bold text-amber-900 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert className="h-3 w-3" /> Manual Control Active
                    </p>
                    {reason && <p className="text-[10px] font-medium text-amber-800 italic">{reason}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOverride('manual', 'open')}
                    disabled={isUpdatingStatus}
                    className="h-10 text-[9px] font-bold uppercase tracking-widest gap-2 rounded-lg border-2 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                  >
                    <Power className="h-3.5 w-3.5" />
                    Force Open
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOverride('manual', 'closed')}
                    disabled={isUpdatingStatus}
                    className="h-10 text-[9px] font-bold uppercase tracking-widest gap-2 rounded-lg border-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
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
                    className="w-full h-10 text-[9px] font-bold uppercase tracking-widest gap-2 rounded-lg shadow-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore Automatic
                  </Button>
                )}
              </div>

              {/* Reason input for Manual Close */}
              <div className="space-y-3 pt-4 border-t">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> Closure Announcement
                </label>
                <Input 
                  placeholder="e.g. Typhoon Suspension, Holiday..." 
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="h-10 text-[10px] font-medium rounded-lg border-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
                <History className="h-4 w-4 text-primary" />
                Live Registry
              </CardTitle>
              <div className={cn("h-2 w-2 rounded-full", isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[350px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest px-6">Name</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest px-6 text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingRecent ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-20 uppercase font-bold text-[9px] tracking-widest text-muted-foreground animate-pulse">Syncing Registry...</TableCell></TableRow>
                    ) : recentVisits?.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-20 italic text-[10px] uppercase">No Logs Recorded</TableCell></TableRow>
                    ) : recentVisits?.map((visit, i) => (
                      <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-bold px-6 text-xs">{visit.userName}</TableCell>
                        <TableCell>
                          <span className={cn("text-[9px] font-bold uppercase", visit.exitTimestamp ? "text-green-600" : "text-amber-600 animate-pulse")}>
                            {visit.exitTimestamp ? `Stay: ${visit.durationMinutes}m` : "Active"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[9px] font-bold px-6 text-right uppercase italic">
                          {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'h:mm a') : 'Now'}
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
                Full Registry history
                <ArrowRight className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
