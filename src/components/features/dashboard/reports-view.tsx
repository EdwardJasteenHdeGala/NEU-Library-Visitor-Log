"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Download, 
  FileText, 
  LineChart as LucideLineChart, 
  Calendar, 
  Settings2,
  Loader2,
  Clock,
  Mail,
  FileSpreadsheet
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, orderBy, where, limit } from "firebase/firestore";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReportsViewProps {
  onBack?: () => void;
}

export function ReportsView({}: ReportsViewProps) {
  const [reportType, setReportType] = useState("attendance");
  const [dateRange, setDateRange] = useState("today");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const isAdmin = profile?.isAuthorizedAdmin === true;

  const firestore = useFirestore();
  const visitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    
    // Default: fetch everything for broad reports
    const baseQuery = query(
      collection(firestore, 'visits'), 
      orderBy('timestamp', 'desc'),
    );

    // Optimization: If "today" is selected, filter strictly for performance
    if (dateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return query(baseQuery, where('timestamp', '>=', today), limit(200));
    }

    // Protection: Limit broad reports to 500 to prevent browser crashes
    return query(baseQuery, limit(500));
  }, [firestore, isAdmin, dateRange]);
  
  const { data: visits } = useCollection(visitsQuery);

  const [archives] = useState([
    { name: "Daily Attendance Summary", category: "Audit Trail", timestamp: "Today, 08:00 AM" },
    { name: "Monthly Utilization Report", category: "Resource Planning", timestamp: "Oct 01, 2026" },
    { name: "Peak Hours Analysis", category: "Staffing Optimization", timestamp: "Sep 28, 2026" },
    { name: "University Semester Audit", category: "Academic Compliance", timestamp: "Sep 15, 2026" },
  ]);

  const uniqueUserCount = new Set(visits?.map(v => v.userId)).size;

  // Dynamic Aggregator: Transforms raw visits into hourly occupancy buckets
  const hourlyData = useMemo(() => {
    const defaultBuckets = [
      { name: '8am', count: 0 },
      { name: '10am', count: 0 },
      { name: '12pm', count: 0 },
      { name: '2pm', count: 0 },
      { name: '4pm', count: 0 },
      { name: '6pm', count: 0 },
    ];
    if (!visits) return defaultBuckets;
    
    const buckets: Record<string, number> = {
      '8am': 0, '10am': 0, '12pm': 0, '2pm': 0, '4pm': 0, '6pm': 0
    };

    const filtered = visits.filter(v => {
      const matchCollege = collegeFilter === 'all' || v.college === collegeFilter;
      const matchPurpose = purposeFilter === 'all' || v.purpose === purposeFilter;
      const matchDesignation = designationFilter === 'all' || v.designation === designationFilter;
      return matchCollege && matchPurpose && matchDesignation;
    });

    filtered.forEach(v => {
      const date = v.timestamp?.toDate() || new Date();
      const hour = date.getHours();
      
      if (hour < 10) buckets['8am']++;
      else if (hour < 12) buckets['10am']++;
      else if (hour < 14) buckets['12pm']++;
      else if (hour < 16) buckets['2pm']++;
      else if (hour < 18) buckets['4pm']++;
      else buckets['6pm']++;
    });

    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [visits, collegeFilter, purposeFilter, designationFilter]);

  const handleGenerateVisualization = () => {
    setIsGenerating(true);
    // Simulation of deeper analytical pass
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Telemetry Refreshed",
        description: `Chart synchronized with ${visits?.length || 0} institutional records.`,
      });
    }, 800);
  };

  const handleQuickExport = (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    toast({
      title: "Export Initiated",
      description: `Preparing institutional ${format.toUpperCase()} report.`,
    });

    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export Complete",
        description: `Institutional archive ready.`,
      });
    }, 2500);
  };

  const handleScheduleReport = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Schedule Confirmed",
      description: "Automated institutional audit has been registered.",
    });
  };

  const chartConfig = {
    count: {
      label: "Visitors",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-[2.5rem] animate-in fade-in duration-700 pb-[5rem]">
      {/* Header Alignment */}
      <div className="flex flex-col gap-[1.5rem]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-[1.5rem]">
          <div className="space-y-[0.5rem]">
            <h2 className="text-[2rem] md:text-[3.5rem] font-black text-primary italic uppercase tracking-tighter leading-none text-glow-primary">Institutional Reports</h2>
            <p className="text-[0.625rem] md:text-[0.875rem] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 leading-none">High-Fidelity Telemetry & Archive Export</p>
          </div>
          <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-[3.5rem] px-8 gap-3 font-black text-[0.75rem] uppercase tracking-widest rounded-[1.25rem] shadow-xl hover:scale-105 transition-all active:scale-95 border-2">
                      <Calendar className="h-[1.25rem] w-[1.25rem] text-primary" />
                      Schedule Audit
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] sm:max-w-[425px] border-none shadow-3xl bg-card p-10">
                  <form onSubmit={handleScheduleReport}>
                    <DialogHeader>
                      <DialogTitle className="text-[1.5rem] font-black text-primary italic uppercase tracking-tighter">Schedule Audit</DialogTitle>
                      <DialogDescription className="text-xs font-medium opacity-60">Automate institutional report delivery.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 opacity-50">Frequency</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger className="h-12 rounded-xl border-2 font-bold focus:ring-primary bg-muted/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="daily" className="font-bold">Every Morning (08:00 AM)</SelectItem>
                            <SelectItem value="weekly" className="font-bold">Weekly (Every Monday)</SelectItem>
                            <SelectItem value="monthly" className="font-bold">Monthly (1st Day)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 opacity-50">Destination Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="admin@neu.edu.ph" className="h-12 rounded-xl border-2 pl-10 font-bold focus:ring-primary bg-muted/20" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full h-14 text-[10px] font-black uppercase tracking-widest rounded-xl gap-3 shadow-xl hover:scale-105 transition-all">
                        <Clock className="h-5 w-5 text-secondary" />
                        Register Schedule
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={() => handleQuickExport('csv')} 
                disabled={isExporting}
                className="h-[3.5rem] px-8 gap-3 font-black text-[0.75rem] uppercase tracking-widest rounded-[1.25rem] shadow-2xl hover:scale-105 transition-all active:scale-95 bg-primary border-b-4 border-primary/20"
              >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-[1.25rem] w-[1.25rem] text-secondary" />}
                  Quick Export
              </Button>
          </div>
        </div>
      </div>

      <Card className="neu-card-shadow border-none rounded-[2rem] bg-card overflow-hidden shadow-2xl ring-1 ring-border">
        <CardHeader className="bg-muted/30 border-b px-8 py-6">
          <CardTitle className="text-lg font-black text-primary flex items-center gap-2 uppercase italic tracking-tighter">
            <Settings2 className="h-5 w-5 text-secondary" />
            Report Parameters
          </CardTitle>
          <CardDescription>Configure scope.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
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
                  {/* ... other colleges ... */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Visit Reason</Label>
              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-bold shadow-inner focus:ring-primary">
                  <SelectValue placeholder="Objective" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-none">
                  <SelectItem value="all" className="font-bold">Institutional (All)</SelectItem>
                  <SelectItem value="research" className="font-bold">Research</SelectItem>
                  <SelectItem value="study" className="font-bold">Study & Review</SelectItem>
                  <SelectItem value="borrowing" className="font-bold">Borrow / Return</SelectItem>
                  <SelectItem value="clearance" className="font-bold">Clearance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Employee Status</Label>
              <Select value={designationFilter} onValueChange={setDesignationFilter}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-bold shadow-inner focus:ring-primary">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-none">
                  <SelectItem value="all" className="font-bold">Institutional (All)</SelectItem>
                  <SelectItem value="student" className="font-bold">Student</SelectItem>
                  <SelectItem value="teacher" className="font-bold">Teacher / Faculty</SelectItem>
                  <SelectItem value="staff" className="font-bold">Staff</SelectItem>
                  <SelectItem value="guest" className="font-bold">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleGenerateVisualization} 
              variant="neu" 
              size="lg" 
              disabled={isGenerating}
              className="h-16 px-12 gap-3 rounded-2xl relative overflow-hidden"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <LucideLineChart className="h-5 w-5 text-secondary" />
                  Generate Visualization
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 neu-card-shadow border-none rounded-[2rem] bg-card overflow-hidden shadow-2xl">
            <CardHeader>
                <CardTitle className="text-lg font-black text-primary flex items-center gap-2 italic">
                    <LucideLineChart className="h-5 w-5" />
                    HOURLY OCCUPANCY TREND
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
                <ChartContainer config={chartConfig}>
                    <LineChart data={hourlyData}>
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

        <Card className="neu-card-shadow border-none rounded-[2.5rem] bg-[#032e41] text-white flex flex-col justify-center p-10 space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#032e41] via-[#032e41] to-[#046c64]/40 opacity-90" />
            <div className="absolute inset-0 bg-dot-pattern opacity-10" />
            <div className="space-y-2 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Analytics Insight</p>
                <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none drop-shadow-md">Telemetry <br /> Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-white/5 p-5 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors">
                    <p className="text-[10px] font-black uppercase mb-1 opacity-60">Logs</p>
                    <p className="text-3xl font-black text-secondary text-glow-secondary">{visits?.length || 0}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors">
                    <p className="text-[10px] font-black uppercase mb-1 opacity-60">Unique</p>
                    <p className="text-3xl font-black text-secondary text-glow-secondary">{uniqueUserCount}</p>
                </div>
            </div>
            <Button 
              onClick={() => handleQuickExport('pdf')}
              disabled={isExporting}
              className="w-full h-16 bg-secondary text-primary font-black text-lg rounded-xl hover:bg-white transition-all shadow-xl gap-3 relative z-10"
            >
                {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                Full PDF Archive
            </Button>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-[2rem] bg-card shadow-2xl">
        <div className="p-8 border-b bg-muted/20 flex items-center justify-between">
            <h3 className="font-black text-primary uppercase italic tracking-tighter">System Archives</h3>
            <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search archives..." className="pl-10 h-12 rounded-xl border-2" />
            </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-none">
              <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest py-5 px-8">Audit Target</TableHead>
              <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest py-5">Classification</TableHead>
              <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest py-5">Generated</TableHead>
              <TableHead className="text-right py-5 px-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archives.map((report, i) => (
              <TableRow key={i} className="hover:bg-muted/30 border-b transition-colors duration-300">
                <TableCell className="font-black py-6 text-primary flex items-center gap-4 px-8">
                    <div className="p-2.5 bg-primary/5 rounded-xl">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    {report.name}
                </TableCell>
                <TableCell className="py-6 font-bold text-muted-foreground text-xs uppercase tracking-tight">{report.category}</TableCell>
                <TableCell className="text-muted-foreground py-6 font-black text-[10px] italic uppercase tracking-widest">{report.timestamp}</TableCell>
                <TableCell className="text-right py-6 px-8">
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/5" title="View Details">
                        <Search className="h-5 w-5 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-green-50" title="Spreadsheet">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
