"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, History, TrendingUp, Filter, BarChart3, PieChart, Building2, LayoutDashboard } from "lucide-react";
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
  const isAdmin = profile?.role === 'admin';

  const visitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(5));
  }, [firestore, isAdmin]);

  const allVisitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(500));
  }, [firestore, isAdmin]);

  const { data: recentVisits, isLoading } = useCollection(visitsQuery);
  const { data: allVisits } = useCollection(allVisitsQuery);

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
    { title: "Peak Occupancy", value: "88%", icon: History, color: "bg-blue-600" },
    { title: "Active Depts", value: "12", icon: Building2, color: "bg-orange-600" },
    { title: "Growth", value: "+12%", icon: TrendingUp, color: "bg-secondary" },
  ];

  const chartConfig = {
    visits: { label: "Visits", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black text-[8px] uppercase tracking-[0.3em] mb-0.5 opacity-60">
             <LayoutDashboard className="h-3.5 w-3.5" />
             Institutional Dashboard
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-primary italic tracking-tighter uppercase leading-none">Overview</h2>
          <p className="text-muted-foreground font-medium text-sm md:text-base italic opacity-70">Real-time analytical data.</p>
        </div>
        <div className="flex items-center">
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-lg border flex items-center gap-3 text-[9px] font-black text-muted-foreground px-4">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <Select defaultValue="today">
              <SelectTrigger className="border-none bg-transparent h-6 w-[100px] shadow-none p-0 focus:ring-0 font-black text-primary text-[9px] uppercase tracking-widest">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                <SelectItem value="today" className="text-[9px] font-black uppercase tracking-widest">Today</SelectItem>
                <SelectItem value="week" className="text-[9px] font-black uppercase tracking-widest">This Week</SelectItem>
                <SelectItem value="month" className="text-[9px] font-black uppercase tracking-widest">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="neu-card-shadow border-none overflow-hidden hover:scale-[1.02] transition-all duration-300 bg-white rounded-2xl group">
            <div className={`h-1 ${stat.color} opacity-70`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
              <CardTitle className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">{stat.title}</CardTitle>
              <stat.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="flex items-end justify-between">
                <span className="text-2xl md:text-4xl font-black text-primary leading-none tracking-tighter">{stat.value}</span>
                <div className="p-2 md:p-3 rounded-xl bg-muted/50 group-hover:bg-primary/5 transition-colors">
                    <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <Card className="lg:col-span-7 neu-card-shadow border-none rounded-[1.5rem] bg-white overflow-hidden">
          <CardHeader className="p-6 md:p-8 pb-2">
            <CardTitle className="text-lg md:text-xl font-black text-primary flex items-center gap-3 uppercase italic tracking-tighter">
              <Building2 className="h-5 w-5 text-secondary" />
              Departments
            </CardTitle>
            <CardDescription className="text-xs font-medium opacity-70">Visitation counts across academic departments.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] p-4 md:p-8 pt-4">
            {collegeData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={collegeData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="college" type="category" axisLine={false} tickLine={false} width={80} className="text-[8px] font-black uppercase tracking-tighter" />
                  <ChartTooltip content={<ChartTooltipContent className="rounded-xl border-none shadow-2xl p-4" />} />
                  <Bar 
                    dataKey="visits" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]} 
                    barSize={12}
                  >
                    {collegeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 italic font-medium">
                <BarChart3 className="h-8 w-8 opacity-10" />
                <span className="text-xs">Awaiting log entries...</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 neu-card-shadow border-none rounded-[1.5rem] bg-white overflow-hidden">
          <CardHeader className="p-6 md:p-8 pb-2">
            <CardTitle className="text-lg md:text-xl font-black text-primary flex items-center gap-3 uppercase italic tracking-tighter">
              <PieChart className="h-5 w-5 text-secondary" />
              Usage Context
            </CardTitle>
            <CardDescription className="text-xs font-medium opacity-70">Distribution of visitor core purposes.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] p-4 md:p-8 flex items-center justify-center">
            {purposeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={purposeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {purposeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 italic font-medium">
                 <PieChart className="h-8 w-8 opacity-10" />
                 <span className="text-xs">No distribution data</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-[1.5rem] bg-white">
        <CardHeader className="border-b bg-muted/20 p-6 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-black text-primary flex items-center gap-3 uppercase italic tracking-tighter">
                <History className="h-4 w-4 text-secondary" />
                Live Registry
              </CardTitle>
              <CardDescription className="text-[8px] font-bold uppercase tracking-widest opacity-60">Real-time Syncing</CardDescription>
            </div>
            <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.4)]" />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-none hover:bg-muted/30">
                <TableHead className="font-black py-4 uppercase text-[8px] tracking-[0.2em] px-6">Visitor</TableHead>
                <TableHead className="font-black py-4 uppercase text-[8px] tracking-[0.2em] hidden sm:table-cell">Dept</TableHead>
                <TableHead className="font-black py-4 uppercase text-[8px] tracking-[0.2em]">Context</TableHead>
                <TableHead className="font-black py-4 uppercase text-[8px] tracking-[0.2em] px-6 text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12 text-xs font-bold text-muted-foreground animate-pulse">Syncing records...</TableCell></TableRow>
              ) : recentVisits?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12 text-xs text-muted-foreground italic font-medium">No recent logs recorded.</TableCell></TableRow>
              ) : recentVisits?.map((visit, i) => (
                <TableRow key={i} className="hover:bg-muted/10 border-b transition-colors">
                  <TableCell className="font-black py-4 text-primary px-6 text-sm">{visit.userName}</TableCell>
                  <TableCell className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground hidden sm:table-cell">{visit.college}</TableCell>
                  <TableCell>
                    <span className="text-[7px] font-black uppercase tracking-widest bg-secondary/10 text-primary px-3 py-1 rounded-full border border-secondary/15">
                      {visit.purpose}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[9px] font-black uppercase tracking-widest px-6 italic text-right">
                    {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'h:mm a') : 'Now'}
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