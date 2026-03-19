
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShieldCheck, 
  MoreVertical, 
  ShieldOff, 
  UserPlus,
  Loader2,
  ArrowLeft,
  Ban,
  AlertTriangle,
  UserX
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
import { Textarea } from "@/components/ui/textarea";

interface UserManagementProps {
  onBack?: () => void;
}

export function UserManagement({ onBack }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Blocking UI State
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [warningTitle, setWarningTitle] = useState("Institutional Warning");
  const [warningMessage, setWarningMessage] = useState("");

  const firestore = useFirestore();
  const { 
    setUserRole, 
    blockUser, 
    unblockUser,
    sendWarning,
    profile: currentUserProfile 
  } = useAuth();

  const isAdmin = currentUserProfile?.role === 'admin';

  const usersQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'users'), orderBy('updatedAt', 'desc'));
  }, [firestore, isAdmin]);

  const { data: users, isLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.studentId && u.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleInviteUser = async () => {
    setIsAdding(true);
    setTimeout(() => {
        setIsAdding(false);
        setIsAddUserOpen(false);
        setNewEmail("");
    }, 1000);
  };

  const handleBlockAction = async () => {
    if (!selectedUser || !blockReason) return;
    await blockUser(selectedUser.id, blockReason);
    setIsBlockDialogOpen(false);
    setSelectedUser(null);
    setBlockReason("");
  };

  const handleSendWarning = async () => {
    if (!selectedUser || !warningMessage) return;
    await sendWarning(selectedUser.id, warningTitle, warningMessage);
    setIsWarningDialogOpen(false);
    setSelectedUser(null);
    setWarningMessage("");
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
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-primary italic uppercase tracking-tighter">Institutional Directory</h2>
          <p className="text-muted-foreground font-medium text-lg">Identity management console.</p>
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
                <Button className="h-12 gap-2 rounded-xl font-black text-xs uppercase shadow-lg">
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-primary uppercase italic">Authorize Access</DialogTitle>
                  <DialogDescription>Pre-authorize an email for institutional portal access.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Email Address</Label>
                    <Input 
                        placeholder="user@neu.edu.ph" 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="h-12 rounded-xl border-2 font-bold"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleInviteUser} 
                    disabled={isAdding || !newEmail.includes('@')}
                    className="w-full h-12 font-black uppercase rounded-xl"
                  >
                    {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "GRANT ACCESS"}
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
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest px-8">Member Identity</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">ID Reference</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">Unit</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest text-right px-8">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Directory...</TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 italic text-muted-foreground">No institutional records found.</TableCell></TableRow>
            ) : filteredUsers.map((u) => {
              const userInitials = u.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
              const isCurrentUser = u.id === currentUserProfile?.id;

              return (
                <TableRow key={u.id} className="hover:bg-muted/30 border-b transition-colors duration-300">
                  <TableCell className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
                        <AvatarImage src={u.photoURL} alt={u.displayName} />
                        <AvatarFallback className="bg-muted text-primary font-bold text-xs">{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-black text-primary text-sm italic">{u.displayName}</span>
                        <span className="text-[10px] text-muted-foreground font-bold opacity-60">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-[10px] text-muted-foreground tracking-widest">{u.studentId || 'NO-ID'}</TableCell>
                  <TableCell className="text-[10px] font-black uppercase tracking-tight italic text-primary/70">{u.college || 'Guest'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                       {u.isBlocked ? (
                         <Badge variant="destructive" className="text-[9px] uppercase font-black px-3 py-1">Suspended</Badge>
                       ) : u.role === 'admin' ? (
                        <Badge className="bg-primary text-white text-[9px] uppercase font-black px-3 py-1">Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="text-primary text-[9px] uppercase font-black px-3 py-1 border-primary/20">Active</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-none">
                        <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Oversight</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!isCurrentUser && (
                          <>
                            <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsWarningDialogOpen(true); }} className="gap-2 cursor-pointer text-primary">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-[10px] uppercase font-black">Issue Warning</span>
                            </DropdownMenuItem>
                            
                            {u.role !== 'admin' ? (
                              <DropdownMenuItem onClick={() => setUserRole(u.id, 'admin')} className="gap-2 cursor-pointer text-primary">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-[10px] uppercase font-black">Promote Admin</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setUserRole(u.id, 'user')} className="gap-2 cursor-pointer text-destructive">
                                <ShieldOff className="h-4 w-4" />
                                <span className="text-[10px] uppercase font-black">Revoke Access</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {u.isBlocked ? (
                              <DropdownMenuItem onClick={() => unblockUser(u.id)} className="gap-2 cursor-pointer text-green-600">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-[10px] uppercase font-black">Restore Access</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsBlockDialogOpen(true); }} className="gap-2 cursor-pointer text-destructive">
                                <Ban className="h-4 w-4" />
                                <span className="text-[10px] uppercase font-black">Suspend Member</span>
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Block Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-destructive uppercase italic flex items-center gap-3">
              <UserX className="h-6 w-6" /> Terminate Access
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              You are about to suspend <strong>{selectedUser?.displayName}</strong>. They will be immediately logged out and blocked from library entry.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Official Reason for Suspension</Label>
            <Textarea 
              placeholder="e.g. Violation of library code of conduct, excessive noise, or non-compliance with staff instructions."
              className="min-h-[120px] rounded-2xl border-2 font-medium italic p-4"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)} className="rounded-xl h-12 font-bold px-8">Cancel</Button>
            <Button variant="destructive" onClick={handleBlockAction} disabled={!blockReason} className="rounded-xl h-12 font-black px-8 gap-2">
              <Ban className="h-4 w-4" /> CONFIRM SUSPENSION
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase italic flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-secondary" /> Issue Official Warning
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Send a prioritized security alert to <strong>{selectedUser?.displayName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Alert Title</Label>
              <Input 
                value={warningTitle}
                onChange={(e) => setWarningTitle(e.target.value)}
                className="h-12 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Message Content</Label>
              <Textarea 
                placeholder="Details of the warning..."
                className="min-h-[120px] rounded-2xl border-2 font-medium italic p-4"
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsWarningDialogOpen(false)} className="rounded-xl h-12 font-bold px-8">Cancel</Button>
            <Button onClick={handleSendWarning} disabled={!warningMessage} className="rounded-xl h-12 font-black px-8 gap-2 bg-primary">
              <ShieldCheck className="h-4 w-4 text-secondary" /> TRANSMIT ALERT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
