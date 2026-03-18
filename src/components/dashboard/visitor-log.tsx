
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, Trash2, Download, Filter, Calendar, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

export function VisitorLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  // Guard admin-only listener to prevent permission errors
  const isAdmin = profile?.role === 'admin';

  const visitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'));
  }, [firestore, isAdmin]);

  const { data: visits, isLoading } = useCollection(visitsQuery);

  const filteredVisits = visits?.filter(visit => 
    visit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (visit.academicYear && visit.academicYear.includes(searchTerm))
  ) || [];

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary mb-2 italic uppercase">Visitor Registry</h2>
          <p className="text-muted-foreground font-medium">Real-time audit trail of all institutional access logs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search registry..." 
                    className="pl-10 h-12 rounded-xl shadow-sm border-2 w-[280px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                    variant="outline" 
                    className="h-12 gap-2 border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all font-black text-xs uppercase"
                    disabled={!visits || visits.length === 0}
                >
                    <Trash2 className="h-4 w-4" />
                    Reset Registry
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-black text-primary italic uppercase tracking-tighter">Reset Data Registry?</AlertDialogTitle>
                  <AlertDialogDescription className="text-base font-medium">
                    This action will permanently delete all {visits?.length} recorded visit logs from the database. This is irreversible and will reset all dashboard analytics.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handlePurgeLogs}
                    className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-black"
                  >
                    Confirm Purge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-primary p-6 rounded-2xl flex items-center justify-between text-white shadow-xl">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Logs</p>
                <span className="text-3xl font-black">{isLoading ? "---" : (visits?.length || 0)}</span>
            </div>
            <Users className="h-8 w-8 opacity-20" />
        </div>
        <div className="bg-secondary p-6 rounded-2xl flex items-center justify-between text-primary shadow-xl">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Unique Visitors</p>
                <span className="text-3xl font-black">{isLoading ? "---" : uniqueUserCount}</span>
            </div>
            <Users className="h-8 w-8 opacity-20" />
        </div>
        <Card className="neu-card-shadow border-none rounded-2xl p-6 flex flex-col justify-center">
            <Button variant="outline" className="h-full border-2 border-dashed border-muted-foreground/30 flex flex-col gap-2 group hover:border-primary transition-all">
                <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">Export Log History</span>
            </Button>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-2xl bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-none">
              <TableHead className="font-black text-primary py-4 uppercase text-[10px] tracking-widest">Name</TableHead>
              <TableHead className="font-black text-primary py-4 uppercase text-[10px] tracking-widest">College / Dept</TableHead>
              <TableHead className="font-black text-primary py-4 uppercase text-[10px] tracking-widest">Purpose</TableHead>
              <TableHead className="font-black text-primary py-4 uppercase text-[10px] tracking-widest">Academic Period</TableHead>
              <TableHead className="font-black text-primary py-4 uppercase text-[10px] tracking-widest">Recorded Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Synchronizing Registry...</span>
                </div>
              </TableCell></TableRow>
            ) : filteredVisits.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                <div className="flex flex-col items-center gap-3">
                    <Filter className="h-10 w-10 opacity-10" />
                    <p className="font-medium text-sm">No visitor entries found in the current log.</p>
                </div>
              </TableCell></TableRow>
            ) : filteredVisits.map((visit, i) => (
              <TableRow key={visit.id} className="hover:bg-muted/30 border-b">
                <TableCell className="font-black py-4 text-primary">{visit.userName}</TableCell>
                <TableCell className="font-medium">{visit.college}</TableCell>
                <TableCell>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-secondary/10 text-primary px-3 py-1 rounded-full border border-secondary/20">
                    {visit.purpose}
                  </span>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-secondary" />
                      <span className="text-xs font-bold text-primary italic">AY {visit.academicYear || "N/A"}</span>
                   </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-bold text-xs">
                  {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd, yyyy • h:mm a') : 'Syncing...'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
