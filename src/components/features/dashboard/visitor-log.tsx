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
  History,
  Briefcase,
  Calendar
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useRegistry } from "@/hooks/use-registry";
import { Visit } from "@/types/visitor";
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
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useDebounce } from "@/hooks/use-debounce";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { NEU_COLLEGES, LIBRARY_PURPOSES } from "@/lib/constants";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";



const DESIGNATIONS = [
  { id: 'student', label: 'Student' },
  { id: 'professor', label: 'Professor' },
  { id: 'staff', label: 'Staff' },
  { id: 'guest', label: 'Guest' }
];

interface VisitorLogProps {
  onBack?: () => void;
}

export function VisitorLog({ onBack }: VisitorLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [collegeFilters, setCollegeFilters] = useState<string[]>([]);
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [displayLimit, setDisplayLimit] = useState(50);
  
  const registry = useRegistry();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const isAdmin = profile?.isAuthorizedAdmin === true;

  const visitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !registry) return null;
    return registry.getVisitsQuery(displayLimit);
  }, [registry, isAdmin, displayLimit]);

  const { data: visits, isLoading } = useCollection<Visit>(visitsQuery);

  const filteredVisits = useMemo(() => {
    if (!visits) return [];
    const term = debouncedSearchTerm.toLowerCase().trim();

    return visits.filter(visit => {
      const matchName = visit.userName?.toLowerCase().includes(term);
      const matchCollegeId = visit.college?.toLowerCase().includes(term);
      const matchesSearch = !term || matchName || matchCollegeId;
      
      const matchesCollege = collegeFilters.length === 0 || collegeFilters.includes(visit.college);
      const matchesPurpose = purposeFilter === "all" || visit.purpose === purposeFilter;
      const matchesDesignation = designationFilter === "all" || visit.designation === designationFilter;

      // Date Range Logic
      let matchesTime = true;
      if (dateRange?.from && visit.timestamp) {
        const visitDate = visit.timestamp.toDate();
        const vDate = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
        const fromDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate());
          matchesTime = vDate >= fromDate && vDate <= toDate;
        } else {
          matchesTime = vDate.getTime() === fromDate.getTime();
        }
      }

      return matchesSearch && matchesCollege && matchesPurpose && matchesDesignation && matchesTime;
    });
  }, [visits, debouncedSearchTerm, collegeFilters, purposeFilter, designationFilter, dateRange]);



  const handlePurgeLogs = async () => {
    if (!visits || visits.length === 0 || !registry || !profile) return;
    await registry.purgeLogs(visits, profile.id, profile.displayName || 'Admin');
    toast({
      title: "Log Purge Complete",
      description: `Successfully removed ${visits.length} records.`,
    });
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 50);
  };

  const handleExportCSV = () => {
    if (!filteredVisits || filteredVisits.length === 0 || !registry) {
      toast({ title: "Export Failed", description: "No records to export.", variant: "destructive" });
      return;
    }

    const csvContent = registry.formatCSV(filteredVisits);
    registry.downloadCSV(csvContent, `visitor_archive_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    
    toast({ title: "Export Complete", description: "Registry data downloaded successfully." });
  };

  return (
    <div className="space-y-[2.5rem] animate-in fade-in duration-700 pb-[5rem]">
      {/* Header Alignment */}
      <div className="flex flex-col gap-[1.5rem]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[1.5rem]">
          <div className="space-y-[0.5rem]">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack} 
                className="mb-[0.75rem] -ml-[0.75rem] text-muted-foreground font-black text-[0.625rem] uppercase tracking-[0.3em] gap-[0.5rem] h-[2.5rem] rounded-[1rem] hover:bg-primary/5 transition-all"
              >
                <ArrowLeft className="h-[1.25rem] w-[1.25rem]" />
                Return to Dashboard
              </Button>
            )}
            <h2 className="text-[2rem] md:text-[3.5rem] font-black tracking-tighter text-primary uppercase italic leading-none text-glow-primary">Visitor Registry</h2>
            <p className="text-[0.625rem] md:text-[0.875rem] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 leading-none">Institutional Access & Audit Console</p>
          </div>
        </div>

        {/* Premium Filter Console */}
        <div className="sticky top-0 z-40 py-6 bg-background/90 backdrop-blur-md rounded-b-[2rem] border-b border-border shadow-sm space-y-6 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[1.5rem] max-w-7xl mx-auto px-1">
            <div className="relative group flex-1">
              <Search className="absolute left-[1.5rem] top-1/2 -translate-y-1/2 h-[1.5rem] w-[1.5rem] text-muted-foreground group-focus-within:text-primary transition-all" />
              <Input 
                id="hub-visitor-registry-search"
                name="visitor-search"
                aria-label="Universal Registry Search"
                placeholder="Universal Registry Search (Name, Purpose, ID...)" 
                className="pl-[4rem] h-[3.5rem] rounded-[1.25rem] shadow-xl border-2 text-[0.875rem] font-bold italic focus:ring-primary bg-card border-border transition-all focus:scale-[1.01]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-[0.75rem]">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="h-[3.5rem] px-8 gap-3 font-black text-[0.75rem] uppercase tracking-widest rounded-[1.25rem] text-destructive border-destructive/20 hover:bg-destructive/5 transition-all active:scale-95 shadow-lg bg-background border-2">
                    <Trash2 className="h-[1.25rem] w-[1.25rem]" />
                    Purge Archive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[95vw] max-w-[32rem] rounded-[2.5rem] border-none shadow-3xl bg-card p-10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[1.5rem] font-black italic uppercase tracking-tighter text-primary">Institutional Data Purge</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs font-medium opacity-60 leading-relaxed">
                      Terminate all <span className="font-black text-destructive">{visits?.length}</span> recorded logs from the institutional archive. Irreversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-4 pt-6">
                    <AlertDialogCancel className="rounded-xl h-14 text-[10px] font-black uppercase tracking-widest w-full sm:w-auto border-2 px-8">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePurgeLogs} className="rounded-xl h-14 bg-destructive text-white text-[10px] font-black uppercase tracking-widest w-full sm:w-auto shadow-2xl px-10 hover:bg-destructive/90 transition-all active:scale-95">Confirm Purge</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleExportCSV} variant="default" className="h-[3.5rem] px-8 gap-3 font-black text-[0.75rem] uppercase tracking-widest rounded-[1.25rem] shadow-2xl hover:scale-105 transition-all active:scale-95 bg-primary border-b-4 border-primary/20">
                <Download className="h-[1.25rem] w-[1.25rem] text-secondary" />
                Export Archive
              </Button>
            </div>
          </div>
            
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[0.75rem] max-w-7xl mx-auto px-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-[3rem] text-[0.625rem] font-black uppercase tracking-tight rounded-[0.75rem] border-2 bg-muted/30 border-border justify-between px-3 w-full min-w-0 overflow-hidden transition-all hover:bg-background focus:bg-background">
                  <div className="flex items-center gap-[0.5rem] min-w-0">
                    <Building2 className="h-[1rem] w-[1rem] opacity-50 shrink-0" />
                    <span className="truncate">
                      {collegeFilters.length > 0 ? `${collegeFilters.length} UNITS SELECTED` : "ALL ACADEMIC UNITS"}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-[1rem] shadow-2xl border-none p-2 max-h-[300px] overflow-y-auto">
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground p-2">Filter Academic Units</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer gap-2 rounded-lg font-bold text-xs p-3"
                  onClick={(e) => { e.preventDefault(); setCollegeFilters([]); }}
                >
                  <div className="w-4 h-4 rounded border flex items-center justify-center mr-2">
                    {collegeFilters.length === 0 && <Check className="h-3 w-3 text-primary" />}
                  </div>
                  All Units
                </DropdownMenuItem>
                {NEU_COLLEGES.map(c => {
                  const isSelected = collegeFilters.includes(c.id);
                  return (
                    <DropdownMenuItem 
                      key={c.id}
                      className="cursor-pointer gap-2 rounded-lg font-bold text-xs p-3"
                      onClick={(e) => {
                        e.preventDefault();
                        if (isSelected) {
                          setCollegeFilters(prev => prev.filter(id => id !== c.id));
                        } else {
                          setCollegeFilters(prev => [...prev, c.id]);
                        }
                      }}
                    >
                      <div className={cn("w-4 h-4 rounded border flex items-center justify-center mr-2", isSelected ? "bg-primary border-primary text-primary-foreground" : "")}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      {c.name} ({c.id})
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={designationFilter} onValueChange={setDesignationFilter}>
              <SelectTrigger className="h-[3rem] text-[0.625rem] font-black uppercase tracking-tight rounded-[0.75rem] border-2 bg-muted/30 border-border transition-all hover:bg-background focus:bg-background min-w-0 overflow-hidden">
                <div className="flex items-center gap-[0.5rem] min-w-0">
                  <Briefcase className="h-[1rem] w-[1rem] opacity-50 shrink-0" />
                  <div className="truncate"><SelectValue placeholder="All Designations" /></div>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-[0.75rem] border-none shadow-2xl">
                <SelectItem value="all" className="text-[0.625rem] font-bold uppercase">ALL DESIGNATIONS</SelectItem>
                {DESIGNATIONS.map(d => <SelectItem key={d.id} value={d.id} className="text-[0.625rem] font-medium">{d.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <DatePickerWithRange 
              date={dateRange} 
              setDate={setDateRange} 
            />

            <Select value={purposeFilter} onValueChange={setPurposeFilter}>
              <SelectTrigger className="h-[3rem] text-[0.625rem] font-black uppercase tracking-tight rounded-[0.75rem] border-2 bg-muted/30 border-border transition-all hover:bg-background focus:bg-background min-w-0 overflow-hidden">
                <div className="flex items-center gap-[0.5rem] min-w-0">
                  <BookOpen className="h-[1rem] w-[1rem] opacity-50 shrink-0" />
                  <div className="truncate"><SelectValue placeholder="All Purposes" /></div>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-[0.75rem] border-none shadow-2xl">
                <SelectItem value="all" className="text-[0.625rem] font-bold uppercase">ALL PURPOSES</SelectItem>
                {LIBRARY_PURPOSES.map(p => <SelectItem key={p.id} value={p.id} className="text-[0.625rem] font-medium capitalize">{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="neu-card-shadow border-none rounded-[2rem] overflow-hidden bg-card shadow-2xl ring-1 ring-border">
        <div className="p-8 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-black text-primary uppercase italic tracking-tighter flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            Institutional Audit Registry
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase opacity-40">
            <Clock className="h-3 w-3" /> System Synchronized Grid
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="sticky top-0 z-20 bg-muted/95 backdrop-blur-sm border-b-2 border-border shadow-sm transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <TableHead className="w-[14.285%] font-black text-[0.625rem] uppercase tracking-widest py-4 px-[1rem] md:px-[2rem] border-r border-border h-16">Visitor Identity</TableHead>
                  <TableHead className="w-[14.285%] font-black text-[0.625rem] uppercase tracking-widest py-4 border-r border-border h-16">Campus Unit</TableHead>
                  <TableHead className="w-[14.285%] font-black text-[0.625rem] uppercase tracking-widest py-4 border-r border-border h-16">Role/Stats</TableHead>
                  <TableHead className="w-[14.285%] font-black text-[0.625rem] uppercase tracking-widest py-4 border-r border-border h-16">Registry Entry</TableHead>
                  <TableHead className="w-[14.285%] font-black text-[0.625rem] uppercase tracking-widest py-4 border-r border-border h-16">Registry Exit</TableHead>
                  <TableHead className="w-[14.285%] font-black text-[0.625rem] uppercase tracking-widest py-4 border-r border-border h-16 text-center">Duration</TableHead>
                  <TableHead className="w-[14.285%] font-black text-[0.625rem] uppercase tracking-widest py-4 px-[1rem] md:px-[2rem] text-right h-16">Audit Sync</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-[5rem] font-bold text-[0.75rem] uppercase tracking-widest text-muted-foreground animate-pulse">Decrypting Archive...</TableCell></TableRow>
                ) : filteredVisits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-20">
                      <EmptyState 
                        icon={History} 
                        title="No Access Records" 
                        message="Try adjusting your filters or temporal range to synchronize with the institutional archive." 
                      />
                    </TableCell>
                  </TableRow>
                ) : filteredVisits.map((visit) => (
                  <TableRow key={visit.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="w-[14.285%] py-[1.5rem] px-[1rem] md:px-[2rem]">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[0.875rem] font-black text-primary italic truncate">{visit.userName}</span>
                        <span className="text-[0.5625rem] font-bold text-muted-foreground uppercase tracking-tight truncate">
                          {LIBRARY_PURPOSES.find(p => p.id === visit.purpose)?.label || visit.purpose}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[14.285%] text-[0.625rem] font-black text-primary uppercase italic">{visit.college}</TableCell>
                    <TableCell className="w-[14.285%]">
                      <Badge variant="outline" className="text-[0.5rem] font-black uppercase whitespace-nowrap">{visit.designation || 'Member'}</Badge>
                    </TableCell>
                    <TableCell className="w-[14.285%] text-muted-foreground text-[0.5625rem] font-black uppercase italic tracking-tighter">
                      {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd • HH:mm') : 'Syncing'}
                    </TableCell>
                    <TableCell className="w-[14.285%]">
                      <span className={cn("text-[0.5625rem] md:text-[0.625rem] font-black uppercase italic", visit.exitTimestamp ? "text-green-600" : "text-secondary animate-pulse")}>
                        {visit.exitTimestamp ? format(visit.exitTimestamp.seconds * 1000, 'MMM dd • HH:mm') : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="w-[14.285%] text-[0.625rem] font-black text-primary uppercase italic text-center">
                      {visit.durationMinutes || "0"}
                    </TableCell>
                    <TableCell className="w-[14.285%] text-muted-foreground text-[0.5625rem] font-black px-[1rem] md:px-[2rem] text-right uppercase italic tracking-tighter">
                      {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'HH:mm:ss') : 'Sync'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="p-8 border-t flex flex-col items-center gap-4 bg-muted/10">
            {visits && visits.length >= displayLimit && (
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                className="font-black text-[10px] uppercase tracking-widest border-2 h-12 px-10 rounded-xl hover:bg-background shadow-lg transition-all active:scale-95"
              >
                Load Historical Logs (Showing {displayLimit})
              </Button>
            )}
            <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground uppercase opacity-30">
              <History className="h-3 w-3" /> End of Synchronized Segment
            </div>
        </div>
      </Card>
    </div>
  );
}