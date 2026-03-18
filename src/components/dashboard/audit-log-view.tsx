
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, History, Download, ShieldAlert, ArrowLeft, Filter } from "lucide-react";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface AuditLogViewProps {
  onBack?: () => void;
}

export function AuditLogView({ onBack }: AuditLogViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();

  const auditQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));
  }, [firestore]);

  const { data: logs, isLoading } = useCollection(auditQuery);

  const filteredLogs = logs?.filter(l => 
    l.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2 text-primary/50 hover:text-primary font-black text-[10px] uppercase gap-2">
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Button>
          <h2 className="text-3xl font-black text-primary italic uppercase tracking-tighter">Institutional Audit</h2>
          <p className="text-muted-foreground font-medium text-lg">Administrative action trail.</p>
        </div>
        <Button variant="outline" className="gap-2 font-black text-[10px] uppercase tracking-widest h-11 border-2">
          <Download className="h-4 w-4" /> Export Audit Trail
        </Button>
      </div>

      <Card className="neu-card-shadow border-none rounded-[2rem] bg-white shadow-2xl overflow-hidden">
        <div className="p-8 border-b bg-muted/20 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter actions or admins..." 
              className="pl-10 h-12 rounded-xl border-2" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 gap-2 font-bold px-6 rounded-xl border-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest px-8">Administrator</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">Operation</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">Target Context</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest text-right px-8">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20 font-bold text-muted-foreground uppercase animate-pulse">Syncing Audit Trail...</TableCell></TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-muted-foreground">No administrative actions recorded.</TableCell></TableRow>
            ) : filteredLogs.map((log) => (
              <TableRow key={log.id} className="hover:bg-primary/5 transition-colors even:bg-slate-50/50">
                <TableCell className="py-6 px-8 font-black text-primary italic">{log.adminName}</TableCell>
                <TableCell>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-medium text-slate-600 italic">"{log.details}"</TableCell>
                <TableCell className="text-right px-8 font-black text-[9px] text-muted-foreground uppercase italic tracking-widest">
                  {log.timestamp?.seconds ? format(log.timestamp.seconds * 1000, 'MMM dd, HH:mm:ss') : 'Recently'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
