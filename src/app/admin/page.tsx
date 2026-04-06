
"use client"

import * as React from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCollection, useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, query, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Loader2, 
  FileText, 
  Users, 
  Activity, 
  Calendar as CalendarIcon, 
  Search, 
  LogOut,
  Ban,
  Filter,
  Clock,
  ShieldAlert,
  CircleSlash,
  ArrowLeft
} from "lucide-react";
import { format, startOfDay, endOfDay, isWithinInterval, startOfWeek, startOfMonth, subHours, isSameDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";
import { cn } from "@/lib/utils";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { AuditService } from "@/services/audit-service";
import { RegistryService } from "@/services/registry-service";
import { UserService } from "@/services/user-service";
import { useToast } from "@/hooks/use-toast";

const AUTHORIZED_EMAILS = [
  "edwardjasteen.degala@neu.edu.ph",
  "jcesperanza@neu.edu.ph"
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [visitorSearch, setVisitorSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("day");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<"all" | "teacher" | "staff">("all");

  // Reference the correct root collections and query using available indexes
  const usersQuery = useMemoFirebase(() => collection(db, "users"), [db]);
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  const logsQuery = useMemoFirebase(() => query(collection(db, "visits"), orderBy("timestamp", "desc")), [db]);
  const { data: allLogs, isLoading: logsLoading } = useCollection(logsQuery);

  const currentUserRef = useMemoFirebase(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: currentUserDoc, isLoading: isRoleLoading } = useDoc(currentUserRef);

  const auditService = useMemo(() => new AuditService(db), [db]);
  const registryService = useMemo(() => new RegistryService(db), [db]);
  const userService = useMemo(() => new UserService(db), [db]);

  const [activeTab, setActiveTab] = useState("registry");
  const auditQuery = useMemoFirebase(() => collection(db, "audit_logs"), [db]);
  const { data: auditLogs, isLoading: auditLoading } = useCollection(auditQuery);

  const neuLogo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  useEffect(() => {
    if (!isUserLoading && !isRoleLoading) {
      if (!user) {
        router.push('/admin-login');
        return;
      }

      const isSuperAdmin = user.email && AUTHORIZED_EMAILS.includes(user.email);
      const hasAdminRole = currentUserDoc && (currentUserDoc.role === 'admin' || currentUserDoc.role === 'superadmin');

      if (!isSuperAdmin && !hasAdminRole) {
        signOut(auth).then(() => router.push('/admin-login'));
      }
    }
  }, [user, isUserLoading, isRoleLoading, currentUserDoc, router, auth]);

  const filteredLogs = useMemo(() => {
    if (!allLogs) return [];
    
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);
    
    if (timeFilter === "custom") {
      if (!dateRange?.from) return allLogs;
      start = startOfDay(dateRange.from);
      end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
    } else {
      switch (timeFilter) {
        case "week": start = startOfWeek(now); break;
        case "month": start = startOfMonth(now); break;
        case "day": default: start = startOfDay(now); break;
      }
    }

    return allLogs
      .filter(log => {
        const date = log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp ? new Date(log.timestamp) : new Date());
        // Use userId and users collection as confirmed by database investigation
        const visitor = users?.find(v => v.id === log.userId);
        
        const visitorName = (log.userName || visitor?.name || visitor?.displayName || "Unknown").toLowerCase();
        const matchesSearch = !searchTerm || visitorName.includes(searchTerm.toLowerCase());
        
        const matchesTime = isWithinInterval(date, { start, end });
        const matchesPurpose = purposeFilter === "all" || (log.purpose && (log.purpose === purposeFilter || log.purpose.toLowerCase() === purposeFilter.toLowerCase()));
        const matchesCollege = collegeFilter === "all" || (log.college === collegeFilter || visitor?.college === collegeFilter);
        const matchesClass = classFilter === "all" || (log.classification === classFilter || visitor?.designation === classFilter);
        
        let matchesEmployeeType = true;
        if (employeeTypeFilter !== "all") {
          const designation = (visitor?.designation || log.designation || "").toLowerCase();
          if (employeeTypeFilter === "teacher") {
            matchesEmployeeType = designation === "teacher" || designation === "professor";
          } else if (employeeTypeFilter === "staff") {
            matchesEmployeeType = designation === "staff";
          }
        }

        return matchesTime && matchesSearch && matchesPurpose && matchesCollege && matchesClass && matchesEmployeeType;
      })
      .sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : (a.timestamp ? new Date(a.timestamp) : new Date());
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : (b.timestamp ? new Date(b.timestamp) : new Date());
        return dateB.getTime() - dateA.getTime();
      });
  }, [allLogs, timeFilter, dateRange, searchTerm, users, purposeFilter, collegeFilter, classFilter, employeeTypeFilter]);

  const stats = useMemo(() => {
    if (!allLogs || !users) return { today: 0, week: 0, blocked: 0, active: 0 };
    
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    
    const todayCount = allLogs.filter(l => {
      const d = l.timestamp?.toDate ? l.timestamp.toDate() : (l.timestamp ? new Date(l.timestamp) : new Date());
      return isWithinInterval(d, { start: todayStart, end: todayEnd });
    }).length;

    const weekCount = allLogs.filter(l => {
      const d = l.timestamp?.toDate ? l.timestamp.toDate() : (l.timestamp ? new Date(l.timestamp) : new Date());
      return isWithinInterval(d, { start: weekStart, end: todayEnd });
    }).length;

    const blockedCount = users.filter(v => v.isBlocked).length;
    
    const activeCount = allLogs.filter(l => {
      const d = l.timestamp?.toDate ? l.timestamp.toDate() : (l.timestamp ? new Date(l.timestamp) : new Date());
      return d > subHours(now, 2) && isSameDay(d, now);
    }).length;

    return { today: todayCount, week: weekCount, blocked: blockedCount, active: activeCount };
  }, [allLogs, users]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleRestoreLog = async (logId: string) => {
    if (!user) return;
    try {
      await registryService.restoreLogs([logId], user.uid, user.displayName || 'Admin');
      toast({ title: "Log Restored", description: "Activity record is now visible again." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to restore log entry.", variant: "destructive" });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBlockUser = async (userId: string) => {
    if (!user) return;
    const reason = window.prompt("Reason for restriction:");
    if (!reason) return;
    try {
      await userService.blockUser(userId, reason, user.uid, user.displayName || 'Admin');
      toast({ title: "User Restricted", description: "Visitor access has been revoked." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to restrict user.", variant: "destructive" });
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (!user) return;
    try {
      await userService.unblockUser(userId, user.uid, user.displayName || 'Admin');
      toast({ title: "Access Restored", description: "Visitor can now sign in again." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to lift restriction.", variant: "destructive" });
    }
  };

  const handleWarnUser = async (userId: string, reason: string) => {
    if (!user) return;
    try {
      await userService.warnUser(userId, reason, user.uid, user.displayName || 'Admin');
      toast({ title: "Warning Issued", description: "Instructional warning sent to visitor." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to issue warning.", variant: "destructive" });
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      const records = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        return {
          visitorId: values[0]?.trim(),
          purpose: values[1]?.trim() || 'Institutional Visit',
          timestamp: new Date(values[2]?.trim() || Date.now()),
          classification: values[3]?.trim() || 'Visitor'
        };
      });

      try {
        await registryService.importLogs(records, user.uid, user.displayName || 'Admin');
        toast({ title: "Import Successful", description: `Added ${records.length} records to registry.` });
      } catch (error) {
        toast({ title: "Import Failed", description: "Verify CSV format and user IDs.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSwitchAccount = async () => {
    await signOut(auth);
    router.push('/admin-login?force_reauth=true');
  };

  const exportCSV = () => {
    const headers = ["Visitor", "Email", "Purpose", "Timestamp", "College"];
    const rows = filteredLogs.map(log => {
      const v = users?.find(vis => vis.id === (log.userId || log.visitorId));
      return [
        log.userName || v?.name || v?.displayName || "Unknown",
        v?.email || "N/A",
        log.purpose || "N/A",
        log.timestamp?.toDate ? format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss') : "N/A",
        log.college || v?.college || "N/A"
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NEU_Library_Report_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0); 
    doc.text("NEU Library Institutional Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${format(new Date(), 'PPP p')}`, 14, 28);
    let rangeText = timeFilter.toUpperCase();
    if (timeFilter === 'custom' && dateRange?.from) {
      rangeText = `${format(dateRange.from, 'PP')} - ${dateRange.to ? format(dateRange.to, 'PP') : format(dateRange.from, 'PP')}`;
    }
    doc.text(`Monitoring Period: ${rangeText}`, 14, 34);
    doc.save(`NEU_Library_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (isUserLoading || usersLoading || logsLoading || isRoleLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const filteredVisitors = users?.filter(v => 
    !visitorSearch || 
    (v.name || v.displayName || "").toLowerCase().includes(visitorSearch.toLowerCase()) ||
    (v.email || "").toLowerCase().includes(visitorSearch.toLowerCase())
  ).sort((a: any, b: any) => (a.name || a.displayName || "").localeCompare(b.name || b.displayName || "")) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="bg-slate-900 px-6 py-2.5 flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded-full shadow-sm">
            <div className="relative w-8 h-8">
              <Image 
                src={neuLogo?.imageUrl || "https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg"} 
                alt="NEU Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="text-white">
            <h1 className="text-sm font-black tracking-tight leading-none uppercase">NEU LIBRARY</h1>
            <p className="text-[7px] font-bold tracking-[0.2em] opacity-80 uppercase mt-0.5">Admin Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 text-white hover:bg-white/10 gap-1.5 font-black text-[8px] uppercase tracking-widest px-3 rounded-full"
              >
                <Ban className="h-3.5 w-3.5" /> BLOCK LIST
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-none shadow-2xl">
              <SheetHeader className="p-4 bg-slate-900 text-white">
                <SheetTitle className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="h-3.5 w-3.5" /> ACCESS CONTROL
                </SheetTitle>
              </SheetHeader>
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                  <Input 
                    placeholder="SEARCH USERS..." 
                    className="pl-8 h-8 border-none bg-slate-100 rounded-lg text-[8px] font-bold uppercase tracking-widest"
                    value={visitorSearch}
                    onChange={(e) => setVisitorSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {filteredVisitors.map((visitor) => (
                  <div key={visitor.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black uppercase text-slate-900 leading-none">{visitor.name}</span>
                      <span className="text-[6px] font-bold uppercase text-slate-400">{visitor.college}</span>
                    </div>
                    <Button
                      variant={visitor.isBlocked ? "destructive" : "outline"}
                      size="sm"
                      className={cn(
                        "h-6 rounded-lg text-[7px] font-black uppercase tracking-widest px-2.5",
                        !visitor.isBlocked && "border-slate-100 hover:bg-slate-50 text-slate-600"
                      )}
                      onClick={() => visitor.isBlocked ? handleUnblockUser(visitor.id) : handleBlockUser(visitor.id)}
                    >
                      {visitor.isBlocked ? "UNBLOCK" : "BLOCK"}
                    </Button>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 text-white hover:bg-white/10 gap-1.5 font-black text-[8px] uppercase tracking-widest px-3 rounded-full"
            onClick={handleSwitchAccount}
            title="Switch Account"
            aria-label="Switch Account"
          >
            <ShieldAlert className="h-3.5 w-3.5" /> SWITCH ACCOUNT
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 text-white hover:bg-white/10 gap-1.5 font-black text-[8px] uppercase tracking-widest px-3 rounded-full"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" /> SIGN OUT
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "TODAY'S USERS", value: stats.today, icon: Users, color: "text-emerald-500", bgColor: "bg-emerald-50" },
            { label: "THIS WEEK", value: stats.week, icon: CalendarIcon, color: "text-blue-500", bgColor: "bg-blue-50" },
            { label: "BLOCKED", value: stats.blocked, icon: CircleSlash, color: "text-red-500", bgColor: "bg-red-50" },
            { label: "ACTIVE SESSIONS", value: stats.active, icon: Activity, color: "text-green-500", bgColor: "bg-green-50" }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                </div>
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", stat.bgColor, stat.color)}>
                  <stat.icon className="h-7 w-7" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Filter className="h-4 w-4 text-slate-900" />
            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">ADVANCED FILTERS</h2>
          </div>
          <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-3">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">TIME PERIOD</Label>
                  <div className="flex gap-2">
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="h-10 rounded-2xl bg-[#F4F7F9] border-none text-[9px] font-black uppercase tracking-widest px-4 shadow-inner flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <SelectValue placeholder="Period" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="day" className="text-[9px] font-black uppercase">TODAY</SelectItem>
                        <SelectItem value="week" className="text-[9px] font-black uppercase">WEEK</SelectItem>
                        <SelectItem value="month" className="text-[9px] font-black uppercase">MONTH</SelectItem>
                        <SelectItem value="custom" className="text-[9px] font-black uppercase">CUSTOM RANGE</SelectItem>
                      </SelectContent>
                    </Select>

                    {timeFilter === 'custom' && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-10 w-10 rounded-2xl border-slate-100 p-0 hover:bg-slate-50">
                            <CalendarIcon className="h-4 w-4 text-slate-900" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            className="rounded-2xl"
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">USER TYPE</Label>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="h-10 rounded-2xl bg-[#F4F7F9] border-none text-[9px] font-black uppercase tracking-widest px-4 shadow-inner">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all" className="text-[9px] font-black uppercase">ALL ENTRIES</SelectItem>
                      <SelectItem value="Student" className="text-[9px] font-black uppercase">STUDENTS</SelectItem>
                      <SelectItem value="Staff" className="text-[9px] font-black uppercase">STAFF</SelectItem>
                      <SelectItem value="Administrator" className="text-[9px] font-black uppercase">ADMINISTRATORS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">PURPOSE</Label>
                  <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                    <SelectTrigger className="h-10 rounded-2xl bg-[#F4F7F9] border-none text-[9px] font-black uppercase tracking-widest px-4 shadow-inner">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all" className="text-[9px] font-black uppercase">ALL PURPOSES</SelectItem>
                      <SelectItem value="conduct research" className="text-[9px] font-black uppercase">CONDUCTING RESEARCH</SelectItem>
                      <SelectItem value="researching" className="text-[9px] font-black uppercase">RESEARCHING</SelectItem>
                      <SelectItem value="thesis research" className="text-[9px] font-black uppercase">THESIS RESEARCH</SelectItem>
                      <SelectItem value="expert assistance" className="text-[9px] font-black uppercase">EXPERT ASSISTANCE</SelectItem>
                      <SelectItem value="computer use" className="text-[9px] font-black uppercase">COMPUTER USE</SelectItem>
                      <SelectItem value="study" className="text-[9px] font-black uppercase">STUDY</SelectItem>
                      <SelectItem value="assignments" className="text-[9px] font-black uppercase">ASSIGNMENTS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">DEPARTMENT</Label>
                  <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                    <SelectTrigger className="h-10 rounded-2xl bg-[#F4F7F9] border-none text-[9px] font-black uppercase tracking-widest px-4 shadow-inner">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all" className="text-[9px] font-black uppercase">ALL DEPTS</SelectItem>
                      <SelectItem value="College of Arts and Science" className="text-[9px] font-black uppercase">CAS</SelectItem>
                      <SelectItem value="College of Information and Computer Studies" className="text-[9px] font-black uppercase">CICS</SelectItem>
                      <SelectItem value="College of Accountancy" className="text-[9px] font-black uppercase">COA</SelectItem>
                      <SelectItem value="College of Engineering and Architecture" className="text-[9px] font-black uppercase">CEA</SelectItem>
                      <SelectItem value="College of Medicine" className="text-[9px] font-black uppercase">MEDICINE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">EMPLOYEE TYPE</Label>
                  <div className="flex bg-[#F4F7F9] p-1 rounded-2xl shadow-inner h-10 w-full overflow-hidden border-none self-end">
                    {[
                      { id: "all", label: "ALL" },
                      { id: "teacher", label: "TEACHER" },
                      { id: "staff", label: "STAFF" }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setEmployeeTypeFilter(btn.id as any)}
                        className={cn(
                          "flex-1 text-[8px] font-black tracking-widest transition-all rounded-xl",
                          employeeTypeFilter === btn.id 
                            ? "bg-slate-900 text-white shadow-md active:scale-95" 
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex gap-6 border-b border-slate-100 flex-1">
              {['registry', 'audit', 'users'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-3 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative",
                    activeTab === tab 
                      ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#006400]" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab === 'registry' ? 'Visit Registry' : tab === 'audit' ? 'Audit Trail' : 'User Management'}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 ml-6">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportCSV} 
                className="hidden" 
                accept=".csv"
                aria-label="Import CSV File"
              />
              <Button 
                variant="outline"
                className="h-10 rounded-2xl border-none bg-white shadow-sm hover:bg-slate-50 text-slate-900 font-black text-[9px] uppercase tracking-widest px-6"
                onClick={() => fileInputRef.current?.click()}
              >
                <Filter className="mr-2 h-4 w-4 text-[#006400]" /> IMPORT CSV
              </Button>
              <Button 
                variant="outline"
                className="h-10 rounded-2xl border-none bg-white shadow-sm hover:bg-slate-50 text-slate-900 font-black text-[9px] uppercase tracking-widest px-6"
                onClick={exportCSV}
              >
                <Activity className="mr-2 h-4 w-4 text-[#006400]" /> CSV EXPORT
              </Button>
              <Button 
                className="h-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-widest px-6 shadow-lg"
                onClick={generatePDF}
              >
                <FileText className="mr-2 h-4 w-4" /> PDF REPORT
              </Button>
            </div>
          </div>

          <div className="pt-2">
            {activeTab === 'registry' && (
              <>
                <div className="flex items-center justify-between px-2 mb-4">
                  <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" /> ACTIVITY LOG
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="SEARCH ENTRIES..." 
                      className="pl-10 h-10 w-64 border-none rounded-2xl bg-white shadow-sm text-[9px] font-black uppercase tracking-widest placeholder:text-slate-300"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10 text-slate-400">TIMESTAMP</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-slate-400">USER INFORMATION</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-slate-400">DEPARTMENT</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-slate-400">PURPOSE</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pr-10 text-right text-slate-400">ACTIONS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-60 text-center text-slate-300 font-black uppercase text-[12px] tracking-widest">
                              No activity records found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLogs.map((log) => {
                            const visitor = users?.find(v => v.id === (log.userId || log.visitorId));
                            const date = log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp ? new Date(log.timestamp) : new Date());
                            return (
                              <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors border-slate-100/50 group">
                                <TableCell className="py-5 pl-10 text-[12px] font-bold text-slate-400">
                                  <div className="flex flex-col">
                                    <span>{format(date, 'MMM d')}</span>
                                    <span className="text-[10px] opacity-70">{format(date, 'h:mm a')}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-5">
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[12px] font-black text-slate-900 uppercase leading-none">{log.userName || visitor?.name || visitor?.displayName || "Unknown"}</span>
                                      {visitor?.isBlocked && (
                                        <Badge variant="destructive" className="h-4 px-1.5 rounded-md text-[8px] font-black uppercase tracking-tighter">RESTRICTED</Badge>
                                      )}
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                      {log.classification || visitor?.classification || "User"}
                                      {visitor?.studentId && ` | ID: ${visitor.studentId}`}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-5 text-[12px] font-black text-slate-500 uppercase">{log.college || visitor?.college || "N/A"}</TableCell>
                                <TableCell className="py-5 text-[12px] font-black text-slate-400 uppercase tracking-tight">{log.purpose}</TableCell>
                                <TableCell className="py-5 pr-10 text-right flex gap-2 justify-end">
                                  {log.isDeleted ? (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-7 rounded-full text-[8px] font-black uppercase border-[#006400] text-[#006400]"
                                      onClick={() => handleRestoreLog(log.id)}
                                    >
                                      RESTORE
                                    </Button>
                                  ) : (
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full font-black text-[8px] px-4 py-1.5 uppercase tracking-widest">
                                      ACTIVE
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'audit' && (
              <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 border-slate-100">
                        <TableHead className="text-[10px] font-black uppercase py-6 pl-10 text-slate-400">TIME</TableHead>
                        <TableHead className="text-[10px] font-black uppercase py-6 text-slate-400">ADMIN</TableHead>
                        <TableHead className="text-[10px] font-black uppercase py-6 text-slate-400">ACTION</TableHead>
                        <TableHead className="text-[10px] font-black uppercase py-6 pr-10 text-slate-400">DETAILS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-200" /></TableCell></TableRow>
                      ) : auditLogs?.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-300 font-bold uppercase text-[10px]">No audit logs found</TableCell></TableRow>
                      ) : (
                        auditLogs?.map((log: any) => (
                          <TableRow key={log.id} className="border-slate-100/50">
                            <TableCell className="pl-10 text-[10px] font-bold text-slate-400">
                              {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'MMM d, h:mm a') : 'Now'}
                            </TableCell>
                            <TableCell className="text-[10px] font-black text-slate-900 uppercase">{log.adminName}</TableCell>
                            <TableCell>
                              <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black px-2 py-0.5">{log.action}</Badge>
                            </TableCell>
                            <TableCell className="pr-10 text-[10px] text-slate-500">{log.description}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {activeTab === 'users' && (
              <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 border-slate-100">
                        <TableHead className="text-[10px] font-black uppercase py-6 pl-10 text-slate-400">VISITOR NAME</TableHead>
                        <TableHead className="text-[10px] font-black uppercase py-6 text-slate-400">CONTACT / ID</TableHead>
                        <TableHead className="text-[10px] font-black uppercase py-6 text-slate-400">STATUS</TableHead>
                        <TableHead className="text-[10px] font-black uppercase py-6 pr-10 text-right text-slate-400">CONTROLS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-20 text-slate-300 font-bold uppercase text-[10px]">No users matching search</TableCell>
                        </TableRow>
                      ) : (
                        filteredVisitors.map((profile: any) => (
                          <TableRow key={profile.id} className="border-slate-100/50">
                            <TableCell className="pl-10">
                              <div className="flex flex-col">
                                <span className="text-[12px] font-black text-slate-900 uppercase">{profile.name || profile.displayName || "Unknown"}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">{profile.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-[10px] font-bold text-slate-500">{profile.studentId || "EXTERNAL"}</span>
                            </TableCell>
                            <TableCell>
                              {profile.isBlocked ? (
                                <Badge variant="destructive" className="text-[8px] font-black px-2 py-0.5 uppercase">RESTRICTED</Badge>
                              ) : (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black px-2 py-0.5 uppercase">ACTIVE</Badge>
                              )}
                            </TableCell>
                            <TableCell className="pr-10 text-right flex gap-2 justify-end">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 rounded-full text-[8px] font-black border-slate-200"
                                onClick={() => {
                                  const reason = window.prompt("Enter warning reason:");
                                  if (reason) handleWarnUser(profile.id, reason);
                                }}
                              >
                                WARN
                              </Button>
                              {profile.isBlocked ? (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 rounded-full text-[8px] font-black border-emerald-200 text-emerald-600"
                                  onClick={() => handleUnblockUser(profile.id)}
                                >
                                  UNBLOCK
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 rounded-full text-[8px] font-black border-rose-200 text-rose-600"
                                  onClick={() => handleBlockUser(profile.id)}
                                >
                                  BLOCK
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-8 left-8 z-30 pointer-events-auto">
        <Button 
          variant="ghost" 
          aria-label="Application Dashboard"
          title="Application Dashboard"
          className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-black text-xl shadow-2xl hover:bg-slate-900 transition-all p-0"
        >
          N
        </Button>
      </div>
    </div>
  );
}
