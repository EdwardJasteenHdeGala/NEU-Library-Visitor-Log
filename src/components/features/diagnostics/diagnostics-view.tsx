"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Bug,
  Search,
  Code2,
  Terminal,
  Monitor,
  Fingerprint,
  Layers,
  Sparkles,
  Wrench,
  Clock,
  History
} from "lucide-react";
import { collection, query, orderBy, limit, doc, updateDoc, where } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { SystemLog } from "@/types/diagnostics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SystemDiagnosticsViewProps {
  onBack?: () => void;
}

export function SystemDiagnosticsView({ onBack }: SystemDiagnosticsViewProps) {
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localIssues, setLocalIssues] = useState<any[]>([]);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const syncLocalIssues = async (type: 'active' | 'resolved' = 'active') => {
    setIsSyncingLocal(true);
    try {
      const res = await fetch(`/api/issues?type=${type}`);
      if (!res.ok) throw new Error("Sync failure");
      const data = await res.json();
      setLocalIssues(data);
    } catch (err) {
      toast({ title: "Local Sync Error", variant: "destructive" });
    } finally {
      setIsSyncingLocal(false);
    }
  };

  const resolveLocalIssue = async (issueId: string) => {
    try {
      const res = await fetch('/api/issues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId })
      });
      if (!res.ok) throw new Error("Resolution failure");
      toast({ title: "Issue Resolved", description: "Archived to registry." });
      syncLocalIssues();
    } catch (err) {
      toast({ title: "Action Failed", variant: "destructive" });
    }
  };

  const handleSelectLog = async (log: SystemLog) => {
    setSelectedLog(log);
    setAiSuggestion(null);
    setIsAnalyzing(true);
    
    try {
      const { analyzeDiagnostic } = await import("@/app/actions");
      const suggestion = await analyzeDiagnostic(log);
      setAiSuggestion(suggestion);
    } catch (error) {
      setAiSuggestion("AI Hub currently unreachable for deep forensic analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const diagnosticsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'system_diagnostics'), orderBy('timestamp', 'desc'), limit(200));
  }, [firestore]);

  const { data: logs, isLoading } = useCollection(diagnosticsQuery);

  const filteredLogs = useMemo(() => {
    return logs?.filter(l => {
      const matchesFilter = filter === 'all' || l.level === filter;
      const matchesSearch = !searchTerm || 
        l.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.sessionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.userId?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    }) || [];
  }, [logs, filter, searchTerm]);

  const clusters = useMemo(() => {
    if (!logs) return [];
    const groups: Record<string, { log: SystemLog; count: number; firstOccur: any; lastOccur: any }> = {};
    
    logs.forEach(l => {
      const key = `${l.level}:${l.message}`;
      if (!groups[key]) {
        groups[key] = { log: l, count: 1, firstOccur: l.timestamp, lastOccur: l.timestamp };
      } else {
        groups[key].count += 1;
        // Logic for first/last timestamp tracking omitted for brevity, assuming desc sort helps
      }
    });

    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [logs]);

  const handleResolve = async (id: string, currentStatus: boolean) => {
    if (!firestore) return;
    try {
      const docRef = doc(firestore, 'system_diagnostics', id);
      await updateDoc(docRef, { resolved: !currentStatus });
      toast({ title: "Status Updated", description: "Diagnostic record synchronized." });
    } catch (err) {
      toast({ title: "Operation Failed", variant: "destructive" });
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <Bug className="h-4 w-4 text-destructive" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'Recently';
    try {
      if (ts instanceof Date) return format(ts, 'MMM dd, HH:mm:ss');
      if (ts.seconds) return format(ts.seconds * 1000, 'MMM dd, HH:mm:ss');
      return 'Syncing...';
    } catch (e) { return 'Invalid Date'; }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h2 className="text-4xl font-black text-primary italic uppercase tracking-tighter">Automatic Analyzer</h2>
             <Badge className="bg-primary/5 text-primary border-primary/10 font-black text-[9px] px-3 py-1 uppercase tracking-widest gap-2">
               <Sparkles className="h-3 w-3 text-secondary" /> AI Heuristics Active
             </Badge>
          </div>
          <p className="text-muted-foreground font-medium text-lg">Proactive institutional system health management.</p>
        </div>
      </div>

      <Tabs defaultValue="forensics" className="w-full">
        <TabsList className="bg-muted/10 p-1 rounded-2xl h-14 border-2 shadow-inner mb-6">
          <TabsTrigger value="forensics" className="rounded-xl px-10 font-black text-[10px] uppercase tracking-widest gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg">
            <Terminal className="h-4 w-4" /> Live Forensics
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="rounded-xl px-10 font-black text-[10px] uppercase tracking-widest gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg">
            <Layers className="h-4 w-4" /> Cluster Analyzer
          </TabsTrigger>
          <TabsTrigger value="local" onClick={() => syncLocalIssues()} className="rounded-xl px-10 font-black text-[10px] uppercase tracking-widest gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg">
            <History className="h-4 w-4" /> Local Registry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forensics" className="space-y-6">
          <Card className="neu-card-shadow border-none rounded-[2.5rem] bg-card shadow-2xl overflow-hidden ring-1 ring-border">
            <div className="p-10 border-b bg-muted/20 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex gap-2 p-1 bg-background rounded-2xl border-2">
                {(['all', 'error', 'warn', 'info'] as const).map((l) => (
                  <Button
                    key={l}
                    variant={filter === l ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(l)}
                    className={cn(
                      "font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl",
                      filter === l ? "shadow-lg scale-105" : "text-muted-foreground"
                    )}
                  >
                    {l}
                  </Button>
                ))}
              </div>
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Analyze Session, User, or Message..." 
                  className="pl-12 h-12 rounded-2xl border-2 bg-background font-bold tracking-tight"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader className="bg-muted/10 font-black">
                <TableRow>
                  <TableHead className="py-6 px-10 uppercase text-[10px] tracking-widest">Severity</TableHead>
                  <TableHead className="py-6 uppercase text-[10px] tracking-widest">Diagnostic Evidence</TableHead>
                  <TableHead className="py-6 uppercase text-[10px] tracking-widest">Trace ID</TableHead>
                  <TableHead className="py-6 text-right px-10 uppercase text-[10px] tracking-widest">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-24 font-black text-muted-foreground uppercase animate-pulse italic">Synchronizing Logs...</TableCell></TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-24 italic text-muted-foreground font-medium">No diagnostic data found.</TableCell></TableRow>
                ) : filteredLogs.map((log: SystemLog) => (
                  <TableRow key={log.id} className={cn("hover:bg-primary/5 transition-colors border-b last:border-0 group", log.resolved && "opacity-40 grayscale-[0.5]")}>
                    <TableCell className="py-8 px-10">
                      <div className="flex items-center gap-3 font-black">
                        {getLevelIcon(log.level)}
                        <span className={cn(
                          "text-[9px] uppercase tracking-widest",
                          log.level === 'error' ? "text-destructive" :
                          log.level === 'warn' ? "text-amber-600" : "text-blue-600"
                        )}>
                          {log.level}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[500px]">
                      <div className="space-y-2">
                        <p className="font-black text-sm text-primary italic leading-tight group-hover:underline cursor-pointer" onClick={() => handleSelectLog(log)}>
                          {log.message}
                        </p>
                        <div className="flex items-center gap-4 opacity-70">
                           <span className="text-[9px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded uppercase">SOURCE: {log.source}</span>
                           <span className="text-[9px] font-bold text-muted-foreground uppercase">{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-[10px] font-mono bg-muted/30 px-3 py-1 rounded-lg border border-border/50 text-muted-foreground select-all">
                        {log.sessionId?.slice(0, 15)}...
                      </code>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" size="icon" onClick={() => handleSelectLog(log)} className="h-10 w-10 text-primary hover:bg-primary/10 rounded-xl">
                          <Terminal className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleResolve(log.id!, log.resolved)} className={cn("h-10 w-10 rounded-xl transition-all", log.resolved ? "text-green-600 bg-green-50 shadow-inner" : "text-muted-foreground hover:bg-muted")}>
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analyzer" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          {clusters.map((cluster, i) => (
             <Card key={i} className="neu-card-shadow border-none bg-card rounded-[2rem] overflow-hidden hover:scale-[1.01] transition-all ring-1 ring-border">
                <CardContent className="p-0 flex flex-col lg:flex-row">
                   <div className="lg:w-72 bg-muted/10 p-10 flex flex-col items-center justify-center gap-3 text-center border-r">
                      <div className="text-5xl font-black italic text-primary">{cluster.count}</div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Recent Issues</span>
                      <Badge variant={cluster.log.level === 'error' ? 'destructive' : 'outline'} className="mt-2 font-black uppercase text-[9px] tracking-widest">
                         {cluster.log.level}
                      </Badge>
                   </div>
                   <div className="flex-1 p-10 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-primary italic uppercase tracking-tighter leading-tight">{cluster.log.message}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <History className="h-3.5 w-3.5" /> Frequent institutional anomaly on {cluster.log.source} engine.
                        </p>
                      </div>

                      <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/10 space-y-4">
                          <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest">
                             <Sparkles className="h-4 w-4 text-secondary" /> Institutional Intelligence Suggestion
                          </div>
                          <p className="text-xs font-bold leading-relaxed italic text-primary/80">
                             Select a record to activate Hub AI forensics for this specific anomaly.
                          </p>
                      </div>

                      <div className="flex gap-4">
                          <Button onClick={() => handleSelectLog(cluster.log)} variant="outline" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex-1 lg:flex-none border-2">
                             Inspect Proof
                          </Button>
                         <Button variant="ghost" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground gap-2">
                            <Wrench className="h-4 w-4" /> Manage Incident
                         </Button>
                      </div>
                   </div>
                </CardContent>
             </Card>
          ))}
        </TabsContent>

        <TabsContent value="local" className="space-y-6">
           <Card className="neu-card-shadow border-none rounded-[2.5rem] bg-card shadow-2xl overflow-hidden">
              <div className="p-10 border-b bg-muted/20 flex justify-between items-center">
                 <h3 className="text-xl font-black text-primary italic uppercase tracking-tighter">Local File Registry</h3>
                 <Button onClick={() => syncLocalIssues()} variant="outline" size="sm" className="h-10 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest border-2">
                    <RefreshCcw className={cn("h-4 w-4", isSyncingLocal && "animate-spin")} />
                    Refresh Buffer
                 </Button>
              </div>
              <Table>
                <TableHeader className="bg-muted/10 font-black">
                  <TableRow>
                    <TableHead className="py-6 px-10 uppercase text-[10px] tracking-widest">Metadata</TableHead>
                    <TableHead className="py-6 uppercase text-[10px] tracking-widest">Local Exception</TableHead>
                    <TableHead className="py-6 uppercase text-[10px] tracking-widest text-center">Frequency</TableHead>
                    <TableHead className="py-6 text-right px-10 uppercase text-[10px] tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSyncingLocal ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 animate-pulse font-black text-muted-foreground uppercase opacity-40">Syncing issues from project root...</TableCell></TableRow>
                  ) : localIssues.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-muted-foreground font-bold">Local issues buffer is currently clear.</TableCell></TableRow>
                  ) : localIssues.map((issue) => (
                    <TableRow key={issue.id} className="hover:bg-primary/5 transition-colors border-b last:border-0 group">
                      <TableCell className="py-8 px-10">
                        <div className="space-y-1">
                          <Badge variant="outline" className="font-black text-[8px] uppercase tracking-widest border-primary/20 text-primary">{issue.status}</Badge>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(issue.timestamp), 'MMM dd, HH:mm')}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[500px]">
                        <p className="font-black text-sm text-primary italic leading-tight">{issue.message}</p>
                        <p className="text-[9px] font-mono text-muted-foreground mt-2 truncate opacity-50">{issue.id}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center h-10 w-10 bg-primary/10 rounded-full font-black text-primary border border-primary/20">
                          {issue.occurrences || 1}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <Button 
                          onClick={() => resolveLocalIssue(issue.id)}
                          variant="ghost" 
                          size="sm" 
                          className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-green-600 hover:bg-green-50 shadow-sm border-2 border-transparent hover:border-green-100 transition-all gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Resolve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] border-none shadow-3xl overflow-hidden p-0">
          <DialogHeader className="p-10 bg-primary text-white space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-white border-white/30 font-black text-[9px] uppercase tracking-[0.3em]">Institutional Proof</Badge>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">ID: {selectedLog?.id}</span>
            </div>
            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter leading-tight">
              {selectedLog?.message}
            </DialogTitle>
            <DialogDescription className="text-white/60 font-bold uppercase text-[10px] tracking-widest flex items-center gap-3">
              <Monitor className="h-4 w-4" /> Endpoint: {selectedLog?.path}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-10 space-y-10 bg-card overflow-y-auto max-h-[60vh]">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 p-6 bg-muted/30 rounded-2xl border shadow-inner">
                  <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest">
                    <Fingerprint className="h-4 w-4 text-secondary" /> Session Forensic
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-muted-foreground">Session ID: <span className="text-primary font-mono">{selectedLog?.sessionId}</span></p>
                    <p className="text-[11px] font-bold text-muted-foreground">User ID: <span className="text-primary font-mono">{selectedLog?.userId || 'ANONYMOUS'}</span></p>
                  </div>
                </div>
                <div className="space-y-4 p-6 bg-muted/30 rounded-2xl border shadow-inner">
                  <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest">
                    <Code2 className="h-4 w-4 text-secondary" /> Runtime Specs
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-muted-foreground">Resolution: <span className="text-primary font-mono">{selectedLog?.metadata?.resolution}</span></p>
                    <p className="text-[11px] font-bold text-muted-foreground">Level: <span className="text-primary font-black uppercase italic">{selectedLog?.level}</span></p>
                  </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">Technical Detail Map</h4>
                  <Badge className="bg-muted text-primary hover:bg-muted font-bold text-[9px] uppercase">JSON Payload</Badge>
                </div>
                <div className="relative">
                  <pre className="p-8 bg-zinc-950 text-zinc-400 rounded-3xl font-mono text-[11px] leading-relaxed overflow-x-auto border-4 border-zinc-900 shadow-2xl">
                    {selectedLog ? JSON.stringify(selectedLog, null, 2) : ''}
                  </pre>
                </div>
             </div>

              {aiSuggestion || isAnalyzing ? (
                 <div className="space-y-4 p-8 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                       <Sparkles className="h-12 w-12 text-secondary" />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic flex items-center gap-2">
                       <Sparkles className="h-4 w-4 text-secondary" /> Institutional Intelligence Resolution
                    </h4>
                    {isAnalyzing ? (
                       <div className="space-y-2 animate-pulse">
                          <div className="h-4 bg-primary/10 rounded w-3/4" />
                          <div className="h-4 bg-primary/10 rounded w-1/2" />
                       </div>
                    ) : (
                       <div className="prose prose-sm prose-invert max-w-none prose-p:text-primary/80 prose-p:font-bold prose-p:italic prose-strong:text-primary prose-strong:font-black">
                          {aiSuggestion}
                       </div>
                    )}
                 </div>
              ) : (
                <div className="p-8 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/20 text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Select &apos;Terminal&apos; to activate AI forensics</p>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
