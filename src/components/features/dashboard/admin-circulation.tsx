"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Library, 
  Search, 
  RotateCcw, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Download,
  ArrowLeft,
  Filter,
  User,
  Book as BookIcon,
  Calendar,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { libraryService, BorrowingRecord } from "@/services/library-service";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { EmptyState } from "@/components/ui/empty-state";
import Image from "next/image";

interface AdminCirculationProps {
  onBack?: () => void;
}

export function AdminCirculation({ onBack }: AdminCirculationProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const { profile } = useAuth();
  const isAdmin = profile?.isAuthorizedAdmin === true;

  const borrowingsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, "borrowings"), orderBy("borrowDate", "desc"), limit(100));
  }, [firestore, isAdmin]);

  const { data: borrowings, isLoading } = useCollection<BorrowingRecord>(borrowingsQuery);

  const filteredBorrowings = useMemo(() => {
    if (!borrowings) return [];
    const term = debouncedSearch.toLowerCase().trim();
    if (!term) return borrowings;

    return borrowings.filter(b => 
      b.bookTitle.toLowerCase().includes(term) || 
      b.userName.toLowerCase().includes(term) ||
      b.status.toLowerCase().includes(term)
    );
  }, [borrowings, debouncedSearch]);

  const handleReturn = async (borrowing: BorrowingRecord) => {
    if (!firestore || !borrowing.id) return;
    
    setIsProcessing(borrowing.id);
    const result = await libraryService.returnBook(firestore, borrowing.id, borrowing.bookId);
    setIsProcessing(null);

    if (result.success) {
      toast({
        title: "Book Returned",
        description: `"${borrowing.bookTitle}" has been successfully restocked in the inventory.`,
      });
    } else {
      toast({
        title: "Return Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const overdueCount = borrowings?.filter(b => b.status === 'active' && b.dueDate.toDate() < new Date()).length || 0;

  return (
    <div className="space-y-[2.5rem] animate-in fade-in duration-700 pb-[5rem]">
      {/* Institutional Circulation Header */}
      <div className="flex flex-col gap-[1.5rem]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[1.5rem]">
          <div className="space-y-[0.5rem]">
            <h2 className="text-[2rem] md:text-[3.5rem] font-black tracking-tighter text-primary uppercase italic leading-none text-glow-primary">Circulation Manager</h2>
            <p className="text-[0.625rem] md:text-[0.875rem] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 leading-none">Institutional Resource Oversight</p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end hidden md:flex">
                <span className="text-[12px] font-black text-destructive uppercase tracking-widest leading-none mb-1">{overdueCount} Critical Overdue</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 tracking-widest leading-none italic">Awaiting Intervention</span>
             </div>
             <Button className="h-[3.5rem] px-8 gap-4 rounded-[1.5rem] shadow-2xl hover:scale-105 active:scale-95 transition-all bg-primary text-white font-black text-[11px] uppercase tracking-widest border-2 border-primary-foreground/10">
                <Download className="h-5 w-5 text-secondary" /> Export Audit Log
             </Button>
          </div>
        </div>

        {/* Global Filter */}
        <div className="sticky top-0 z-40 py-6 bg-background/90 backdrop-blur-md rounded-b-[2rem] shadow-sm border-b border-border">
          <div className="relative group w-full max-w-4xl mx-auto">
            <Search className="absolute left-[1.5rem] top-1/2 -translate-y-1/2 h-[1.25rem] w-[1.25rem] text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              id="hub-circulation-search"
              name="circulation-search"
              aria-label="Filter Institutional Circulation Records"
              placeholder="Filter by Member, Title, or Circulation Status..." 
              className="pl-[4rem] h-[3.5rem] rounded-[1.25rem] shadow-xl border-2 text-[0.875rem] font-bold italic focus:ring-primary bg-muted/30 border-border transition-all focus:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[2rem]">
        {/* Main Circulation Table */}
        <div className="lg:col-span-12">
          <Card className="neu-card-shadow border-none rounded-[2rem] overflow-hidden bg-card shadow-2xl ring-1 ring-border">
            <CardHeader className="bg-muted/30 p-8 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black text-primary flex items-center gap-3 uppercase italic">
                <Library className="h-5 w-5 text-secondary" /> Live Circulation Grid
              </CardTitle>
              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase opacity-40">
                <Clock className="h-4 w-4" /> System Real-time Sync
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest px-8">Member Identity</TableHead>
                    <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest">Resource Context</TableHead>
                    <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest">Temporal Logic</TableHead>
                    <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest">Circulation Status</TableHead>
                    <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest text-right px-8">Intervention</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20 font-bold text-muted-foreground uppercase animate-pulse">Synchronizing Data Node...</TableCell></TableRow>
                  ) : filteredBorrowings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-40">
                        <EmptyState 
                          icon={Library} 
                          title="No Active Circulation" 
                          message="No resources are currently being tracked in this segment of the institutional archive." 
                        />
                      </TableCell>
                    </TableRow>
                  ) : filteredBorrowings.map((b) => {
                    const isOverdue = b.status === 'active' && b.dueDate.toDate() < new Date();
                    return (
                      <TableRow key={b.id} className="hover:bg-muted/30 transition-colors group">
                        <TableCell className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/5 rounded-full flex items-center justify-center border-2 border-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-primary italic text-sm">{b.userName}</span>
                              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Registered ID: {b.userId.slice(0, 8)}...</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-10 relative bg-muted rounded shadow-md ring-1 ring-border group-hover:scale-110 transition-transform overflow-hidden">
                              {b.bookCover ? (
                                <Image src={b.bookCover} alt={b.bookTitle} fill className="object-cover" />
                              ) : (
                                <BookIcon className="h-full w-full p-2 text-primary/20" />
                              )}
                            </div>
                            <span className="font-black text-primary text-xs uppercase italic tracking-tight max-w-[200px] truncate">{b.bookTitle}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                              <Calendar className="h-3 w-3" /> Issue: {b.borrowDate?.toDate ? format(b.borrowDate.toDate(), 'MMM dd, HH:mm') : '...'}
                            </div>
                             <div className={cn(
                                "flex items-center gap-2 text-[9px] font-black uppercase tracking-widest",
                                isOverdue ? "text-destructive" : "text-secondary"
                             )}>
                              <Clock className="h-3 w-3" /> Due: {b.dueDate?.toDate ? format(b.dueDate.toDate(), 'MMM dd') : '...'}
                            </div>
                            {b.renewalCount ? (
                              <div className="text-[8px] font-black text-secondary uppercase tracking-[0.2em] pt-1">
                                [Extended ×{b.renewalCount}]
                              </div>
                            ) : (
                               <div className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] pt-1">
                                [Standard Term]
                               </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            b.status === 'returned' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                            isOverdue ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" :
                            "bg-primary/10 text-primary border-primary/20"
                          )}>
                             {b.status === 'returned' && <CheckCircle2 className="h-3 w-3" />}
                             {isOverdue && <AlertCircle className="h-3 w-3" />}
                             {b.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          {b.status === 'active' && (
                            <Button 
                                onClick={() => handleReturn(b)}
                                disabled={isProcessing === b.id}
                                variant="outline" 
                                size="sm" 
                                className="h-10 gap-2 font-black text-[9px] uppercase tracking-widest rounded-xl border-2 hover:bg-primary hover:text-white transition-all active:scale-95"
                            >
                                {isProcessing === b.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                                Process Return
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
