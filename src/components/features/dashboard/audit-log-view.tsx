
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, History, Download, ShieldAlert, ArrowLeft, Filter, User, Clock, Terminal } from "lucide-react";
import { useCollection, useMemoFirebase } from "@/firebase";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { useAudit } from "@/hooks/use-audit";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface AuditLogViewProps {
  onBack?: () => void;
}

export function AuditLogView({ onBack }: AuditLogViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const audit = useAudit();

  const { profile } = useAuth();
  const isAdmin = profile?.isAuthorizedAdmin === true;

  const auditQuery = useMemoFirebase(() => {
    if (!isAdmin || !audit) return null;
    return audit.getAuditLogsQuery(100);
  }, [audit, isAdmin]);

  const { data: logs, isLoading } = useCollection(auditQuery);

  const filteredLogs = logs?.filter(l => {
    const term = debouncedSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return l.adminName?.toLowerCase().includes(term) ||
           l.action?.toLowerCase().includes(term) ||
           l.details?.toLowerCase().includes(term);
  }) || [];

  return (
    <div className="space-y-[2.5rem] animate-in fade-in duration-700 pb-[5rem]">
      {/* Institutional Audit Header */}
      <div className="flex flex-col gap-[1.5rem]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[1.5rem]">
          <div className="space-y-[0.5rem]">
            <h2 className="text-[2rem] md:text-[3.5rem] font-black tracking-tighter text-primary uppercase italic leading-none text-glow-primary">Institutional Audit</h2>
            <p className="text-[0.625rem] md:text-[0.875rem] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 leading-none">Administrative Action Protocol & Forensic Trail</p>
          </div>
          <Button variant="outline" className="h-[3.5rem] px-8 rounded-[1.25rem] border-2 font-black text-[0.75rem] uppercase tracking-widest gap-3 bg-card shadow-xl hover:scale-105 transition-all active:scale-95">
            <Download className="h-[1.25rem] w-[1.25rem] text-secondary" /> Export Audit Archive
          </Button>
        </div>

        {/* Audit Filter Alignment */}
        <div className="sticky top-0 z-40 py-6 bg-background/90 backdrop-blur-md rounded-b-[2rem] border-b border-border shadow-sm">
          <div className="relative group max-w-4xl mx-auto">
            <Search className="absolute left-[1.5rem] top-1/2 -translate-y-1/2 h-[1.5rem] w-[1.5rem] text-muted-foreground group-focus-within:text-primary transition-all" />
            <Input 
              id="hub-audit-search"
              name="audit-search"
              aria-label="Search Institutional Audit Trails"
              placeholder="Search Administrator, Operation, or Action Context..." 
              className="pl-[4rem] h-[3.5rem] rounded-[1.25rem] shadow-xl border-2 text-[0.875rem] font-bold italic focus:ring-primary transition-all bg-card border-border focus:scale-[1.01]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="neu-card-shadow border-none rounded-[2rem] bg-card shadow-2xl overflow-hidden ring-1 ring-border">
        <CardHeader className="bg-muted/30 p-8 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-primary flex items-center gap-3 uppercase italic">
                <ShieldAlert className="h-5 w-5 text-secondary" /> Administrative Proof Registry
            </CardTitle>
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase opacity-20">
                <Clock className="h-4 w-4" /> Real-time Forensic Sync
            </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest px-8">Administrator</TableHead>
                <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest">Operation</TableHead>
                <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest">Target Context</TableHead>
                <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest text-right px-8">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-24 font-black text-primary/40 uppercase animate-pulse italic">Synchronizing Logs...</TableCell></TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="py-24">
                        <EmptyState 
                          icon={History} 
                          title="No Proof Records" 
                          message="The institutional audit trail is currently vacant of matching administrative nodes." 
                        />
                    </TableCell>
                </TableRow>
              ) : filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-primary/5 transition-colors duration-500 border-b last:border-0 group">
                  <TableCell className="py-6 px-8">
                     <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                           <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                           <span className="font-black text-primary italic text-sm">{log.adminName}</span>
                           <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Admin ID: {log.adminId.slice(0, 8)}</span>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                    <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20 shadow-sm">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col max-w-[400px]">
                        <span className="text-xs font-medium text-foreground italic line-clamp-1">{log.details}</span>
                        {log.resourceType && (
                           <div className="flex items-center gap-1.5 mt-1 opacity-40">
                              <Terminal className="h-3 w-3" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Node: {log.resourceType} • {log.resourceId?.slice(0, 10)}</span>
                           </div>
                        )}
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-8 font-black text-[9px] text-muted-foreground uppercase italic tracking-widest">
                    {log.timestamp?.seconds ? format(log.timestamp.seconds * 1000, 'MMM dd • HH:mm:ss') : 'Just Now'}
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
