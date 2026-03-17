
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, History, MessageSquare, AlertCircle, TrendingUp, Filter, BarChart3, PieChart, Building2 } from "lucide-react";
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

  // Process data for charts
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

  const trendData = [
    { day: "Mon", visits: 12 },
    { day: "Tue", visits: 18 },
    { day: "Wed", visits: 15 },
    { day: "Thu", visits: 25 },
    { day: "Fri", visits: 32 },
    { day: "Sat", visits: 8 },
    { day: "Sun", visits: 4 },
  ];

  const stats = [
    { title: "Today's Visits", value: allVisits?.length || "0", icon: Users, color: "bg-primary", trend: "+12% from yesterday" },
    { title: "Weekly Total", value: "114", icon: TrendingUp, color: "bg-secondary", trend: "+5% from last week" },
    { title: "Peak Hour", value: "14:00", icon: History, color: "bg-blue-600", trend: "Consistent with average" },
    { title: "Active Hubs", value: "8", icon: BarChart3, color: "bg-orange-600", trend: "Across all colleges" },
  ];

  const chartConfig = {
    visits: {
      label: "Visits",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary mb-2 italic">DASHBOARD ANALYTICS</h2>
          <p className="text-muted-foreground font-medium">Real-time visualization of institutional library engagement.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-xl shadow-sm border flex items-center gap-2 text-sm font-bold text-muted-foreground px-4">
            <Filter className="h-4 w-4 text-primary" />
            Time Range:
            <Select defaultValue="today">
              <SelectTrigger className="border-none bg-transparent h-8 w-[120px] shadow-none p-0 focus:ring-0 font-black text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="neu-card-shadow border-none overflow-hidden hover:scale-[1.02] transition-transform bg-white rounded-2xl">
            <div className={`h-1.5 ${stat.color}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-4xl font-black text-primary leading-none">{stat.value}</span>
                  {stat.trend && <p className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">{stat.trend}</p>}
                </div>
                <div className={`p-2 rounded-lg ${stat.color}/10 text-primary`}>
                    <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="neu-card-shadow border-none rounded-2xl bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-black text-primary flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              COLLEGE TALLY
            </CardTitle>
            <CardDescription>Visitation counts grouped by academic department.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {collegeData.length > 0 ? (
              <ChartContainer config={chartConfig}>
                <BarChart data={collegeData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="college" type="category" axisLine={false} tickLine={false} width={80} className="text-[10px] font-black" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="visits" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]} 
                    barSize={20}
                  >
                    {collegeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">Waiting for logs...</div>
            )}
          </CardContent>
        </Card>

        <Card className="neu-card-shadow border-none rounded-2xl bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-black text-primary flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              VISIT PURPOSE BREAKDOWN
            </CardTitle>
            <CardDescription>Distribution of library usage by activity type.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            {purposeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={purposeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {purposeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground italic text-sm">No data for distribution chart</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 neu-card-shadow border-none overflow-hidden rounded-2xl bg-white">
          <CardHeader className="border-b bg-muted/20 p-6">
            <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
              <History className="h-5 w-5" />
              LATEST VISITOR ENTRIES
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-none">
                  <TableHead className="font-black py-4 uppercase text-[10px] tracking-widest">Visitor Name</TableHead>
                  <TableHead className="font-black py-4 uppercase text-[10px] tracking-widest">College</TableHead>
                  <TableHead className="font-black py-4 uppercase text-[10px] tracking-widest">Purpose</TableHead>
                  <TableHead className="font-black py-4 uppercase text-[10px] tracking-widest">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Loading logs...</TableCell></TableRow>
                ) : recentVisits?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">No recent visits recorded.</TableCell></TableRow>
                ) : recentVisits?.map((visit, i) => (
                  <TableRow key={i} className="hover:bg-muted/30 border-b">
                    <TableCell className="font-bold py-4 text-primary">{visit.userName}</TableCell>
                    <TableCell className="text-sm font-medium">{visit.college}</TableCell>
                    <TableCell>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-secondary/20 text-primary px-3 py-1 rounded-full border border-secondary/30">
                        {visit.purpose}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-bold">
                      {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'h:mm a') : 'Just now'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="neu-card-shadow border-none rounded-2xl bg-white">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-secondary" />
              QUICK FILTERS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">By Purpose</Label>
              <Select defaultValue="all">
                <SelectTrigger className="rounded-xl h-12 border-2 border-muted"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="reading books">Reading Books</SelectItem>
                  <SelectItem value="research in thesis">Thesis Research</SelectItem>
                  <SelectItem value="use of computer">Use of Computer</SelectItem>
                  <SelectItem value="doing assignments">Doing Assignments</SelectItem>
                  <SelectItem value="group study">Group Study</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="charging device">Charging Device</SelectItem>
                  <SelectItem value="resting/waiting">Resting/Waiting</SelectItem>
                  <SelectItem value="printing/scanning">Printing/Scanning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">By College</Label>
              <Select defaultValue="all">
                <SelectTrigger className="rounded-xl h-12 border-2 border-muted"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  <SelectItem value="CICS">CICS (Computer Studies)</SelectItem>
                  <SelectItem value="CEA">CEA (Engineering/Arch)</SelectItem>
                  <SelectItem value="CAS">CAS (Arts/Sciences)</SelectItem>
                  <SelectItem value="CBA">CBA (Business)</SelectItem>
                  <SelectItem value="COED">COED (Education)</SelectItem>
                  <SelectItem value="COM">COM (Medicine)</SelectItem>
                  <SelectItem value="CON">CON (Nursing)</SelectItem>
                  <SelectItem value="COL">COL (Law)</SelectItem>
                  <SelectItem value="GRAD">Graduate School</SelectItem>
                  <SelectItem value="SHS">Senior High School</SelectItem>
                  <SelectItem value="HS">High School</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
