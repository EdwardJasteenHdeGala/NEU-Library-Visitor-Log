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
  AlertDialogDescription, // FIXED IMPORT
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
    <div className="space-y-[2rem] animate-in fade-in duration-500 pb-[2.5rem]">
      <div className="flex flex-col gap-[1rem]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[1rem]">
          <div className="space-y-[0.25rem]">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack} 
                className="mb-[0.5rem] -ml-[0.5rem] text-muted-foreground font-bold text-[0.625rem] uppercase gap-[0.5rem] h-[2.25rem]"
              >
                <ArrowLeft className="h-[1rem] w-[1rem]" />
                Return
              </Button>
            )}
            <h2 className="text-[1.5rem] md:text-[2rem] font-bold tracking-tight text-slate-900 uppercase italic">Visitor Registry</h2>
            <p className="text-[0.625rem] md:text-[0.75rem] text-muted-foreground font-black uppercase tracking-widest">Institutional Audit Console</p>
          </div>
          <div className="flex flex-wrap gap-[0.5rem] w-full sm:w-auto">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-[2.5rem] md:h-[2.75rem] flex-1 sm:flex-none gap-[0.5rem] font-bold text-[0.625rem] uppercase rounded-[0.75rem] text-destructive border-destructive/20 hover:bg-destructive/5">
                  <Trash2 className="h-[1rem] w-[1rem]" />
                  Purge Registry
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[95vw] max-w-[28rem] rounded-[1.5rem] border-none shadow-3xl bg-white p-[2rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[1.25rem] font-black italic uppercase tracking-tighter text-primary">Institutional Data Purge</AlertDialogTitle>
                  <AlertDialogDescription className="text-[0.875rem] font-medium italic opacity-70">
                    This action will permanently terminate all {visits?.length} recorded logs from the institutional archive. This process is irreversible and will be logged in the system audit trail.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-[0.75rem] pt-[1.5rem]">
                  <AlertDialogCancel className="rounded-[0.75rem] h-[3rem] text-[0.625rem] font-black uppercase tracking-widest w-full sm:w-auto border-2">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePurgeLogs} className="rounded-[0.75rem] h-[3rem] bg-destructive text-white text-[0.625rem] font-black uppercase tracking-widest w-full sm:w-auto shadow-lg">Confirm Purge</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="default" size="sm" className="h-[2.5rem] md:h-[2.75rem] flex-1 sm:flex-none gap-[0.5rem] font-bold text-[0.625rem] uppercase rounded-[0.75rem] shadow-lg">
              <Download className="h-[1rem] w-[1rem]" />
              Export Archive
            </Button>
          </div>
        </div>

        <div className="sticky top-0 z-40 py-[0.5rem] bg-background/80 backdrop-blur-md -mx-[1.5rem] px-[1.5rem] md:mx-0 md:px-0">
          <div className="flex flex-col gap-[0.75rem]">
            <div className="relative group">
              <Search className="absolute left-[1rem] top-1/2 -translate-y-1/2 h-[1.25rem] w-[1.25rem] text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Universal Registry Search (Name, Purpose, ID...)" 
                className="pl-[3rem] h-[3.5rem] md:h-[4rem] rounded-[1.25rem] shadow-xl border-2 text-[1rem] font-bold italic focus:ring-primary bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[0.5rem] md:gap-[1rem]">
              <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                <SelectTrigger className="h-[3rem] text-[0.625rem] font-black uppercase tracking-widest rounded-[0.75rem] border-2 bg-white">
                  <div className="flex items-center gap-[0.5rem]"><Building2 className="h-[1rem] w-[1rem] opacity-50" /><SelectValue placeholder="All Units" /></div>
                </SelectTrigger>
                <SelectContent className="rounded-[0.75rem] border-none shadow-2xl">
                  <SelectItem value="all" className="text-[0.625rem] font-bold uppercase">ALL DEPARTMENTS</SelectItem>
                  {NEU_COLLEGES.map(c => <SelectItem key={c.id} value={c.id} className="text-[0.625rem] font-medium">{c.id}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger className="h-[3rem] text-[0.625rem] font-black uppercase tracking-widest rounded-[0.75rem] border-2 bg-white">
                  <div className="flex items-center gap-[0.5rem]"><BookOpen className="h-[1rem] w-[1rem] opacity-50" /><SelectValue placeholder="All Purposes" /></div>
                </SelectTrigger>
                <SelectContent className="rounded-[0.75rem] border-none shadow-2xl">
                  <SelectItem value="all" className="text-[0.625rem] font-bold uppercase">ALL PURPOSES</SelectItem>
                  {PURPOSES.map(p => <SelectItem key={p} value={p} className="text-[0.625rem] font-medium capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-[3rem] text-[0.625rem] font-black uppercase tracking-widest rounded-[0.75rem] border-2 bg-white">
                  <div className="flex items-center gap-[0.5rem]"><UserCheck className="h-[1rem] w-[1rem] opacity-50" /><SelectValue placeholder="All Roles" /></div>
                </SelectTrigger>
                <SelectContent className="rounded-[0.75rem] border-none shadow-2xl">
                  <SelectItem value="all" className="text-[0.625rem] font-bold uppercase">ALL ROLES</SelectItem>
                  <SelectItem value="user" className="text-[0.625rem] font-medium">STUDENT</SelectItem>
                  <SelectItem value="guest" className="text-[0.625rem] font-medium">GUEST</SelectItem>
                  <SelectItem value="admin" className="text-[0.625rem] font-medium">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1.5rem]">
        <div className="bg-primary p-[1.5rem] rounded-[1.25rem] flex items-center justify-between text-white shadow-xl group hover:scale-[1.02] transition-transform">
          <div className="space-y-[0.25rem]">
            <p className="text-[0.5625rem] font-black uppercase tracking-[0.2em] opacity-60">Total Sessions</p>
            <span className="text-[2rem] font-black italic">{filteredVisits.length}</span>
          </div>
          <History className="h-[2.5rem] w-[2.5rem] opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
        <div className="bg-white border-2 p-[1.5rem] rounded-[1.25rem] flex items-center justify-between text-primary shadow-xl group hover:scale-[1.02] transition-transform">
          <div className="space-y-[0.25rem]">
            <p className="text-[0.5625rem] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Unique Visitors</p>
            <span className="text-[2rem] font-black italic">{Object.keys(visitFrequencyMap).length}</span>
          </div>
          <Users className="h-[2.5rem] w-[2.5rem] opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
        <div className="bg-white border-2 p-[1.5rem] rounded-[1.25rem] flex items-center justify-between text-primary shadow-xl group hover:scale-[1.02] transition-transform sm:col-span-2 lg:col-span-1">
          <div className="space-y-[0.25rem]">
            <p className="text-[0.5625rem] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Avg. Residence (Min)</p>
            <span className="text-[2rem] font-black italic">
              {filteredVisits.length > 0 
                ? Math.round(filteredVisits.reduce((acc, v) => acc + (v.durationMinutes || 0), 0) / filteredVisits.length) 
                : 0}
            </span>
          </div>
          <Clock className="h-[2.5rem] w-[2.5rem] opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
      </div>

      <Card className="shadow-2xl border-none rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-black text-[0.625rem] uppercase tracking-widest py-[1.5rem] px-[1.5rem] md:px-[2rem]">Visitor Identity</TableHead>
                <TableHead className="font-black text-[0.625rem] uppercase tracking-widest py-[1.5rem] hidden sm:table-cell">Dept</TableHead>
                <TableHead className="font-black text-[0.625rem] uppercase tracking-widest py-[1.5rem]">Status</TableHead>
                <TableHead className="font-black text-[0.625rem] uppercase tracking-widest py-[1.5rem] hidden md:table-cell">Stay (Min)</TableHead>
                <TableHead className="font-black text-[0.625rem] uppercase tracking-widest py-[1.5rem] px-[1.5rem] md:px-[2rem] text-right">Handshake Sync</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-[5rem] font-bold text-[0.75rem] uppercase tracking-widest text-muted-foreground animate-pulse">Decrypting Archive...</TableCell></TableRow>
              ) : filteredVisits.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-[5rem] italic text-muted-foreground">No matching institutional logs detected.</TableCell></TableRow>
              ) : filteredVisits.map((visit) => (
                <TableRow key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="py-[1.5rem] px-[1.5rem] md:px-[2rem]">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[0.875rem] font-black text-primary italic truncate">{visit.userName}</span>
                      <span className="text-[0.5625rem] font-bold text-muted-foreground uppercase tracking-tight truncate">{visit.purpose}</span>
                      <span className="text-[0.5rem] font-bold text-primary/40 block sm:hidden uppercase mt-[0.25rem]">{visit.college}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[0.625rem] font-black text-primary uppercase italic hidden sm:table-cell">{visit.college}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-[0.5rem]">
                      <Badge variant="secondary" className="text-[0.5rem] md:text-[0.5625rem] font-black uppercase tracking-tight hidden xs:inline-flex">
                        {visitFrequencyMap[visit.userId]}x
                      </Badge>
                      <span className={cn("text-[0.5625rem] md:text-[0.625rem] font-black uppercase italic", visit.exitTimestamp ? "text-green-600" : "text-secondary animate-pulse")}>
                        {visit.exitTimestamp ? "Terminated" : "Active Session"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-[0.625rem] font-black text-slate-500 uppercase italic">
                      {visit.exitTimestamp ? `${visit.durationMinutes}m` : "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[0.5625rem] font-black px-[1.5rem] md:px-[2rem] text-right uppercase italic tracking-tighter">
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
