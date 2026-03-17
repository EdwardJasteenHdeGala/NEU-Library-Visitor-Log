
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Users, FileText, LineChart as LucideLineChart, Filter, Calendar, Settings2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { 
  Line, 
  LineChart, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ReportsView() {
  const [reportType, setReportType] = useState("attendance");
  const [dateRange, setDateRange] = useState("today");
  const [collegeFilter, setCollegeFilter] = useState("all");

  const firestore = useFirestore();
  const visitsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'));
  }, [firestore]);
  const { data: visits } = useCollection(visitsQuery);

  const reports = [
    { name: "Daily Attendance Summary", purpose: "Audit Trail", timestamp: "Today, 08:00 AM" },
    { name: "Monthly Utilization Report", purpose: "Resource Planning", timestamp: "Oct 01, 2024" },
    { name: "Peak Hours Analysis", purpose: "Staffing Optimization", timestamp: "Sep 28, 2024" },
  ];

  const uniqueUserCount = new Set(visits?.map(v => v.userId)).size;

  const trendData = [
    { name: '8am', count: 4 },
    { name: '10am', count: 12 },
    { name: '12pm', count: 18 },
    { name: '2pm', count: 25 },
    { name: '4pm', count: 14 },
    { name: '6pm', count: 6 },
  ];

  const chartConfig = {
    count: {
      label: "Visitors",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary mb-2 italic uppercase tracking-tighter">Institutional Reports</h2>
          <p className="text-muted-foreground font-medium">Configure and export high-fidelity data summaries.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2">
                <Calendar className="h-4 w-4" />
                Schedule Report
            </Button>
            <Button className="gap-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                <Download className="h-4 w-4" />
                Quick Export
            </Button>
        </div>
      </div>

      <Card className="neu-card-shadow border-none rounded-3xl bg-white overflow-hidden">
        <CardHeader className="bg-muted/30 border-b px-8 py-6">
          <CardTitle className="text-lg font-black text-primary flex items-center gap-2 uppercase italic tracking-tighter">
            <Settings2 className="h-5 w-5 text-secondary" />
            Report Parameters
          </CardTitle>
          <CardDescription>Configure the data scope for institutional auditing.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Data Model</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-bold shadow-inner focus:ring-primary">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-none">
                  <SelectItem value="attendance" className="font-bold">Attendance Statistics</SelectItem>
                  <SelectItem value="utilization" className="font-bold">Facility Utilization</SelectItem>
                  <SelectItem value="demographics" className="font-bold">College Demographics</SelectItem>
                  <SelectItem value="audit" className="font-bold">System Audit Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Temporal Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-bold shadow-inner focus:ring-primary">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-none">
                  <SelectItem value="today" className="font-bold">Today (Live Data)</SelectItem>
                  <SelectItem value="week" className="font-bold">Current Week</SelectItem>
                  <SelectItem value="month" className="font-bold">Previous 30 Days</SelectItem>
                  <SelectItem value="semester" className="font-bold">Academic Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Department Scope</Label>
              <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-bold shadow-inner focus:ring-primary">
                  <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-none">
                  <SelectItem value="all" className="font-bold">Institutional (All)</SelectItem>
                  <SelectItem value="cea" className="font-bold">CEA Engineering</SelectItem>
                  <SelectItem value="cics" className="font-bold">CICS Computing</SelectItem>
                  <SelectItem value="external" className="font-bold">External Visitors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Button variant="neu" size="lg" className="h-16 px-12 gap-3 rounded-2xl">
              <LucideLineChart className="h-5 w-5 text-secondary" />
              Generate Visualization
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 neu-card-shadow border-none rounded-2xl bg-white overflow-hidden">
            <CardHeader>
                <CardTitle className="text-lg font-black text-primary flex items-center gap-2">
                    <LucideLineChart className="h-5 w-5" />
                    HOURLY OCCUPANCY TREND
                </CardTitle>
                <CardDescription>Peak usage periods based on current parameters.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
                <ChartContainer config={chartConfig}>
                    <LineChart data={trendData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={4} 
                            dot={{ r: 6, fill: "hsl(var(--secondary))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card className="neu-card-shadow border-none rounded-2xl bg-primary text-white flex flex-col justify-center p-8 space-y-6">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Cumulative Data</p>
                <h3 className="text-4xl font-black italic tracking-tighter">ANALYTICS SUMMARY</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase mb-1">Total Logs</p>
                    <p className="text-2xl font-black text-secondary">{visits?.length || 0}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase mb-1">Unique</p>
                    <p className="text-2xl font-black text-secondary">{uniqueUserCount}</p>
                </div>
            </div>
            <Button className="w-full h-14 bg-secondary text-primary font-black text-lg rounded-xl hover:bg-white transition-colors gap-2">
                <Download className="h-5 w-5" />
                Download Full PDF
            </Button>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-2xl bg-white">
        <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-black text-primary uppercase italic tracking-tighter">Historical Archives</h3>
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search archives..." className="pl-10 h-10 rounded-xl" />
            </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-none">
              <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest py-4">Report Name</TableHead>
              <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest py-4">Category</TableHead>
              <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest py-4">Date Generated</TableHead>
              <TableHead className="text-right py-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report, i) => (
              <TableRow key={i} className="hover:bg-muted/30 border-b">
                <TableCell className="font-black py-4 text-primary flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {report.name}
                </TableCell>
                <TableCell className="py-4 font-medium">{report.purpose}</TableCell>
                <TableCell className="text-muted-foreground py-4 font-bold text-xs">{report.timestamp}</TableCell>
                <TableCell className="text-right py-4">
                    <Button variant="ghost" size="sm" className="text-primary font-black text-[10px] uppercase">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
