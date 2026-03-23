"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  History,
  UserMinus,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  Mail,
  User,
  ShieldAlert,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InstitutionalHeader } from "@/components/shared/institutional-header";

interface GovernanceViewProps {
  onBack: () => void;
}

export function GovernanceView({ onBack }: GovernanceViewProps) {
  const { profile, handleResignationRequest } = useAuth();
  const { firestore } = useFirebase();
  const [activeTab, setActiveTab] = useState<'audit' | 'resignations'>('audit');

  const auditQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'role_audit_logs'), orderBy('timestamp', 'desc'), limit(50));
  }, [firestore]);

  const resignationQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('resignationStatus', '==', 'pending'));
  }, [firestore]);

  const { data: auditLogs, isLoading: loadingAudit } = useCollection(auditQuery);
  const { data: resignationRequests, isLoading: loadingResignations } = useCollection(resignationQuery);

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">

      <main className="flex-1 w-full max-w-[85rem] mx-auto p-[clamp(1.5rem,5vw,3rem)] space-y-[clamp(1.5rem,4vh,2.5rem)]">
        <div className="flex flex-col gap-[1.5rem]">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/50 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl">
            <div className="space-y-2">
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black italic tracking-tighter text-primary uppercase leading-tight">
                Governance <span className="text-secondary">& Oversight</span>
              </h2>
              <p className="text-muted-foreground font-bold text-[0.75rem] uppercase tracking-widest italic opacity-70">
                Institutional Authority & Role Registry Management
              </p>
            </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-2xl border border-white/5 shadow-inner">
            <button
               onClick={() => setActiveTab('audit')}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                 activeTab === 'audit' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5"
               )}
            >
              <History className="h-4 w-4" />
              Role History
            </button>
            <button
               onClick={() => setActiveTab('resignations')}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all gap-2 flex items-center relative",
                 activeTab === 'resignations' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5"
               )}
            >
              <UserMinus className="h-4 w-4" />
              Resignations
              {resignationRequests && resignationRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-secondary rounded-full border-2 border-primary animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'audit' ? (
          <Card className="border-none rounded-[2.5rem] bg-card shadow-2xl overflow-hidden min-h-[50vh]">
            <CardHeader className="border-b border-white/5 px-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-[0.75rem] font-black uppercase tracking-widest text-primary/80">
                  Global Role Audit Stream
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {loadingAudit ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 animate-pulse">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Decrypting Logs...</span>
                </div>
              ) : auditLogs?.length === 0 ? (
                <div className="text-center py-20 bg-muted/10 rounded-[2rem] border-2 border-dashed border-white/5">
                   <p className="text-muted-foreground font-bold italic">No role changes recorded in the registry.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs?.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-5 p-5 bg-muted/5 hover:bg-muted/10 transition-colors rounded-2xl border border-white/5 group">
                      <div className={cn(
                        "p-3 rounded-xl border shrink-0",
                        log.action === 'SUPER_ADMIN_TRANSFER' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                        log.action.includes('APPROVED') ? "bg-green-500/10 border-green-500/30 text-green-500" :
                        "bg-primary/10 border-primary/30 text-primary"
                      )}>
                        {log.action === 'SUPER_ADMIN_TRANSFER' ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-[0.65rem] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                             {log.action?.replace(/_/g, ' ')}
                             <span className="h-1 w-1 bg-white/20 rounded-full" />
                             <span className="text-muted-foreground opacity-60 font-medium">
                               {log.timestamp?.toDate?.().toLocaleString() || 'Syncing...'}
                             </span>
                          </h4>
                          <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-white/5">
                             <User className="h-3 w-3 text-primary/60" />
                             <span className="text-[10px] font-bold text-muted-foreground italic">Actor: {log.actorEmail}</span>
                          </div>
                        </div>
                        <p className="text-[0.95rem] font-medium text-primary/90 leading-relaxed italic">
                           &quot;{log.reason || 'No justification provided.'}&quot;
                        </p>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-muted rounded border opacity-40">{log.oldRole}</span>
                           <ChevronLeft className="h-3 w-3 rotate-180 opacity-20" />
                           <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">{log.newRole}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none rounded-[2.5rem] bg-card shadow-2xl overflow-hidden min-h-[50vh]">
            <CardHeader className="border-b border-white/5 px-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <UserMinus className="h-5 w-5 text-amber-500" />
                </div>
                <CardTitle className="text-[0.75rem] font-black uppercase tracking-widest text-primary/80">
                  Pending Resignation Requests
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
               {loadingResignations ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 animate-pulse">
                  <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Polling Identity Registry...</span>
                </div>
              ) : !resignationRequests || resignationRequests.length === 0 ? (
                <div className="text-center py-20 bg-muted/10 rounded-[2rem] border-2 border-dashed border-white/5">
                   <p className="text-muted-foreground font-bold italic">Clear skies. No pending resignation requests found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {resignationRequests.map((req: any) => (
                     <div key={req.id} className="relative group">
                       <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-transparent rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-500" />
                       <div className="relative bg-card border border-white/10 p-6 rounded-[1.75rem] space-y-5 shadow-sm hover:shadow-xl transition-all duration-500">
                         <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center border border-white/5">
                             <User className="h-6 w-6 text-primary" />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-lg font-black italic tracking-tighter text-primary">{req.displayName}</span>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 italic">{req.email}</span>
                           </div>
                         </div>
                         
                         <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-500/20">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-2">
                               <MessageSquare className="h-3 w-3" /> Justification
                            </h5>
                            <p className="text-sm font-medium italic text-primary/80 italic leading-relaxed">
                               &quot;{req.resignationReason}&quot;
                            </p>
                         </div>

                         <div className="flex items-center gap-3 pt-2">
                           <Button 
                             onClick={() => handleResignationRequest(req.id, 'approve')}
                             className="flex-1 h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-[0.65rem] uppercase tracking-widest gap-2 shadow-lg shadow-green-500/20"
                           >
                             <CheckCircle2 className="h-4 w-4" />
                             Approve
                           </Button>
                           <Button 
                             variant="outline"
                             onClick={() => handleResignationRequest(req.id, 'reject')}
                             className="flex-1 h-11 rounded-xl border-white/10 hover:bg-destructive/10 hover:text-destructive font-black text-[0.65rem] uppercase tracking-widest gap-2"
                           >
                             <XCircle className="h-4 w-4" />
                             Reject
                           </Button>
                         </div>
                         
                         <div className="absolute top-4 right-4 flex items-center gap-2 bg-muted/30 px-3 py-1 rounded-full border border-white/5 opacity-50">
                            <Clock className="h-3 w-3 text-secondary" />
                            <span className="text-[8px] font-bold uppercase">Pending Evaluation</span>
                         </div>
                       </div>
                     </div>
                   ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </main>
    </div>
  );
}
