"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Users, 
  Trash2, 
  Download, 
  Loader2, 
  ArrowLeft,
  Building2,
  BookOpen,
  UserCheck,
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
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter
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
    return query(
      collection(firestore, 'visits'), 
      orderBy('timestamp', 'desc')
    );
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
      deleteDocumentNonBlocking(doc(firestore, 'visits', visit.id));
    });
    toast({
      title: "Log Purge Complete",
      description: `Successfully removed ${visits.length} records.`,
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack} 
                className="mb-2 -ml-2 text-muted-foreground font-bold text-[10px] uppercase gap-2 h-9"
              >
                <ArrowLeft className="h-4 w-4" />
                Return
              </Button>
            )}
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 uppercase">Visitor Registry</h2>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-widest">Institutional Audit Console</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 md:h-11 flex-1 sm:flex-none gap-2 font-bold text-[10px] uppercase rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5">
                  <Trash2 className="h-4 w-4" />
                  Purge Logs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[95vw] max-w-md rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-bold">Institutional Data Purge</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs">
                    This action will permanently terminate all {visits?.length} recorded logs from the archive. This process is irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="rounded-xl h-12 text-[10px] font-bold uppercase w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePurgeLogs} className="rounded-xl h-12 bg-destructive text-[10px] font-bold uppercase w-full sm:w-auto">Confirm Purge</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="default" size="sm" className="h-10 md:h-11 flex-1 sm:flex-none gap-2 font-bold text-[10px] uppercase rounded-xl shadow-lg">
              <Download className="h-4 w-4" />
              Export Archive
            </Button>
          </div>
        </div>

        <div className="sticky top-0 z-40 py-2 bg-background/80 backdrop-blur-md -mx-6 px-6 md:mx-0 md:px-0">
          <div className="flex flex-col gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Universal Search (Name, Purpose, ID...)" 
                className="pl-12 h-14 md:h-16 rounded-2xl shadow-xl border-2 text-base font-bold italic focus:ring-primary bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
              <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                <SelectTrigger className="h-12 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 bg-white">
                  <div className="flex items-center gap-2"><Building2 className="h-4 w-4 opacity-50" /><SelectValue placeholder="All Units" /></div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-[10px] font-bold uppercase">ALL DEPARTMENTS</SelectItem>
                  {NEU_COLLEGES.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-medium">{c.id}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger className="h-12 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 bg-white">
                  <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 opacity-50" /><SelectValue placeholder="All Purposes" /></div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-[10px] font-bold uppercase">ALL PURPOSES</SelectItem>
                  {PURPOSES.map(p => <SelectItem key={p} value={p} className="text-[10px] font-medium capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-12 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 bg-white">
                  <div className="flex items-center gap-2"><UserCheck className="h-4 w-4 opacity-50" /><SelectValue placeholder="All Roles" /></div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-[10px] font-bold uppercase">ALL ROLES</SelectItem>
                  <SelectItem value="user" className="text-[10px] font-medium">STUDENT</SelectItem>
                  <SelectItem value="guest" className="text-[10px] font-medium">GUEST</SelectItem>
                  <SelectItem value="admin" className="text-[10px] font-medium">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-primary p-6 rounded-2xl flex items-center justify-between text-white shadow-xl group hover:scale-[1.02] transition-transform">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Total Sessions</p>
            <span className="text-3xl font-black italic">{filteredVisits.length}</span>
          </div>
          <History className="h-10 w-10 opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
        <div className="bg-white border-2 p-6 rounded-2xl flex items-center justify-between text-primary shadow-xl group hover:scale-[1.02] transition-transform">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Unique Visitors</p>
            <span className="text-3xl font-black italic">{Object.keys(visitFrequencyMap).length}</span>
          </div>
          <Users className="h-10 w-10 opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
        <div className="bg-white border-2 p-6 rounded-2xl flex items-center justify-between text-primary shadow-xl group hover:scale-[1.02] transition-transform sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Avg. Residence (Min)</p>
            <span className="text-3xl font-black italic">
              {filteredVisits.length > 0 
                ? Math.round(filteredVisits.reduce((acc, v) => acc + (v.durationMinutes || 0), 0) / filteredVisits.length) 
                : 0}
            </span>
          </div>
          <Clock className="h-10 w-10 opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
      </div>

      <Card className="shadow-2xl border-none rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-6 md:px-8">Visitor Identity</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 hidden sm:table-cell">Dept</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-6">Status</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 hidden md:table-cell">Stay (Min)</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-6 md:px-8 text-right">Synchronization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 font-bold text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Decrypting Archive...</TableCell></TableRow>
              ) : filteredVisits.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 italic text-muted-foreground">No matching institutional logs detected.</TableCell></TableRow>
              ) : filteredVisits.map((visit) => (
                <TableRow key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="py-6 px-6 md:px-8">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-black text-primary italic truncate">{visit.userName}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight truncate">{visit.purpose}</span>
                      <span className="text-[8px] font-bold text-primary/40 block sm:hidden uppercase mt-1">{visit.college}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-black text-primary uppercase italic hidden sm:table-cell">{visit.college}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[8px] md:text-[9px] font-black uppercase tracking-tight hidden xs:inline-flex">
                        {visitFrequencyMap[visit.userId]}x
                      </Badge>
                      <span className={cn("text-[9px] md:text-[10px] font-black uppercase italic", visit.exitTimestamp ? "text-green-600" : "text-amber-600 animate-pulse")}>
                        {visit.exitTimestamp ? "Terminated" : "Active"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-[10px] font-black text-slate-500 uppercase italic">
                      {visit.exitTimestamp ? `${visit.durationMinutes}m` : "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[9px] font-black px-6 md:px-8 text-right uppercase italic tracking-tighter">
                    {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd • HH:mm') : 'Syncing'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
