
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Users, History, TrendingUp, Filter, BarChart3, PieChart, Building2, LayoutDashboard, Loader2, ArrowRight, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
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
import { cn } from "@/lib/utils";

interface AdminOverviewProps {
  onNavigate?: (view: any) => void;
}

export function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const firestore = useFirestore();
  const { profile } = useAuth();
  
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
    ? Math.round(allVisits.reduce((acc, v) => acc + (v.durationMinutes || 0), 0) / allVisits.length) || 0
    : 0;

  const stats = [
    { title: "Total Logs", value: allVisits?.length || "0", icon: Users, color: "bg-primary" },
    { title: "Avg. Duration", value: `${avgDuration}m`, icon: Clock, color: "bg-chart-3" },
    { title: "Dept. Coverage", value: collegeData.length || "0", icon: Building2, color: "bg-chart-4" },
    { title: "Return Rate", value: "+14%", icon: TrendingUp, color: "bg-secondary" },
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
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Facility Utilization Metrics</p>
        </div>
        <div className="bg-white border rounded-lg p-1.5 px-3 flex items-center gap-3 shadow-sm">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <Select defaultValue="today">
            <SelectTrigger className="border-none bg-transparent h-7 w-[90px] shadow-none p-0 focus:ring-0 font-bold text-[9px] uppercase tracking-widest">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="today" className="text-[9px] font-bold uppercase">Today</SelectItem>
              <SelectItem value="week" className="text-[9px] font-bold uppercase">Week</SelectItem>
              <SelectItem value="month" className="text-[9px] font-bold uppercase">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-sm border-border hover:shadow-md transition-shadow rounded-xl">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-7 shadow-sm rounded-xl">
          <CardHeader className="pb-4 border-b p-6">
            <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
              <Building2 className="h-4 w-4 text-primary" />
              Unit Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
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

        <Card className="lg:col-span-5 shadow-sm rounded-xl">
          <CardHeader className="pb-4 border-b p-6">
            <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
              <PieChart className="h-4 w-4 text-primary" />
              Activity Scope
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center pt-6">
            {isLoading ? (
               <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : purposeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={purposeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {purposeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground text-[10px] italic uppercase">Empty Registry</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b p-6 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
              <History className="h-4 w-4 text-primary" />
              Live Access Registry
            </CardTitle>
          </div>
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse ring-4 ring-green-50" />
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="text-[9px] font-bold uppercase tracking-widest px-6">Name</TableHead>
                  <TableHead className="text-[9px] font-bold uppercase tracking-widest">Unit</TableHead>
                  <TableHead className="text-[9px] font-bold uppercase tracking-widest">Duration</TableHead>
                  <TableHead className="text-[9px] font-bold uppercase tracking-widest px-6 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRecent ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 uppercase font-bold text-[10px] tracking-widest text-muted-foreground animate-pulse">Syncing Archive...</TableCell></TableRow>
                ) : recentVisits?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-[10px] uppercase">No Logs Today</TableCell></TableRow>
                ) : recentVisits?.map((visit, i) => (
                  <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold px-6 text-xs">{visit.userName}</TableCell>
                    <TableCell className="text-[9px] font-bold text-muted-foreground uppercase">{visit.college}</TableCell>
                    <TableCell>
                      <span className={cn("text-[9px] font-bold uppercase", visit.exitTimestamp ? "text-green-600" : "text-amber-600 animate-pulse")}>
                        {visit.exitTimestamp ? `${visit.durationMinutes}m` : "Active"}
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
            Access Full Registry History
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
