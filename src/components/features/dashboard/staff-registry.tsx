"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  UserPlus,
  Loader2,
  ArrowLeft,
  ShieldPlus,
  MoreVertical,
  UserCheck,
  Mail,
  History,
  Lock
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { query, collection, where, orderBy } from "firebase/firestore";

interface StaffRegistryProps {
  onBack?: () => void;
}

export function StaffRegistry({ onBack }: StaffRegistryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { profile, setUserRole, transferSuperAdmin } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const isSuperAdmin = profile?.role === 'superadmin';

  const staffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'), 
      where('role', 'in', ['admin', 'superadmin']),
      orderBy('displayName', 'asc')
    );
  }, [firestore]);

  const { data: staff, isLoading } = useCollection(staffQuery);

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return staff;
    return staff.filter(s => 
      s.displayName?.toLowerCase().includes(term) || 
      s.email?.toLowerCase().includes(term)
    );
  }, [staff, searchTerm]);

  return (
    <div className="space-y-[2.5rem] animate-in fade-in duration-700 pb-[5rem]">
      {/* Header */}
      <div className="flex flex-col gap-[1.5rem]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[1.5rem]">
          <div className="space-y-[0.5rem]">
            <h2 className="text-[2rem] md:text-[3rem] font-black text-primary italic uppercase tracking-tighter leading-none">
              Administrative <span className="text-secondary">Staff</span>
            </h2>
            <p className="text-[0.625rem] md:text-[0.875rem] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 leading-none">
              Institutional Governance & Personnel Registry
            </p>
          </div>
          <Button 
            variant="outline"
            className="h-[3.5rem] px-8 gap-3 rounded-[1.25rem] font-black text-[0.75rem] uppercase tracking-widest shadow-xl border-2 hover:scale-105 transition-all"
            onClick={() => toast({ title: "Authorization Protocol", description: "Use the Member Admin directory to promote new personnel to Admin status." })}
          >
            <ShieldPlus className="h-[1.25rem] w-[1.25rem] text-primary" />
            Authorize New Staff
          </Button>
        </div>

        {/* Filter */}
        <div className="relative group max-w-4xl mx-auto w-full">
          <Search className="absolute left-[1.5rem] top-1/2 -translate-y-1/2 h-[1.5rem] w-[1.5rem] text-muted-foreground group-focus-within:text-primary transition-all" />
          <Input 
            placeholder="Search Administrative Personnel..." 
            className="pl-[4rem] h-[3.5rem] rounded-[1.25rem] shadow-xl border-2 text-[0.875rem] font-bold italic focus:ring-primary transition-all bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-[2.5rem] bg-card shadow-2xl ring-1 ring-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-none">
                <TableHead className="font-black text-primary py-8 uppercase text-[10px] tracking-widest px-10 italic">Personnel Identity</TableHead>
                <TableHead className="font-black text-primary py-8 uppercase text-[10px] tracking-widest italic">Governance Role</TableHead>
                <TableHead className="font-black text-primary py-8 uppercase text-[10px] tracking-widest italic">Auth Timestamp</TableHead>
                <TableHead className="font-black text-primary py-8 uppercase text-[10px] tracking-widest text-right px-10 italic">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={4} className="py-10 px-10"><div className="h-10 bg-muted/60 rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center font-black text-muted-foreground uppercase opacity-40 italic">
                    No administrative personnel detected in the registry.
                  </TableCell>
                </TableRow>
              ) : filteredStaff.map((p) => {
                const userInitials = p.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';
                const isCurrentUser = p.id === profile?.id;
                const isSAdmin = p.role === 'superadmin';

                return (
                  <TableRow key={p.id} className="hover:bg-primary/[0.02] border-b transition-all duration-300">
                    <TableCell className="py-8 px-10">
                      <div className="flex items-center gap-5">
                        <Avatar className="h-14 w-14 border-4 border-primary/10 shadow-lg">
                          <AvatarImage src={p.photoURL} alt={p.displayName} />
                          <AvatarFallback className="bg-[#032e41] text-secondary font-black text-sm">{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-black text-primary text-lg italic tracking-tighter">{p.displayName}</span>
                          <span className="text-[11px] text-muted-foreground font-bold opacity-60 uppercase">{p.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isSAdmin ? (
                        <Badge className="bg-[#032e41] text-secondary border-2 border-secondary/20 font-black px-4 py-1.5 rounded-full shadow-lg gap-2">
                          <ShieldAlert className="h-3 w-3" />
                          SUPER ADMIN
                        </Badge>
                      ) : (
                        <Badge className="bg-primary text-white font-black px-4 py-1.5 rounded-full shadow-md gap-2">
                          <ShieldCheck className="h-3 w-3 text-secondary" />
                          ADMINISTRATOR
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest italic opacity-60">
                      {p.roleAssignedAt ? format(p.roleAssignedAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Authorized'}
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild disabled={isCurrentUser || (isSAdmin && !isSuperAdmin)}>
                           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/5">
                             <MoreVertical className="h-6 w-6 text-muted-foreground" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-premium border-none p-2 bg-white ring-1 ring-border">
                            <DropdownMenuItem 
                              onClick={() => setUserRole(p.id, 'member')}
                              className="gap-3 cursor-pointer h-12 rounded-xl text-destructive hover:bg-destructive/5 font-black uppercase text-[10px] tracking-widest"
                            >
                               <Lock className="h-4 w-4" />
                               Revoke Authority
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="bg-primary text-white border-none rounded-[2.5rem] p-10 shadow-premium relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#046c64] opacity-90" />
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <ShieldCheck className="h-24 w-24" />
            </div>
            <div className="relative z-10 space-y-4">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter">Authority Statistics</h3>
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Admins</p>
                     <p className="text-3xl font-black text-secondary">{staff?.filter(s => s.role === 'admin').length || 0}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Super Admins</p>
                     <p className="text-3xl font-black text-secondary">{staff?.filter(s => s.role === 'superadmin').length || 0}</p>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="bg-card border-none rounded-[2.5rem] p-10 shadow-premium flex flex-col justify-center items-center text-center space-y-4 ring-1 ring-border">
            <div className="p-4 bg-secondary/10 rounded-2xl shadow-inner">
               <History className="h-10 w-10 text-secondary" />
            </div>
            <div className="space-y-2">
               <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Governance Audit</h3>
               <p className="text-sm font-medium italic opacity-60 px-8">Complete institutional audit logs of all role changes and administrative delegations.</p>
            </div>
            <Button variant="outline" className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest border-2" onClick={onBack}>
               View Audit Trail
            </Button>
         </Card>
      </div>
    </div>
  );
}
