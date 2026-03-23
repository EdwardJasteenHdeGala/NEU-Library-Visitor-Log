"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  History, 
  Activity,
  Clock,
  Filter,
  BarChart3,
  Calendar,
  Download,
  School,
  IdCard,
  Briefcase,
  ArrowUpDown
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { EmptyState } from "@/components/ui/empty-state";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { format, isToday, isThisWeek, isWithinInterval, subDays } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface AdminOverviewProps {
  onNavigate?: (view: string) => void;
}

export function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const firestore = useFirestore();
  const { profile, loading: authLoading } = useAuth();
  
  // Date Filtering State
  const [dateFilter, setDateFilter] = useState<'day' | 'week' | 'custom'>('day');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // Attribute Filtering State
  const [filterPurpose, setFilterPurpose] = useState<string>("all");
  const [filterCollege, setFilterCollege] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Sort State
  const [sortOrder, setSortOrder] = useState<string>("latest");

  // User Logs Dialog State
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<string | null>(null);

  
  const isAdmin = !authLoading && !!profile && profile.isAuthorizedAdmin;

  // Real-time queries for all telemetry within a reasonable window (e.g., last 1000 records to filter client-side)
  const recentVisitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(
      collection(firestore, 'visits'), 
      orderBy('timestamp', 'desc'), 
      limit(1000)
    );
  }, [firestore, isAdmin]);

  const { data: rawVisits, isLoading } = useCollection(recentVisitsQuery);

  const userSpecificLogs = useMemo(() => {
    if (!selectedUserForLogs || !rawVisits) return [];
    return rawVisits.filter(v => v.userName === selectedUserForLogs || v.userId === selectedUserForLogs)
      .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  }, [rawVisits, selectedUserForLogs]);

  // Apply Client-Side Filtering
  const filteredVisits = useMemo(() => {
    if (!rawVisits) return [];
    
    return rawVisits.filter(visit => {
      // Date Filter
      const visitDate = visit.timestamp?.seconds ? new Date(visit.timestamp.seconds * 1000) : new Date();
      let dateMatch = true;
      if (dateFilter === 'day') dateMatch = isToday(visitDate);
      else if (dateFilter === 'week') dateMatch = isThisWeek(visitDate);
      else if (dateFilter === 'custom' && customRange.start && customRange.end) {
         try {
           dateMatch = isWithinInterval(visitDate, { 
             start: new Date(customRange.start), 
             end: new Date(customRange.end) 
           });
         } catch(e) { dateMatch = true; } // Fallback on invalid dates
      }

      // Attribute Filters
      const purposeMatch = filterPurpose === "all" || visit.purpose.toLowerCase() === filterPurpose.toLowerCase();
      const collegeMatch = filterCollege === "all" || visit.college.toLowerCase() === filterCollege.toLowerCase();
      // Employee Status mapping logic from designation (Student vs Staff vs Teacher)
      const designationStr = (visit.designation || "student").toLowerCase();
      let statusGroup = "student";
      if (designationStr.includes("teacher") || designationStr.includes("faculty") || designationStr.includes("prof")) statusGroup = "teacher";
      else if (designationStr.includes("staff") || designationStr.includes("admin") || designationStr.includes("employee") || designationStr.includes("personnel")) statusGroup = "staff";
      
      const statusMatch = filterStatus === "all" || statusGroup === filterStatus;

      // Search Filter
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = !searchQuery || 
        (visit.userName || "").toLowerCase().includes(searchLower) ||
        (visit.userId || "").toLowerCase().includes(searchLower) ||
        (visit.college || "").toLowerCase().includes(searchLower) ||
        (visit.purpose || "").toLowerCase().includes(searchLower) ||
        (visit.designation || "").toLowerCase().includes(searchLower);

      return dateMatch && purposeMatch && collegeMatch && statusMatch && searchMatch;
    }).sort((a, b) => {
      if (sortOrder === "latest") {
        return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
      } else if (sortOrder === "oldest") {
        return (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0);
      } else if (sortOrder === "nameAsc") {
        return (a.userName || "").localeCompare(b.userName || "");
      } else if (sortOrder === "nameDesc") {
        return (b.userName || "").localeCompare(a.userName || "");
      }
      return 0;
    });
  }, [rawVisits, dateFilter, customRange, filterPurpose, filterCollege, filterStatus, searchQuery, sortOrder]);

  // Derived Statistics
  const totalVisitors = filteredVisits.length;
  const activeNow = filteredVisits.filter(v => !v.exitTimestamp).length;
  
  // Calculate average duration for completed visits
  const completedVisits = filteredVisits.filter(v => v.exitTimestamp && v.durationMinutes);
  const avgDuration = completedVisits.length > 0 
    ? Math.round(completedVisits.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / completedVisits.length) 
    : 0;

  const handleExportCSV = () => {
    if (filteredVisits.length === 0) return;
    
    const headers = ["Member Identity", "Designation", "College", "Purpose", "Entry Time", "Exit Time", "Duration (mins)"];
    
    const rows = filteredVisits.map(visit => {
      const entryTime = visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'yyyy-MM-dd HH:mm:ss') : '';
      const exitTime = visit.exitTimestamp?.seconds ? format(visit.exitTimestamp.seconds * 1000, 'yyyy-MM-dd HH:mm:ss') : '';
      return [
        `"${visit.userName || ''}"`,
        `"${visit.designation || 'Visitor'}"`,
        `"${visit.college || ''}"`,
        `"${visit.purpose || ''}"`,
        `"${entryTime}"`,
        `"${exitTime}"`,
        visit.durationMinutes || ''
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Visitor_Statistics_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract unique filter options from data
  const uniqueColleges = Array.from(new Set(rawVisits?.map(v => v.college))).filter(Boolean);
  const uniquePurposes = Array.from(new Set(rawVisits?.map(v => v.purpose))).filter(Boolean);

  if (!authLoading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <h2 className="text-3xl font-black text-primary italic uppercase tracking-tighter">Access Restricted</h2>
      </div>
    );
  }

  return (
    <div className="space-y-[3.5rem] animate-in fade-in duration-1000 pb-[5rem]">
      {/* Global Filter Engine */}
      <Card className="shadow-premium border-none rounded-[3rem] overflow-hidden bg-card/60 backdrop-blur-3xl ring-1 ring-border/40 p-[clamp(1.5rem,4vw,3rem)]">
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-primary/10 rounded-[1.25rem]"><Filter className="h-6 w-6 text-primary" /></div>
               <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Intelligence Filters</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Refine institutional telemetry data</p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-[1rem] w-full md:w-auto">
              <Input 
                placeholder="Universal Registry Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-[1.25rem] px-6 w-full sm:w-[300px] border-2 border-border/40 font-bold italic shadow-inner bg-white/50 backdrop-blur-md focus-visible:ring-secondary focus-visible:border-secondary transition-all"
              />
              <Button variant="outline" onClick={handleExportCSV} disabled={filteredVisits.length === 0} className="h-14 w-full sm:w-auto rounded-[1.25rem] px-6 font-black text-[11px] uppercase tracking-widest gap-2 shadow-premium hover:shadow-premium-hover transition-all">
                 <Download className="h-4 w-4 text-secondary" /> Export
              </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Temporal Filter */}
            <div className="space-y-4 xl:col-span-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2"><Calendar className="h-4 w-4" /> Temporal Range</label>
               <div className="flex flex-wrap items-center gap-3">
                  <Button variant={dateFilter === 'day' ? "default" : "outline"} onClick={() => setDateFilter('day')} className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest">Today</Button>
                  <Button variant={dateFilter === 'week' ? "default" : "outline"} onClick={() => setDateFilter('week')} className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest">This Week</Button>
                  <Button variant={dateFilter === 'custom' ? "default" : "outline"} onClick={() => setDateFilter('custom')} className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest">Custom Range</Button>
                  
                  {dateFilter === 'custom' && (
                     <div className="flex items-center gap-2 animate-in slide-in-from-left-4 fade-in">
                        <Input type="date" value={customRange.start} onChange={(e) => setCustomRange({...customRange, start: e.target.value})} className="h-14 rounded-2xl w-40" />
                        <span className="font-black text-muted-foreground">-</span>
                        <Input type="date" value={customRange.end} onChange={(e) => setCustomRange({...customRange, end: e.target.value})} className="h-14 rounded-2xl w-40" />
                     </div>
                  )}
               </div>
            </div>

            {/* Target Group */}
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Employee Status</label>
               <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-14 rounded-2xl font-bold uppercase tracking-widest bg-white">
                     <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                     <SelectItem value="all" className="font-bold uppercase tracking-widest">All Members</SelectItem>
                     <SelectItem value="student" className="font-bold uppercase tracking-widest">Students</SelectItem>
                     <SelectItem value="teacher" className="font-bold uppercase tracking-widest">Teacher / Faculty</SelectItem>
                     <SelectItem value="staff" className="font-bold uppercase tracking-widest">Staff / Admin</SelectItem>
                  </SelectContent>
               </Select>
            </div>

            {/* Institutional Unit */}
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2"><School className="h-4 w-4" /> College / Unit</label>
               <Select value={filterCollege} onValueChange={setFilterCollege}>
                  <SelectTrigger className="h-14 rounded-2xl font-bold uppercase tracking-widest bg-white">
                     <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                     <SelectItem value="all" className="font-bold uppercase tracking-widest">All Units</SelectItem>
                     {uniqueColleges.map((college, idx) => (
                        <SelectItem key={idx} value={college} className="font-bold uppercase tracking-widest">{college}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            {/* Objective */}
            <div className="space-y-4 xl:col-span-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2"><IdCard className="h-4 w-4" /> Core Objective (Reason)</label>
               <Select value={filterPurpose} onValueChange={setFilterPurpose}>
                  <SelectTrigger className="h-14 rounded-2xl font-bold uppercase tracking-widest bg-white">
                     <SelectValue placeholder="All Reasons" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl max-h-[300px]">
                     <SelectItem value="all" className="font-bold uppercase tracking-widest">All Reasons</SelectItem>
                     {uniquePurposes.map((purpose, idx) => (
                        <SelectItem key={idx} value={purpose} className="font-bold uppercase tracking-widest">{purpose}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            {/* Sort Display */}
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2"><ArrowUpDown className="h-4 w-4" /> Sort Records</label>
               <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="h-14 rounded-2xl font-bold uppercase tracking-widest bg-white">
                     <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                     <SelectItem value="latest" className="font-bold uppercase tracking-widest">Latest Entry</SelectItem>
                     <SelectItem value="oldest" className="font-bold uppercase tracking-widest">Oldest Entry</SelectItem>
                     <SelectItem value="nameAsc" className="font-bold uppercase tracking-widest">Name (A-Z)</SelectItem>
                     <SelectItem value="nameDesc" className="font-bold uppercase tracking-widest">Name (Z-A)</SelectItem>
                  </SelectContent>
               </Select>
            </div>
         </div>
      </Card>

      {/* Modular Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="shadow-premium border-none rounded-[2.5rem] bg-gradient-to-br from-primary to-[#046c64] overflow-hidden relative group">
          <div className="absolute inset-0 bg-dot-pattern opacity-10" />
          <CardHeader className="relative z-10">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] italic mb-2 block">Total Audience</span>
            <div className="p-3 bg-white/10 w-fit rounded-xl backdrop-blur-md shadow-inner">
               <Users className="h-6 w-6 text-secondary animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            <div className="text-6xl font-black text-white italic leading-none">{isLoading ? '-' : totalVisitors}</div>
            <p className="text-[12px] font-bold text-white/50 mt-4 uppercase tracking-[0.1em]">Total Visitors (Filtered)</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-premium border-none rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-premium-hover transition-all duration-700">
          <CardHeader className="bg-muted/10 border-b border-border/40">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] italic mb-2 block">Current State</span>
            <div className={cn("p-3 w-fit rounded-xl shadow-inner transition-colors", activeNow > 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400")}>
               <Activity className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-10">
            <div className="text-5xl font-black text-primary italic leading-none">{isLoading ? '-' : activeNow}</div>
            <p className="text-[12px] font-bold text-muted-foreground mt-4 uppercase tracking-[0.1em] opacity-60">Active Occupancy Now</p>
          </CardContent>
        </Card>

        <Card className="shadow-premium border-none rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-premium-hover transition-all duration-700">
          <CardHeader className="bg-muted/10 border-b border-border/40">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] italic mb-2 block">Behavioral Matrix</span>
            <div className="p-3 w-fit rounded-xl shadow-inner bg-secondary/10 text-secondary">
               <Clock className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-10">
            <div className="text-5xl font-black text-primary italic leading-none">{isLoading ? '-' : avgDuration}<span className="text-2xl ml-2">min</span></div>
            <p className="text-[12px] font-bold text-muted-foreground mt-4 uppercase tracking-[0.1em] opacity-60">Average Session Duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtered Results Table */}
      <Card className="shadow-premium border-none rounded-[3.5rem] overflow-hidden bg-card ring-1 ring-border/40">
        <CardHeader className="pb-10 border-b border-border/40 p-12 bg-muted/5 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black italic flex items-center gap-6 uppercase tracking-tighter text-primary">
              <div className="p-3 bg-white rounded-[1.25rem] shadow-premium-sm border border-border/20">
                <History className="h-8 w-8 text-secondary" />
              </div>
              Filtered Logs
            </CardTitle>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-50 ml-20">Matching telemetry records</p>
          </div>
          <Badge variant="outline" className="text-[12px] font-black uppercase tracking-[0.3em] border-none py-3 px-8 rounded-full bg-primary/5 text-primary shadow-inner">
            {filteredVisits.length} Records Found
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 border-b-2 border-border/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[12px] font-black uppercase tracking-[0.3em] px-12 py-8 text-primary/40 italic">Member</TableHead>
                  <TableHead className="text-[12px] font-black uppercase tracking-[0.3em] py-8 text-primary/40 italic">Details</TableHead>
                  <TableHead className="text-[12px] font-black uppercase tracking-[0.3em] py-8 text-primary/40 italic">Purpose</TableHead>
                  <TableHead className="text-[12px] font-black uppercase tracking-[0.3em] px-12 text-right py-8 text-primary/40 italic">Temporal Logic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-40 animate-pulse text-[14px] font-black uppercase tracking-[0.6em] text-primary/20 italic">Synchronizing Institutional Database...</TableCell></TableRow>
                ) : filteredVisits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-32">
                      <EmptyState 
                        icon={Filter} 
                        title="No Matches Found" 
                        message="Modify your temporal or intelligence filters to view telemetry data." 
                      />
                    </TableCell>
                  </TableRow>
                ) : filteredVisits.map((visit) => (
                  <TableRow key={visit.id} className="hover:bg-primary/[0.02] transition-all border-b border-border/20 last:border-0 group cursor-pointer">
                    <TableCell className="font-black px-12 py-10 text-lg text-primary italic group-hover:translate-x-2 transition-transform duration-500 relative">
                      {visit.userName}
                      <span className="block text-[11px] font-bold text-muted-foreground not-italic tracking-[0.1em] mt-2 opacity-40 uppercase">{visit.designation || 'Visitor'}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); setSelectedUserForLogs(visit.userName); }} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 h-8 rounded-full bg-secondary/10 hover:bg-secondary/20 text-[10px] font-black uppercase tracking-widest text-secondary"
                      >
                         <Filter className="h-3 w-3" /> Logs
                      </Button>
                    </TableCell>
                    <TableCell className="text-[13px] font-black text-primary/60 uppercase italic tracking-tight">{visit.college}</TableCell>
                    <TableCell className="text-[13px] font-black text-primary/60 uppercase italic tracking-tight">{visit.purpose}</TableCell>
                    <TableCell className="text-muted-foreground text-[12px] font-bold px-12 text-right uppercase italic tracking-widest opacity-80">
                      {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd, HH:mm') : 'Decrypting...'}
                      {visit.exitTimestamp && <span className="block mt-1 text-[10px] text-secondary">Duration: {visit.durationMinutes}m</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* User History Dialog */}
      <Dialog open={!!selectedUserForLogs} onOpenChange={(open) => !open && setSelectedUserForLogs(null)}>
        <DialogContent className="max-w-4xl bg-card border-none shadow-premium rounded-[2.5rem] p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black italic flex items-center gap-4 uppercase tracking-tighter text-primary">
              <div className="p-2 bg-secondary/10 rounded-xl">
                 <History className="h-6 w-6 text-secondary" />
              </div>
              {selectedUserForLogs} - Access History
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 ml-14">
              Complete institutional ingress and egress logs for this identity.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/10 rounded-[2rem] border border-white/10 overflow-hidden ring-1 ring-border/50">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b-2 border-border/20">
                  <TableRow>
                     <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 px-8 italic">Location & Objective</TableHead>
                     <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 italic">Entry Protocol</TableHead>
                     <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 italic">Exit Protocol</TableHead>
                     <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 px-8 text-right italic">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSpecificLogs.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-black uppercase tracking-widest text-[10px] italic opacity-50">No records found.</TableCell></TableRow>
                  ) : userSpecificLogs.map(log => (
                    <TableRow key={log.id} className="hover:bg-primary/[0.02] transition-colors border-b border-border/10 last:border-0">
                      <TableCell className="px-8 py-5">
                        <span className="block font-black text-primary text-sm italic uppercase tracking-tight">{log.college}</span>
                        <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">{log.purpose}</span>
                      </TableCell>
                      <TableCell className="font-bold text-xs uppercase tracking-widest text-primary/80 italic">
                        {log.timestamp?.seconds ? format(log.timestamp.seconds * 1000, 'MMM dd, HH:mm') : 'Decrypting...'}
                      </TableCell>
                      <TableCell className="font-bold text-xs uppercase tracking-widest text-primary/80 italic">
                        {log.exitTimestamp?.seconds ? format(log.exitTimestamp.seconds * 1000, 'MMM dd, HH:mm') : <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-200/50 italic tracking-[0.2em] px-3 font-black rounded-full">ACTIVE SESSION</Badge>}
                      </TableCell>
                      <TableCell className="text-right px-8 font-black text-secondary italic text-sm">
                        {log.durationMinutes ? `${log.durationMinutes}m` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
