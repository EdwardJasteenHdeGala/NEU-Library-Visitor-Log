
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, History, TrendingUp, Filter, BarChart3, PieChart, Building2, LayoutDashboard, Loader2 } from "lucide-react";
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

export function AdminOverview() {
  const firestore = useFirestore();
  const { profile } = useAuth();
  
  // Ensure we only fetch if the user has confirmed admin role to prevent permission errors
  const isAdmin = profile?.role === 'admin';

  const visitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(5));
  }, [firestore, isAdmin]);

  const allVisitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(500));
  }, [firestore, isAdmin]);

  const { data: recentVisits, isLoading: isLoadingRecent } = useCollection(visitsQuery);
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

  const stats = [
    { title: "Today's Logs", value: allVisits?.length || "0", icon: Users, color: "bg-primary" },
    { title: "Peak Occupancy", value: "88%", icon: History, color: "bg-chart-3" },
    { title: "Active Depts", value: "12", icon: Building2, color: "bg-chart-4" },
    { title: "Growth", value: "+12%", icon: TrendingUp, color: "bg-secondary" },
  ];

  const chartConfig = {
    visits: { label: "Visits", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black text-[9px] uppercase tracking-[0.4em] opacity-60">
             <LayoutDashboard className="h-4 w-4" />
             Institutional Dashboard
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-primary italic tracking-tighter uppercase leading-none">Intelligence</h2>
          <p className="text-muted-foreground font-medium text-sm md:text-lg opacity-70">Real-time analytical data streaming.</p>
        </div>
        <div className="flex items-center">
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border flex items-center gap-4 text-[10px] font-black text-muted-foreground px-5">
            <Filter className="h-4 w-4 text-primary" />
            <Select defaultValue="today">
              <SelectTrigger className="border-none bg-transparent h-8 w-[120px] shadow-none p-0 focus:ring-0 font-black text-primary text-[10px] uppercase tracking-widest">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-3xl p-2">
                <SelectItem value="today" className="text-[10px] font-black uppercase tracking-widest rounded-xl">Today</SelectItem>
                <SelectItem value="week" className="text-[10px] font-black uppercase tracking-widest rounded-xl">This Week</SelectItem>
                <SelectItem value="month" className="text-[10px] font-black uppercase tracking-widest rounded-xl">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="neu-card-shadow border-none overflow-hidden hover:scale-[1.03] transition-all duration-500 bg-white rounded-3xl group">
            <div className={`h-1.5 ${stat.color} opacity-80`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-6 md:p-8">
              <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-500" />
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0">
              <div className="flex items-end justify-between">
                <span className="text-3xl md:text-5xl font-black text-primary leading-none tracking-tighter">{stat.value}</span>
                <div className="p-3 md:p-4 rounded-2xl bg-muted/50 group-hover:bg-primary/5 transition-colors duration-500">
                    <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        <Card className="lg:col-span-7 neu-card-shadow border-none rounded-[2.5rem] bg-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 md:p-10 pb-4">
            <CardTitle className="text-xl md:text-2xl font-black text-primary flex items-center gap-4 uppercase italic tracking-tighter">
              <Building2 className="h-6 w-6 text-secondary" />
              Units
            </CardTitle>
            <CardDescription className="text-sm font-medium opacity-70">Utilization counts across institutional units.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[350px] p-6 md:p-10 pt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest">Synthesizing...</span>
              </div>
            ) : collegeData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={collegeData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="college" type="category" axisLine={false} tickLine={false} width={80} className="text-[9px] font-black uppercase tracking-tighter" />
                  <ChartTooltip content={<ChartTooltipContent className="rounded-2xl border-none shadow-3xl p-4" />} />
                  <Bar 
                    dataKey="visits" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 8, 8, 0]} 
                    barSize={14}
                  >
                    {collegeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} className="hover:opacity-80 transition-opacity duration-500" />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-5 italic font-medium">
                <BarChart3 className="h-10 w-10 opacity-10" />
                <span className="text-sm">Awaiting synchronization...</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 neu-card-shadow border-none rounded-[2.5rem] bg-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 md:p-10 pb-4">
            <CardTitle className="text-xl md:text-2xl font-black text-primary flex items-center gap-4 uppercase italic tracking-tighter">
              <PieChart className="h-6 w-6 text-secondary" />
              Core Use
            </CardTitle>
            <CardDescription className="text-sm font-medium opacity-70">Contextual distribution of hub activities.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[350px] p-6 md:p-10 flex items-center justify-center">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 animate-pulse">
                 <Loader2 className="h-8 w-8 animate-spin" />
                 <span className="text-xs font-black uppercase tracking-widest">Analyzing...</span>
               </div>
            ) : purposeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={purposeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {purposeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-5 italic font-medium">
                 <PieChart className="h-10 w-10 opacity-10" />
                 <span className="text-sm">No activity telemetry</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
        <CardHeader className="border-b bg-muted/20 p-8 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-4 uppercase italic tracking-tighter">
                <History className="h-6 w-6 text-secondary" />
                Live Registry
              </CardTitle>
              <CardDescription className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60">Real-time Telemetry Stream</CardDescription>
            </div>
            <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(22,163,74,0.5)] border-2 border-white" />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-none hover:bg-muted/30">
                <TableHead className="font-black py-5 uppercase text-[9px] tracking-[0.3em] px-8">Institutional Visitor</TableHead>
                <TableHead className="font-black py-5 uppercase text-[9px] tracking-[0.3em] hidden sm:table-cell">Unit</TableHead>
                <TableHead className="font-black py-5 uppercase text-[9px] tracking-[0.3em]">Context</TableHead>
                <TableHead className="font-black py-5 uppercase text-[9px] tracking-[0.3em] px-8 text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRecent ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20 text-sm font-bold text-muted-foreground animate-pulse">Syncing institutional records...</TableCell></TableRow>
              ) : recentVisits?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20 text-sm text-muted-foreground italic font-medium">No live telemetry detected.</TableCell></TableRow>
              ) : recentVisits?.map((visit, i) => (
                <TableRow key={i} className="hover:bg-muted/10 border-b transition-colors duration-300">
                  <TableCell className="font-black py-6 text-primary px-8 text-base tracking-tight">{visit.userName}</TableCell>
                  <TableCell className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">{visit.college}</TableCell>
                  <TableCell>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-secondary/10 text-primary px-4 py-1.5 rounded-full border border-secondary/20">
                      {visit.purpose}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[10px] font-black uppercase tracking-widest px-8 italic text-right">
                    {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'h:mm a') : 'Streaming'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
