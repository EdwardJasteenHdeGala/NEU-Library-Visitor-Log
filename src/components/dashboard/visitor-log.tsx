
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Users, 
  Trash2, 
  Download, 
  Filter, 
  Calendar, 
  Loader2, 
  ArrowLeft,
  Building2,
  BookOpen,
  UserCheck,
  XCircle
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const NEU_COLLEGES = [
  { id: "CICS", name: "Computer & Info Sciences" },
  { id: "CEA", name: "Engineering & Architecture" },
  { id: "CAS", name: "Arts & Sciences" },
  { id: "CBA", name: "Business Administration" },
  { id: "COED", name: "Education" },
  { id: "CON", name: "Nursing" },
  { id: "COM", name: "Medicine" },
  { id: "COL", name: "Law" },
  { id: "GRAD", name: "Graduate School" },
  { id: "SHS", name: "Senior High School" },
  { id: "HS", name: "High School" },
  { id: "EXTERNAL", name: "External / Guest" },
];

const PURPOSES = [
  "reading books",
  "research in thesis",
  "use of computer",
  "doing assignments",
  "group study",
  "consultation",
  "charging device",
  "resting/waiting",
  "printing/scanning",
  "resource borrowing"
];

interface VisitorLogProps {
  onBack?: () => void;
}

export function VisitorLog({ onBack }: VisitorLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const firestore = useFirestore();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === 'admin';

  const visitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'));
  }, [firestore, isAdmin]);

  const { data: visits, isLoading } = useCollection(visitsQuery);

  const filteredVisits = useMemo(() => {
    if (!visits) return [];
    return visits.filter(visit => {
      const matchesSearch = 
        visit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visit.academicYear && visit.academicYear.includes(searchTerm));
      
      const matchesCollege = collegeFilter === "all" || visit.college === collegeFilter;
      const matchesPurpose = purposeFilter === "all" || visit.purpose === purposeFilter;
      const matchesRole = roleFilter === "all" || visit.roleAtTime === roleFilter;

      return matchesSearch && matchesCollege && matchesPurpose && matchesRole;
    });
  }, [visits, searchTerm, collegeFilter, purposeFilter, roleFilter]);

  const uniqueUserCount = new Set(visits?.map(v => v.userId)).size;

  const handlePurgeLogs = () => {
    if (!visits || visits.length === 0) return;
    
    visits.forEach(visit => {
      const docRef = doc(firestore, 'visits', visit.id);
      deleteDocumentNonBlocking(docRef);
    });

    toast({
      title: "System Reset",
      description: `Successfully purged ${visits.length} log entries.`,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCollegeFilter("all");
    setPurposeFilter("all");
    setRoleFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || collegeFilter !== "all" || purposeFilter !== "all" || roleFilter !== "all";

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {onBack && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2 -ml-2 text-primary/50 hover:text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-[0.2em] gap-2 rounded-xl h-8 px-4"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Overview
        </Button>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black text-[9px] uppercase tracking-[0.4em] opacity-60">
             <Filter className="h-4 w-4" />
             Data Filtering Console
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-primary italic tracking-tighter uppercase leading-none">Visitor Registry</h2>
          <p className="text-muted-foreground font-medium text-sm md:text-lg opacity-70">Audit institutional access with multi-dimensional filters.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                    variant="outline" 
                    className="h-12 gap-2 border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all font-black text-[10px] uppercase tracking-widest px-6"
                    disabled={!visits || visits.length === 0}
                >
                    <Trash2 className="h-4 w-4" />
                    Reset Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem] p-10 border-none shadow-3xl bg-white/98 backdrop-blur-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-3xl font-black text-primary italic uppercase tracking-tighter">Purge Data Registry?</AlertDialogTitle>
                  <AlertDialogDescription className="text-lg font-medium opacity-70">
                    This action will permanently delete all {visits?.length} recorded visit logs from the cloud. This is irreversible and will reset all telemetry analytics.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center gap-4 pt-6">
                  <AlertDialogCancel className="rounded-2xl h-14 px-10 font-bold border-2">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handlePurgeLogs}
                    className="bg-destructive hover:bg-destructive/90 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest"
                  >
                    Confirm Purge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button variant="neu" className="h-12 gap-2 font-black text-[10px] uppercase tracking-widest px-6 shadow-xl">
               <Download className="h-4 w-4 text-secondary" />
               Export PDF
            </Button>
        </div>
      </div>

      <Card className="neu-card-shadow border-none rounded-[2rem] bg-white overflow-hidden shadow-2xl">
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                <Search className="h-3 w-3" /> Keyword Search
              </label>
              <Input 
                placeholder="Name, ID, or Academic Year..." 
                className="h-12 rounded-xl border-2 font-bold focus:ring-primary shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                <Building2 className="h-3 w-3" /> Institutional Unit
              </label>
              <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold focus:ring-primary shadow-inner">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-3xl max-h-[300px]">
                  <SelectItem value="all" className="font-bold">Institutional (All)</SelectItem>
                  {NEU_COLLEGES.map(c => (
                    <SelectItem key={c.id} value={c.id} className="font-bold">{c.id} • {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                <BookOpen className="h-3 w-3" /> Core Activity
              </label>
              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold focus:ring-primary shadow-inner">
                  <SelectValue placeholder="All Activities" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-3xl max-h-[300px]">
                  <SelectItem value="all" className="font-bold">All Purposes</SelectItem>
                  {PURPOSES.map(p => (
                    <SelectItem key={p} value={p} className="font-bold capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                <UserCheck className="h-3 w-3" /> Access Role
              </label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold focus:ring-primary shadow-inner">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-3xl">
                  <SelectItem value="all" className="font-bold">All Roles</SelectItem>
                  <SelectItem value="user" className="font-bold">Member (User)</SelectItem>
                  <SelectItem value="guest" className="font-bold">Visitor (Guest)</SelectItem>
                  <SelectItem value="admin" className="font-bold">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest italic bg-primary/5 px-4 py-1 rounded-full border border-primary/10">
                  {filteredVisits.length} matching entries found
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 gap-2 rounded-xl"
              >
                <XCircle className="h-3.5 w-3.5" />
                Clear Active Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary p-8 rounded-[2rem] flex items-center justify-between text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-dot-pattern opacity-10" />
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-1">Total Registry</p>
                <span className="text-5xl font-black italic tracking-tighter">{isLoading ? "---" : (visits?.length || 0)}</span>
            </div>
            <Users className="h-14 w-14 text-secondary opacity-20 group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="bg-white p-8 rounded-[2rem] flex items-center justify-between text-primary shadow-xl border border-white/50 relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60 mb-1">Unique Visitors</p>
                <span className="text-5xl font-black italic tracking-tighter text-primary">{isLoading ? "---" : uniqueUserCount}</span>
            </div>
            <UserCheck className="h-14 w-14 text-secondary opacity-40 group-hover:rotate-12 transition-transform duration-700" />
        </div>
        <Card className="neu-card-shadow border-none rounded-[2rem] bg-white p-8 flex flex-col justify-center items-center shadow-xl group hover:bg-primary/5 transition-all duration-500 cursor-default border border-white/50">
            <Calendar className="h-10 w-10 text-primary mb-3 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-primary italic">Live Institutional Telemetry</span>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-none">
              <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-[0.4em] px-8">Institutional Visitor</TableHead>
              <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-[0.4em]">Origin / Unit</TableHead>
              <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-[0.4em]">Activity Context</TableHead>
              <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-[0.4em]">Academic Year</TableHead>
              <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-[0.4em] px-8 text-right">Registry Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24">
                <div className="flex flex-col items-center gap-5">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Syncing Institutional Registry...</span>
                </div>
              </TableCell></TableRow>
            ) : filteredVisits.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-32 text-muted-foreground italic">
                <div className="flex flex-col items-center gap-6">
                    <XCircle className="h-16 w-16 opacity-10" />
                    <p className="font-black text-lg uppercase tracking-tighter opacity-50">No matching telemetry detected.</p>
                </div>
              </TableCell></TableRow>
            ) : filteredVisits.map((visit, i) => (
              <TableRow key={visit.id} className="hover:bg-muted/30 border-b transition-colors duration-500">
                <TableCell className="font-black py-8 text-primary px-8 text-lg tracking-tight italic">{visit.userName}</TableCell>
                <TableCell className="font-black text-muted-foreground text-[11px] uppercase tracking-widest">{visit.college}</TableCell>
                <TableCell>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] bg-secondary/10 text-primary px-6 py-2 rounded-full border border-secondary/20 shadow-sm italic">
                    {visit.purpose}
                  </span>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <span className="text-[11px] font-black text-primary italic uppercase tracking-tighter">AY {visit.academicYear || "2024-25"}</span>
                   </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-black text-[11px] italic uppercase tracking-widest px-8 text-right">
                  {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd, yyyy • h:mm a') : 'Streaming...'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

