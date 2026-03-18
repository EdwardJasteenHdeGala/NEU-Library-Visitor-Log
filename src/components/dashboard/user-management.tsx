"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShieldCheck, 
  Mail, 
  MoreVertical, 
  ShieldAlert, 
  ShieldOff, 
  ArrowRightLeft,
  UserPlus,
  Loader2,
  Building2,
  Send,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  History,
  CalendarDays
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UserManagementProps {
  onBack?: () => void;
}

export function UserManagement({ onBack }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const firestore = useFirestore();
  const { 
    setUserRole, 
    transferSuperAdmin, 
    resignAdmin, 
    addUserByEmail,
    profile: currentUserProfile 
  } = useAuth();

  const isAdmin = currentUserProfile?.role === 'admin' || currentUserProfile?.isSuperAdmin;

  const usersQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'user_profiles'), orderBy('updatedAt', 'desc'));
  }, [firestore, isAdmin]);

  const visitsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'));
  }, [firestore, isAdmin]);

  const { data: users, isLoading } = useCollection(usersQuery);
  const { data: visits } = useCollection(visitsQuery);

  const filteredUsers = users?.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.studentId && u.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleAddUser = async () => {
    if (!newEmail.trim()) return;
    setIsAdding(true);
    const success = await addUserByEmail(newEmail.trim(), 'user', 'General');
    setIsAdding(false);
    if (success) {
      setIsAddUserOpen(false);
      setNewEmail("");
    }
  };

  const getUserVisits = (userId: string) => {
    return visits?.filter(v => v.userId === userId) || [];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {onBack && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2 -ml-2 text-primary/50 hover:text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-[0.2em] gap-2 rounded-xl h-8 px-4"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Overview
        </Button>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary mb-2 italic uppercase tracking-tighter">Institutional Directory</h2>
          <p className="text-muted-foreground font-medium text-lg">Consolidated audit and identity management console.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative max-w-sm hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search members..." 
                    className="pl-10 h-12 rounded-xl shadow-sm border-2 w-[280px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 gap-2 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition-transform">
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem] sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary italic uppercase tracking-tighter">Authorize Access</DialogTitle>
                  <DialogDescription>Pre-authorize an email for institutional portal access.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                          id="email" 
                          placeholder="user@gmail.com" 
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="h-12 rounded-xl border-2 pl-10 font-bold focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleAddUser} 
                    disabled={isAdding || !newEmail.includes('@')}
                    className="w-full h-14 text-lg font-black uppercase rounded-2xl shadow-xl gap-2"
                  >
                    {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    GRANT ACCESS
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-none">
              <TableHead className="w-16"></TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest px-8">Member Identity</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">ID Reference</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">Unit/Origin</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">Permissions</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest text-right px-8">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20 font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Directory...</TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20 italic text-muted-foreground">No institutional records found.</TableCell></TableRow>
            ) : filteredUsers.map((u) => {
              const userInitials = u.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
              const isSuperAdmin = u.isSuperAdmin === true;
              const isCurrentUser = u.id === currentUserProfile?.id;
              const iAmSuperAdmin = currentUserProfile?.isSuperAdmin === true;
              const userVisits = getUserVisits(u.id);
              const isExpanded = expandedUser === u.id;

              return (
                <React.Fragment key={u.id}>
                  <TableRow className="hover:bg-muted/30 border-b transition-colors duration-300">
                    <TableCell className="pl-8">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("h-10 w-10 rounded-xl transition-all", isExpanded ? "bg-primary text-white" : "hover:bg-primary/5 text-primary")}
                        onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </Button>
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
                          <AvatarImage src={u.photoURL} alt={u.displayName} />
                          <AvatarFallback className="bg-muted text-primary font-black text-sm">{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-black text-primary text-base flex items-center gap-2 italic">
                            {u.displayName} 
                            {isCurrentUser && <span className="text-[8px] bg-primary text-white px-3 py-1 rounded-full uppercase font-black not-italic shadow-sm">Self</span>}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-bold opacity-60">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-[10px] text-muted-foreground tracking-widest">{u.studentId || 'NO-ID'}</TableCell>
                    <TableCell className="text-[11px] font-black uppercase tracking-tight italic text-primary/70">{u.college || 'Guest'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {isSuperAdmin ? (
                          <Badge className="bg-secondary text-primary text-[9px] uppercase font-black px-3 py-1 flex items-center gap-2 shadow-sm border border-primary/20">
                            <ShieldAlert className="h-3.5 w-3.5" /> Super Admin
                          </Badge>
                        ) : u.role === 'admin' ? (
                          <Badge className="bg-primary text-white text-[9px] uppercase font-black px-3 py-1">Administrator</Badge>
                        ) : (
                          <Badge variant="outline" className="text-primary text-[9px] uppercase font-black px-3 py-1 border-primary/20">Institutional</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted">
                            <MoreVertical className="h-5 w-5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-none">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4 py-3">Management Console</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {isCurrentUser ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isSuperAdmin} className="rounded-xl h-12 gap-3 focus:bg-destructive/5 cursor-pointer text-destructive font-black">
                                    <ShieldOff className="h-4 w-4" />
                                    <span className="font-black text-[11px] uppercase tracking-widest">Resign Credentials</span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-black text-primary italic uppercase tracking-tighter">Confirm Resignation</AlertDialogTitle>
                                    <AlertDialogDescription className="text-base font-medium">Revoking your administrative status will immediately demote your identity to a standard role.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={resignAdmin} className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-black">Demote Now</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <>
                              {iAmSuperAdmin && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl h-12 gap-3 focus:bg-secondary/10 cursor-pointer text-secondary font-black">
                                      <ArrowRightLeft className="h-4 w-4" />
                                      <span className="text-[11px] uppercase tracking-widest">Transfer Ownership</span>
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl border-2 border-secondary/20 shadow-3xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-2xl font-black text-primary italic uppercase tracking-tighter text-center">Transfer Super Status</AlertDialogTitle>
                                      <AlertDialogDescription className="text-center text-base font-medium">You are transferring ultimate oversight to <strong className="text-primary italic">{u.displayName}</strong>.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="sm:justify-center gap-4 pt-4">
                                      <AlertDialogCancel className="rounded-xl font-bold border-2 h-12 px-8">Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => transferSuperAdmin(u.id)} className="bg-secondary text-primary rounded-xl font-black h-12 px-8 shadow-lg">Execute Transfer</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              {!isSuperAdmin && (
                                u.role !== 'admin' ? (
                                  <DropdownMenuItem onClick={() => setUserRole(u.id, 'admin')} className="rounded-xl h-12 gap-3 focus:bg-primary/5 cursor-pointer text-primary">
                                    <ShieldCheck className="h-4 w-4 text-secondary" />
                                    <span className="font-black text-[11px] uppercase tracking-widest">Promote to Admin</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => setUserRole(u.id, 'user')} className="rounded-xl h-12 gap-3 focus:bg-destructive/5 cursor-pointer text-destructive">
                                    <ShieldOff className="h-4 w-4" />
                                    <span className="font-black text-[11px] uppercase tracking-widest">Revoke Admin Role</span>
                                  </DropdownMenuItem>
                                )
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-slate-50/50 border-none">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-10 space-y-6 animate-in slide-in-from-top-4 duration-500">
                          <div className="flex items-center justify-between border-b-2 border-white pb-6">
                            <div className="flex items-center gap-4">
                                <History className="h-6 w-6 text-primary" />
                                <h4 className="font-black text-primary uppercase text-sm tracking-widest italic">Institutional Access History</h4>
                            </div>
                            <Badge variant="outline" className="bg-white px-5 py-2 font-black text-[10px] uppercase shadow-sm border-primary/10">{userVisits.length} Sessions</Badge>
                          </div>
                          {userVisits.length === 0 ? (
                            <div className="py-20 text-center italic text-muted-foreground text-sm font-bold uppercase tracking-widest bg-white/40 rounded-3xl border-2 border-dashed">No access records detected.</div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {userVisits.map((visit) => (
                                <Card key={visit.id} className="shadow-sm border-none bg-white rounded-2xl overflow-hidden hover:scale-105 transition-transform">
                                  <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-1">
                                        <p className="text-xs font-black text-primary uppercase tracking-tight italic leading-tight">{visit.purpose}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><Building2 className="h-3 w-3" /> {visit.college}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                      <div className="flex items-center gap-2">
                                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="text-[10px] font-bold text-slate-700">{visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd, yyyy') : 'Recently'}</span>
                                      </div>
                                      <span className={cn("text-[10px] font-black uppercase italic", visit.exitTimestamp ? "text-green-600" : "text-amber-600 animate-pulse")}>
                                        {visit.exitTimestamp ? `STAY: ${visit.durationMinutes}m` : "ACTIVE"}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}