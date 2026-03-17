"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, History, MessageSquare, AlertCircle, TrendingUp, Filter, BarChart3, PieChart, Building2, LayoutDashboard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
    { title: "Today's Visits", value: allVisits?.length || "0", icon: Users, color: "bg-primary", trend: "+12.5%", colorHex: "hsl(var(--primary))" },
    { title: "Weekly Engagement", value: "114", icon: TrendingUp, color: "bg-secondary", trend: "+5.2%", colorHex: "hsl(var(--secondary))" },
    { title: "Peak Occupancy", value: "88%", icon: History, color: "bg-blue-600", trend: "Stable", colorHex: "#2563eb" },
    { title: "Active Depts", value: "12", icon: Building2, color: "bg-orange-600", trend: "Full Scope", colorHex: "#ea580c" },
  ];

  const chartConfig = {
    visits: {
      label: "Visits",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.3em] mb-1">
             <LayoutDashboard className="h-4 w-4" />
             System Overview
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-primary italic tracking-tighter uppercase leading-none">Management Dashboard</h2>
          <p className="text-muted-foreground font-medium text-lg">Real-time institutional engagement analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-black text-muted-foreground px-6 group hover:border-primary/20 transition-all">
            <Filter className="h-4 w-4 text-primary group-hover:rotate-180 transition-transform duration-500" />
            <span className="uppercase tracking-widest opacity-60">Timeframe:</span>
            <Select defaultValue="today">
              <SelectTrigger className="border-none bg-transparent h-6 w-[120px] shadow-none p-0 focus:ring-0 font-black text-primary text-xs uppercase tracking-widest">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="neu-card-shadow border-none overflow-hidden hover:-translate-y-1 transition-all duration-300 bg-white rounded-3xl group">
            <div className={`h-2 ${stat.color} opacity-80`} />
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-5xl font-black text-primary leading-none tracking-tighter">{stat.value}</span>
                  {stat.trend && <p className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                     <TrendingUp className="h-3 w-3" />
                     {stat.trend}
                  </p>}
                </div>
                <div className="p-3 rounded-2xl bg-muted/50 group-hover:bg-primary/5 transition-colors">
                    <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <Card className="lg:col-span-7 neu-card-shadow border-none rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-10 pb-2">
            <CardTitle className="text-2xl font-black text-primary flex items-center gap-4 uppercase italic tracking-tighter">
              <Building2 className="h-6 w-6 text-secondary" />
              Department Statistics
            </CardTitle>
            <CardDescription className="text-base font-medium">Visitation counts grouped by academic department and level.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] p-10 pt-4">
            {collegeData.length > 0 ? (
              <ChartContainer config={chartConfig}>
                <BarChart data={collegeData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="college" type="category" axisLine={false} tickLine={false} width={100} className="text-[10px] font-black uppercase tracking-tighter" />
                  <ChartTooltip content={<ChartTooltipContent className="rounded-2xl border-none shadow-2xl p-4" />} />
                  <Bar 
                    dataKey="visits" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 8, 8, 0]} 
                    barSize={24}
                  >
                    {collegeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 italic font-medium">
                <BarChart3 className="h-12 w-12 opacity-10" />
                Awaiting institutional log entries...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 neu-card-shadow border-none rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-10 pb-2">
            <CardTitle className="text-2xl font-black text-primary flex items-center gap-4 uppercase italic tracking-tighter">
              <PieChart className="h-6 w-6 text-secondary" />
              Visit Distribution
            </CardTitle>
            <CardDescription className="text-base font-medium">Core activity distribution across the library hub.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] p-10 flex items-center justify-center">
            {purposeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={purposeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {purposeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 italic font-medium">
                 <PieChart className="h-12 w-12 opacity-10" />
                 No distribution data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <Card className="lg:col-span-8 neu-card-shadow border-none overflow-hidden rounded-[2.5rem] bg-white">
          <CardHeader className="border-b bg-muted/20 p-8 md:p-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-black text-primary flex items-center gap-4 uppercase italic tracking-tighter">
                <History className="h-6 w-6 text-secondary" />
                Live Visitor Stream
              </CardTitle>
              <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-none hover:bg-muted/30">
                  <TableHead className="font-black py-6 uppercase text-[10px] tracking-[0.2em] px-10">Identity</TableHead>
                  <TableHead className="font-black py-6 uppercase text-[10px] tracking-[0.2em]">Affiliation</TableHead>
                  <TableHead className="font-black py-6 uppercase text-[10px] tracking-[0.2em]">Context</TableHead>
                  <TableHead className="font-black py-6 uppercase text-[10px] tracking-[0.2em] px-10">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-16 font-bold text-muted-foreground animate-pulse">Synchronizing records...</TableCell></TableRow>
                ) : recentVisits?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-16 text-muted-foreground italic font-medium">No recent visitation data recorded today.</TableCell></TableRow>
                ) : recentVisits?.map((visit, i) => (
                  <TableRow key={i} className="hover:bg-muted/20 border-b transition-colors">
                    <TableCell className="font-black py-6 text-primary px-10 text-base">{visit.userName}</TableCell>
                    <TableCell className="text-sm font-bold uppercase tracking-tight text-muted-foreground">{visit.college}</TableCell>
                    <TableCell>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-secondary/15 text-primary px-4 py-1.5 rounded-full border border-secondary/20">
                        {visit.purpose}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-black uppercase tracking-widest px-10">
                      {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'h:mm a') : 'Now'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 neu-card-shadow border-none rounded-[2.5rem] bg-white p-10 space-y-10">
          <div className="space-y-4">
            <CardTitle className="text-2xl font-black text-primary flex items-center gap-4 uppercase italic tracking-tighter">
              <AlertCircle className="h-6 w-6 text-secondary" />
              Quick Filters
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">Isolate specific visitation metrics for audit.</p>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Usage Purpose</Label>
              <Select defaultValue="all">
                <SelectTrigger className="rounded-[1.25rem] h-16 border-2 border-muted bg-muted/10 font-black text-sm uppercase px-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                  <SelectItem value="all" className="font-bold text-xs">All Purposes</SelectItem>
                  <SelectItem value="reading books" className="font-bold text-xs">Reading Books</SelectItem>
                  <SelectItem value="research in thesis" className="font-bold text-xs">Thesis Research</SelectItem>
                  <SelectItem value="use of computer" className="font-bold text-xs">Digital Lab</SelectItem>
                  <SelectItem value="doing assignments" className="font-bold text-xs">Assignments</SelectItem>
                  <SelectItem value="group study" className="font-bold text-xs">Group Study</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Institutional Level</Label>
              <Select defaultValue="all">
                <SelectTrigger className="rounded-[1.25rem] h-16 border-2 border-muted bg-muted/10 font-black text-sm uppercase px-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                  <SelectItem value="all" className="font-bold text-xs">All Affiliations</SelectItem>
                  <SelectItem value="CICS" className="font-bold text-xs">CICS Studies</SelectItem>
                  <SelectItem value="CEA" className="font-bold text-xs">CEA Engineering</SelectItem>
                  <SelectItem value="CAS" className="font-bold text-xs">CAS Arts/Sciences</SelectItem>
                  <SelectItem value="SHS" className="font-bold text-xs">Senior High (SHS)</SelectItem>
                  <SelectItem value="HS" className="font-bold text-xs">High School (HS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-6 border-t">
             <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">System Integrity</p>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                   Data is synchronized in real-time with Google Cloud. Audit logs are preserved for 12 academic months.
                </p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}