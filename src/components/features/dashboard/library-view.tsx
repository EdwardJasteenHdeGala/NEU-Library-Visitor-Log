"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Book as BookIcon, 
  BookOpen, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Info,
  History,
  Library as LibraryIcon,
  ChevronRight,
  Plus,
  Globe,
  User,
  Calendar,
  Activity,
  Sparkles,
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBooks, BookMetadata } from "@/hooks/use-books";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { libraryService, InventoryRecord } from "@/services/library-service";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import Image from "next/image";
import { collection, query, limit, where, orderBy } from "firebase/firestore";

interface LibraryViewProps {
  onBack?: () => void;
}

export function LibraryView({ onBack }: LibraryViewProps) {
  const [viewMode, setViewMode] = useState<'global' | 'shelf' | 'personal'>('global');
  const [searchTerm, setSearchTerm] = useState("");
  const { searchBooks, isLoading: isSearching } = useBooks();
  const [searchResults, setSearchResults] = useState<BookMetadata[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookMetadata | null>(null);
  const [isBorrowing, setIsBorrowing] = useState(false);
  
  const firestore = useFirestore();
  const { profile } = useAuth();
  const { toast } = useToast();

  // 1. Institutional Shelf Query
  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "books_inventory"), limit(24));
  }, [firestore]);

  const { data: inventory, isLoading: isLoadingShelf } = useCollection<InventoryRecord>(inventoryQuery);

  // 2. Personal Library Query
  const personalQuery = useMemoFirebase(() => {
    if (!firestore || !profile) return null;
    return query(
      collection(firestore, "borrowings"), 
      where("userId", "==", profile.id),
      orderBy("borrowDate", "desc")
    );
  }, [firestore, profile]);

  const { data: myBorrowings, isLoading: isLoadingPersonal } = useCollection<any>(personalQuery);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setViewMode('global');
    const results = await searchBooks(searchTerm);
    setSearchResults(results);
  };

  const handleBorrow = async () => {
    if (!selectedBook || !firestore || !profile) return;
    
    setIsBorrowing(true);
    const result = await libraryService.borrowBook(
      firestore,
      profile.id,
      profile.displayName || "Unknown Member",
      selectedBook
    );
    setIsBorrowing(false);

    if (result.success) {
      toast({
        title: "Borrowing Successful",
        description: `"${selectedBook.title}" has been added to your institutional holdings.`,
      });
      setSelectedBook(null);
    } else {
      toast({
        title: "Transaction Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleRenew = async (borrowingId: string) => {
    if (!firestore) return;
    
    const result = await libraryService.renewBook(firestore, borrowingId);
    if (result.success) {
      toast({
        title: "Borrowing Extended",
        description: "Due date has been advanced by 7 days per institutional policy.",
      });
    } else {
      toast({
        title: "Renewal Restricted",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-[2.5rem] animate-in fade-in duration-700 pb-[5rem]">
      {/* Header & Mode Switcher Alignment */}
      <div className="flex flex-col gap-[1.5rem]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[1.5rem]">
          <div className="space-y-[0.5rem]">
            <h2 className="text-[2rem] md:text-[3.5rem] font-black tracking-tighter text-primary uppercase italic leading-none text-glow-primary">Institutional Library</h2>
            <p className="text-[0.625rem] md:text-[0.875rem] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 leading-none">Knowledge Archive & Circulation</p>
          </div>

          <div className="flex bg-card/50 backdrop-blur-sm p-1.5 rounded-[1.5rem] border shadow-inner self-start ring-1 ring-border/50">
             {[
               { id: 'global', label: 'Global Catalog', icon: Globe },
               { id: 'shelf', label: 'On Campus', icon: LibraryIcon },
               { id: 'personal', label: 'My Library', icon: User }
             ].map((mode) => (
               <button
                 key={mode.id}
                 onClick={() => setViewMode(mode.id as any)}
                 className={cn(
                   "flex items-center gap-2 px-6 py-2.5 rounded-[1.25rem] text-[9.5px] font-black uppercase tracking-widest transition-all",
                   viewMode === mode.id 
                     ? "bg-primary text-white shadow-xl scale-105" 
                     : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                 )}
               >
                 <mode.icon className="h-4 w-4" />
                 {mode.label}
               </button>
             ))}
          </div>
        </div>

        {/* Universal Search Bar */}
        <div className="sticky top-0 z-40 py-4 bg-background/90 backdrop-blur-md rounded-b-[2rem] shadow-sm border-b border-border">
          <form onSubmit={handleSearch} className="relative group w-full max-w-4xl mx-auto px-4 sm:px-0">
            <Search className="absolute left-[2rem] top-1/2 -translate-y-1/2 h-[1rem] w-[1rem] text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              id="hub-library-catalog-search"
              name="catalog-search"
              aria-label="Search Institutional Library Catalog"
              placeholder="Search Titles, Authors, Specialized Records..." 
              className="pl-[3.5rem] h-[3.5rem] rounded-[1.25rem] shadow-xl border-2 text-[0.875rem] font-bold italic focus:ring-primary bg-muted/30 border-border transition-all focus:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
                type="submit"
                disabled={isSearching}
                className="absolute right-[0.5rem] top-1/2 -translate-y-1/2 rounded-[1rem] h-[2.5rem] px-6 font-black text-[9px] uppercase tracking-widest bg-primary text-white shadow-xl hover:scale-105 transition-all"
            >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Access"}
            </Button>
          </form>
        </div>
      </div>

      {/* Dynamic Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[2rem]">
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Global Catalog Search View */}
          {viewMode === 'global' && (
            <div className="space-y-6">
              <SectionHeader 
                icon={Globe} 
                title="Google Catalog Sync" 
                count={searchResults.length} 
                subtitle="Aggregated international records" 
              />
              
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {searchResults.map((book) => (
                    <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={BookOpen} 
                  title="Global Catalog Offline" 
                  message="Initiate a targeted search to synchronize international records with the institutional archive." 
                />
              )}

            </div>
          )}

          {/* 2. Institutional Shelf View */}
          {viewMode === 'shelf' && (
            <div className="space-y-8">
               <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <SectionHeader 
                    icon={LibraryIcon} 
                    title="Campus Inventory" 
                    count={inventory?.length || 0} 
                    subtitle="Physically verified university holdings" 
                  />
                  <div className="flex gap-2">
                     <Badge variant="secondary" className="rounded-lg px-3 py-1 text-[9px] font-black uppercase cursor-pointer hover:bg-secondary hover:text-white transition-colors">Computer Science</Badge>
                     <Badge variant="outline" className="rounded-lg px-3 py-1 text-[9px] font-black uppercase cursor-pointer hover:bg-primary hover:text-white transition-colors">Engineering</Badge>
                  </div>
               </div>
               
               {isLoadingShelf ? (
                 <LoadingGrid />
               ) : inventory && inventory.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {inventory.map((item) => (
                      <Card 
                        key={item.id} 
                        className={cn(
                          "neu-card-shadow border-none rounded-[1.5rem] bg-card overflow-hidden hover:shadow-2xl transition-all cursor-pointer group relative",
                          item.availableCopies === 0 && "opacity-80"
                        )}
                        onClick={() => setSelectedBook({ 
                          id: item.id, 
                          title: item.title, 
                          authors: [], 
                          description: item.availableCopies === 0 ? "This item is currently on loan. You can join the institutional waitlist to be notified of its return." : "Institutional record. Syncing additional metadata...", 
                          coverImage: "", 
                          categories: [], 
                          publishedDate: "", 
                          publisher: "NEU Archives", 
                          pageCount: 0 
                        })}
                      >
                         {item.availableCopies === 0 && (
                           <div className="absolute top-4 right-4 z-30">
                              <Badge className="bg-amber-500 text-white border-none shadow-lg text-[8px] font-black italic">ON LOAN</Badge>
                           </div>
                         )}
                         <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-16 w-12 bg-muted rounded shadow flex items-center justify-center relative overflow-hidden">
                               <BookIcon className="h-6 w-6 text-primary/20" />
                               {item.availableCopies > 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="font-black text-primary text-xs uppercase italic truncate group-hover:text-secondary transition-colors">{item.title}</h4>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className={cn(
                                    "text-[9px] font-black px-2 py-0.5 rounded-full uppercase",
                                    item.availableCopies > 0 ? "bg-green-500/10 text-green-600" : "bg-primary/5 text-primary"
                                  )}>
                                     {item.availableCopies > 0 ? `${item.availableCopies} On Shelf` : 'Join Waitlist'}
                                  </span>
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Collection: Archive</span>
                               </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                         </CardContent>
                      </Card>
                    ))}
                 </div>
               ) : (
                <EmptyState 
                  icon={Info} 
                  title="Inventory Sync Pending" 
                  message="Institutional inventory is currently being synchronized with physical university holdings." 
                />
              )}
            </div>
          )}

          {/* 3. Personal Library View */}
          {viewMode === 'personal' && (
            <div className="space-y-6">
               <SectionHeader 
                  icon={User} 
                  title="My Institutional Holdings" 
                  count={myBorrowings?.length || 0} 
                  subtitle="Active loans and circulation history" 
               />
               
               {isLoadingPersonal ? (
                 <LoadingGrid />
               ) : myBorrowings && myBorrowings.length > 0 ? (
                 <div className="grid grid-cols-1 gap-4">
                    {myBorrowings.map((b: any) => (
                      <Card key={b.id} className="neu-card-shadow border-none rounded-[1.25rem] bg-card overflow-hidden">
                         <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                               <div className="h-14 w-10 relative bg-muted rounded shadow shrink-0 overflow-hidden">
                                  {b.bookCover ? <Image src={b.bookCover} alt={b.bookTitle} fill className="object-cover" /> : <BookIcon className="h-full w-full p-2 text-primary/10" />}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <h4 className="font-black text-primary text-xs uppercase italic truncate">{b.bookTitle}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                     <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground">
                                        <Calendar className="h-3 w-3 text-secondary" /> Issued {format(b.borrowDate?.toDate() || new Date(), 'MMM dd')}
                                     </div>
                                     <div className={cn(
                                        "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest",
                                        b.status === 'active' && b.dueDate.toDate() < new Date() ? "text-destructive" : "text-primary"
                                     )}>
                                        <Clock className="h-3 w-3" /> Due {format(b.dueDate?.toDate() || new Date(), 'MMM dd')}
                                     </div>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               {b.status === 'active' && (
                                 <Button 
                                   onClick={() => handleRenew(b.id)}
                                   disabled={b.renewalCount >= 1}
                                   variant="outline" 
                                   className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
                                 >
                                   <RotateCcw className="h-3 w-3" />
                                   {b.renewalCount >= 1 ? 'Renewed' : 'Renew'}
                                 </Button>
                               )}
                               <span className={cn(
                                 "text-[9px] font-black px-3 py-1 rounded-full uppercase border",
                                 b.status === 'returned' ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-primary/5 text-primary border-primary/20"
                               )}>
                                 {b.status}
                               </span>
                            </div>
                         </CardContent>
                      </Card>
                    ))}
                 </div>
               ) : (
                 <EmptyState icon={History} title="No Records" message="No active circulation records detected for your identity" />
               )}
            </div>
          )}
        </div>

        {/* Right Column: Institutional Pulse */}
        <div className="lg:col-span-4 space-y-8">
            <Card className="neu-card-shadow border-none rounded-[2rem] bg-card shadow-2xl overflow-hidden ring-1 ring-border">
                <CardHeader className="bg-muted/30 p-8 border-b">
                    <CardTitle className="text-[10px] font-black text-primary flex items-center gap-3 uppercase tracking-[0.2em] italic">
                        <Activity className="h-5 w-5 text-secondary" /> Institutional Pulse
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/20 rounded-2xl border text-center space-y-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Archives</span>
                            <p className="text-2xl font-black text-primary italic">14.2k</p>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center space-y-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">On-Shelf</span>
                            <p className="text-2xl font-black text-secondary italic">85%</p>
                        </div>
                    </div>
                    
                    <div className="pt-4 space-y-4">
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Borrowing Logic</h5>
                        <ul className="space-y-4">
                            {[
                                { label: "Standard Period", value: "14 Days" },
                                { label: "Renewal Limit", value: "1 Cycle" },
                                { label: "Max Holdings", value: "3 Books" },
                                { label: "Fine Protocol", value: "Locked" }
                            ].map((policy, i) => (
                                <li key={i} className="flex justify-between items-center text-[10px] font-bold text-foreground italic border-b border-border/50 pb-2">
                                    <span className="text-muted-foreground">{policy.label}</span>
                                    <span className="font-black text-primary uppercase">{policy.value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <div className="p-8 bg-primary text-white rounded-[2rem] shadow-3xl space-y-4 relative overflow-hidden group">
               <div className="absolute inset-0 bg-dot-pattern opacity-10" />
               <Sparkles className="h-8 w-8 text-secondary animate-pulse relative z-10" />
               <h4 className="text-xl font-black italic uppercase tracking-tighter leading-none relative z-10">Advanced Research?</h4>
               <p className="text-xs font-medium italic opacity-80 relative z-10">Use the Global Catalog to pull metadata for resources not yet in our physical archive.</p>
               <Button variant="secondary" className="w-full font-black text-[10px] uppercase tracking-widest h-10 rounded-xl relative z-10">
                  Request Material
               </Button>
            </div>
        </div>
      </div>

      {/* Book Detail / Borrow Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-3xl bg-card p-0 overflow-hidden ring-1 ring-border animate-in zoom-in duration-300">
          {selectedBook && (
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-[260px] relative h-[300px] md:h-auto bg-muted shadow-2xl z-20 overflow-hidden">
                {selectedBook.coverImage ? (
                  <Image src={selectedBook.coverImage} alt={selectedBook.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <BookIcon className="h-16 w-16 text-primary/20" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                   <span className="bg-primary/90 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                      Standard Issue
                   </span>
                </div>
              </div>
              <div className="flex-1 p-[2.5rem] flex flex-col justify-between gap-8 bg-gradient-to-br from-card to-muted/20">
                <div className="space-y-6">
                  <DialogHeader className="p-0">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedBook.categories.length > 0 ? selectedBook.categories.map(c => (
                        <span key={c} className="text-[8px] font-black uppercase tracking-widest bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full">
                          {c}
                        </span>
                      )) : (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full">
                          Research Archive
                        </span>
                      )}
                    </div>
                    <DialogTitle className="text-2xl font-black text-primary uppercase italic tracking-tighter leading-tight">
                      {selectedBook.title}
                    </DialogTitle>
                    <DialogDescription className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-2">
                        Authored By <span className="text-primary italic">{selectedBook.authors.join(", ") || "Institutional Sources"}</span>
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <p className="text-[11px] text-foreground leading-relaxed italic opacity-80 max-h-[120px] overflow-y-auto pr-4 custom-scrollbar">
                      {selectedBook.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Custodian</span>
                            <p className="text-[10px] font-bold text-primary italic truncate capitalize">{selectedBook.publisher || "NEU Registry"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40 flex items-center gap-1"><Clock className="h-3 w-3" /> Circulation Term</span>
                            <p className="text-[10px] font-bold text-secondary italic">
                                {format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
                            </p>
                        </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-4 pt-4 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedBook(null)}
                    className="flex-1 rounded-[1.25rem] h-[3.5rem] font-black text-[10px] uppercase tracking-[0.2em] border-2 shadow-sm transition-all hover:bg-muted"
                  >
                    Rescind
                  </Button>
                  <Button 
                    onClick={handleBorrow}
                    disabled={isBorrowing}
                    className="flex-[2] rounded-[1.25rem] h-[3.5rem] bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all gap-3"
                  >
                    {isBorrowing ? <Loader2 className="h-4 w-4 animate-spin text-secondary" /> : <BookOpen className="h-4 w-4 text-secondary" />}
                    Confirm Institutional Loan
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --- Institutional Sub-Components --- */

function SectionHeader({ icon: Icon, title, count, subtitle }: any) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-4">
      <div className="space-y-1">
        <h3 className="font-black text-primary uppercase italic tracking-tighter flex items-center gap-3 text-lg">
          <Icon className="h-5 w-5 text-secondary" />
          {title}
        </h3>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ml-8">{subtitle}</p>
      </div>
      <Badge variant="outline" className="text-[10px] font-black border-2 px-3 py-1 rounded-full uppercase italic bg-muted/20">
        {count} Nodes
      </Badge>
    </div>
  );
}

function BookCard({ book, onClick }: { book: BookMetadata, onClick: () => void }) {
  return (
    <Card 
      className="neu-card-shadow border-none rounded-[1.5rem] bg-card overflow-hidden hover:scale-[1.02] transition-all duration-500 group cursor-pointer ring-1 ring-border/50"
      onClick={onClick}
    >
      <div className="flex h-full">
        <div className="w-[100px] sm:w-[130px] relative bg-muted shrink-0 shadow-xl z-20 overflow-hidden">
          {book.coverImage ? (
            <Image src={book.coverImage} alt={book.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <BookIcon className="h-8 w-8 text-primary/20" />
            </div>
          )}
        </div>
        <CardContent className="p-6 flex flex-col justify-between flex-1 min-w-0 bg-gradient-to-r from-muted/5 to-transparent">
          <div className="space-y-2">
            <h4 className="font-black text-primary text-sm line-clamp-2 uppercase italic tracking-tight group-hover:text-secondary transition-colors leading-tight">
              {book.title}
            </h4>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
              {book.authors.join(", ") || "Various Sources"}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/50">
            <span className="text-[9px] font-black text-primary uppercase tracking-tighter bg-primary/5 px-2 py-1 rounded-md">
              Global Catalog
            </span>
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shadow-lg">
               <ArrowRight className="h-3 w-3 text-white" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-[120px] rounded-[1.5rem] bg-muted/30 animate-pulse border-2 border-dashed border-border" />
      ))}
    </div>
  );
}
