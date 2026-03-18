
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
  Loader2, 
  ArrowLeft,
  Building2,
  BookOpen,
  UserCheck,
  XCircle,
  Clock,
  History
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
import { Badge } from "@/components/ui/badge";

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

  // Frequency calculation for current user set
  const visitFrequencyMap = useMemo(() => {
    const map: Record<string, number> = {};
    filteredVisits.forEach(v => {
      map[v.userId] = (map[v.userId] || 0) + 1;
    });
    return map;
  }, [filteredVisits]);

  const handlePurgeLogs = () => {
    if (!visits || visits.length === 0) return;
    
    visits.forEach(visit => {
      const docRef = doc(firestore, 'visits', visit.id);
      deleteDocumentNonBlocking(docRef);
    });

    toast({
      title: "Log Purge Complete",
      description: `Successfully removed ${visits.length} records.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2 text-muted-foreground font-bold text-[10px] uppercase gap-2 rounded-lg">
          <ArrowLeft className="h-3 w-3" />
          Return to Dashboard
        </Button>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Visitor Registry</h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Institutional Audit Console</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 font-bold text-[10px] uppercase rounded-lg text-destructive border-destructive/20 hover:bg-destructive/5">
                <Trash2 className="h-3.5 w-3.5" />
                Purge Registry
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-bold">Institutional Data Purge</AlertDialogTitle>
                <AlertDialogDescription className="text-xs">
                  This action will permanently terminate all {visits?.length} recorded logs from the archive. This process is irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-lg text-[10px] font-bold uppercase">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handlePurgeLogs} className="rounded-lg bg-destructive text-[10px] font-bold uppercase">Confirm Purge</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="default" size="sm" className="h-9 gap-2 font-bold text-[10px] uppercase rounded-lg">
            <Download className="h-3.5 w-3.5" />
            Export Archive
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border rounded-xl">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Search className="h-3 w-3" /> Search
              </label>
              <Input 
                placeholder="Name or ID..." 
                className="h-10 text-xs rounded-lg border-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Building2 className="h-3 w-3" /> Dept
              </label>
              <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                <SelectTrigger className="h-10 text-xs font-bold rounded-lg border-2">
                  <SelectValue placeholder="All Depts" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-xs font-bold">ALL DEPARTMENTS</SelectItem>
                  {NEU_COLLEGES.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-xs font-medium">{c.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="h-3 w-3" /> Purpose
              </label>
              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger className="h-10 text-xs font-bold rounded-lg border-2">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-xs font-bold">ALL PURPOSES</SelectItem>
                  {PURPOSES.map(p => (
                    <SelectItem key={p} value={p} className="text-xs font-medium capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <UserCheck className="h-3 w-3" /> Role
              </label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 text-xs font-bold rounded-lg border-2">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-xs font-bold">ALL ROLES</SelectItem>
                  <SelectItem value="user" className="text-xs font-medium">STUDENT</SelectItem>
                  <SelectItem value="guest" className="text-xs font-medium">GUEST</SelectItem>
                  <SelectItem value="admin" className="text-xs font-medium">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary p-6 rounded-xl flex items-center justify-between text-white shadow-sm">
          <div className="space-y-1">
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Total Sessions</p>
            <span className="text-2xl font-bold">{filteredVisits.length}</span>
          </div>
          <History className="h-8 w-8 opacity-20" />
        </div>
        <div className="bg-white border p-6 rounded-xl flex items-center justify-between text-primary shadow-sm">
          <div className="space-y-1">
            <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Unique Visitors</p>
            <span className="text-2xl font-bold">{Object.keys(visitFrequencyMap).length}</span>
          </div>
          <Users className="h-8 w-8 opacity-20" />
        </div>
        <div className="bg-white border p-6 rounded-xl flex items-center justify-between text-primary shadow-sm">
          <div className="space-y-1">
            <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Avg. Stay (Min)</p>
            <span className="text-2xl font-bold">
              {filteredVisits.length > 0 
                ? Math.round(filteredVisits.reduce((acc, v) => acc + (v.durationMinutes || 0), 0) / filteredVisits.length) 
                : 0}
            </span>
          </div>
          <Clock className="h-8 w-8 opacity-20" />
        </div>
      </div>

      <Card className="shadow-sm border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-[9px] uppercase py-4 px-6">Visitor</TableHead>
              <TableHead className="font-bold text-[9px] uppercase py-4">Dept</TableHead>
              <TableHead className="font-bold text-[9px] uppercase py-4">Frequency</TableHead>
              <TableHead className="font-bold text-[9px] uppercase py-4">Stay (Min)</TableHead>
              <TableHead className="font-bold text-[9px] uppercase py-4 px-6 text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 font-bold text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Archive...</TableCell></TableRow>
            ) : filteredVisits.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 italic text-muted-foreground">No matching institutional logs detected.</TableCell></TableRow>
            ) : filteredVisits.map((visit) => (
              <TableRow key={visit.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-semibold py-5 px-6">
                  <div className="flex flex-col">
                    <span className="text-sm">{visit.userName}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">{visit.purpose}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[10px] font-bold text-primary uppercase">{visit.college}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-tight">
                    {visitFrequencyMap[visit.userId]}x
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={cn("text-[10px] font-bold uppercase", visit.exitTimestamp ? "text-green-600" : "text-amber-600 animate-pulse")}>
                    {visit.exitTimestamp ? `${visit.durationMinutes}m` : "Active"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-[9px] font-bold px-6 text-right uppercase">
                  {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd • h:mm a') : 'Now'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
