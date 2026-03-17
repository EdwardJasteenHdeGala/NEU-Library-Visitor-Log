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

export function AdminOverview() {
  const firestore = useFirestore();

  const visitsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(5));
  }, [firestore]);

  const allVisitsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(500));
  }, [firestore]);

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
    { title: "Today's Visits", value: allVisits?.length || "0", icon: Users, color: "bg-primary", trend: "+12.5%" },
    { title: "Weekly Engagement", value: "114", icon: TrendingUp, color: "bg-secondary", trend: "+5.2%" },
    { title: "Peak Occupancy", value: "88%", icon: History, color: "bg-blue-600", trend: "Stable" },
    { title: "Active Depts", value: "12", icon: Building2, color: "bg-orange-600", trend: "Full Scope" },
  ];

  const chartConfig = {
    visits: { label: "Visits", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-20 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] mb-1">
             <LayoutDashboard className="h-4 w-4" />
             Institutional Dashboard
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-primary italic tracking-tighter uppercase leading-none">Overview</h2>
          <p className="text-muted-foreground font-medium text-base md:text-lg italic opacity-80">Real-time engagement analytics.</p>
        </div>
        <div className="flex items-center">
          <div className="bg-white p-2 md:p-3 rounded-2xl shadow-xl border flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-black text-muted-foreground px-4 md:px-6 group transition-all">
            <Filter className="h-4 w-4 text-primary" />
            <span className="uppercase tracking-widest opacity-60 hidden xs:inline">Range:</span>
            <Select defaultValue="today">
              <SelectTrigger className="border-none bg-transparent h-6 w-[100px] md:w-[120px] shadow-none p-0 focus:ring-0 font-black text-primary text-[9px] md:text-[10px] uppercase tracking-widest">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                <SelectItem value="today" className="text-xs font-black uppercase tracking-widest">Today</SelectItem>
                <SelectItem value="week" className="text-xs font-black uppercase tracking-widest">This Week</SelectItem>
                <SelectItem value="month" className="text-xs font-black uppercase tracking-widest">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="neu-card-shadow border-none overflow-hidden hover:-translate-y-1 transition-all duration-300 bg-white rounded-2xl md:rounded-[2rem] group">
            <div className={`h-1.5 ${stat.color} opacity-80`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-4 p-4 md:p-6">
              <CardTitle className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-4xl md:text-5xl font-black text-primary leading-none tracking-tighter">{stat.value}</span>
                  {stat.trend && <p className="text-[8px] md:text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                     <TrendingUp className="h-3 w-3" />
                     {stat.trend}
                  </p>}
                </div>
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-muted/50 group-hover:bg-primary/5 transition-colors">
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <Card className="lg:col-span-7 neu-card-shadow border-none rounded-2xl md:rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-6 md:p-10 pb-2 md:pb-2">
            <CardTitle className="text-xl md:text-2xl font-black text-primary flex items-center gap-3 md:gap-4 uppercase italic tracking-tighter">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
              Departments
            </CardTitle>
            <CardDescription className="text-sm md:text-base font-medium opacity-70">Visitation counts grouped by academic department.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[400px] p-4 md:p-10 pt-4 md:pt-4">
            {collegeData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={collegeData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="college" type="category" axisLine={false} tickLine={false} width={80} className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter" />
                  <ChartTooltip content={<ChartTooltipContent className="rounded-2xl border-none shadow-2xl p-4" />} />
                  <Bar 
                    dataKey="visits" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 8, 8, 0]} 
                    barSize={20}
                  >
                    {collegeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 italic font-medium">
                <BarChart3 className="h-10 w-10 md:h-12 md:w-12 opacity-10" />
                Awaiting institutional log entries...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 neu-card-shadow border-none rounded-2xl md:rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-6 md:p-10 pb-2">
            <CardTitle className="text-xl md:text-2xl font-black text-primary flex items-center gap-3 md:gap-4 uppercase italic tracking-tighter">
              <PieChart className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
              Hub Context
            </CardTitle>
            <CardDescription className="text-sm md:text-base font-medium opacity-70">Core activity distribution across the Hub.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[400px] p-4 md:p-10 flex items-center justify-center">
            {purposeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={purposeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {purposeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 italic font-medium">
                 <PieChart className="h-10 w-10 md:h-12 md:w-12 opacity-10" />
                 No distribution data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-white">
        <CardHeader className="border-b bg-muted/20 p-6 md:p-10 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl md:text-2xl font-black text-primary flex items-center gap-3 md:gap-4 uppercase italic tracking-tighter">
                <History className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                Live Registry
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Synchronized Real-time</CardDescription>
            </div>
            <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(22,163,74,0.5)]" />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-none hover:bg-muted/30">
                <TableHead className="font-black py-4 md:py-6 uppercase text-[8px] md:text-[9px] tracking-[0.3em] px-6 md:px-10">Visitor Identity</TableHead>
                <TableHead className="font-black py-4 md:py-6 uppercase text-[8px] md:text-[9px] tracking-[0.3em] hidden sm:table-cell">Institutional Role</TableHead>
                <TableHead className="font-black py-4 md:py-6 uppercase text-[8px] md:text-[9px] tracking-[0.3em]">Context</TableHead>
                <TableHead className="font-black py-4 md:py-6 uppercase text-[8px] md:text-[9px] tracking-[0.3em] px-6 md:px-10 text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12 md:py-20 font-bold text-muted-foreground animate-pulse">Synchronizing records...</TableCell></TableRow>
              ) : recentVisits?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12 md:py-20 text-muted-foreground italic font-medium">No recent visitation data recorded today.</TableCell></TableRow>
              ) : recentVisits?.map((visit, i) => (
                <TableRow key={i} className="hover:bg-muted/10 border-b transition-colors">
                  <TableCell className="font-black py-5 md:py-7 text-primary px-6 md:px-10 text-sm md:text-base">{visit.userName}</TableCell>
                  <TableCell className="text-xs font-bold uppercase tracking-tight text-muted-foreground hidden sm:table-cell">{visit.college}</TableCell>
                  <TableCell>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-secondary/15 text-primary px-3 md:px-4 py-1.5 rounded-full border border-secondary/20 shadow-sm whitespace-nowrap">
                      {visit.purpose}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[10px] md:text-xs font-black uppercase tracking-widest px-6 md:px-10 italic text-right">
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