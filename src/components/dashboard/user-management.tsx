
"use client";

import React, { useState, useMemo } from "react";
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
  UserX,
  Clock,
  Filter
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const BLOCK_REASONS = [
  "Spam",
  "Harassment",
  "Inappropriate Content",
  "Hate Speech",
  "Other"
];

const BLOCK_DURATIONS = [
  "24 Hours",
  "7 Days",
  "30 Days",
  "Permanent"
];

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
  const [blockDetails, setBlockDetails] = useState("");
  const [blockDuration, setBlockDuration] = useState("24 Hours");

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

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;

    return users.filter(u => {
      const displayNameMatch = u.displayName?.toLowerCase().includes(term);
      const emailMatch = u.email?.toLowerCase().includes(term);
      const idMatch = u.id?.toLowerCase().includes(term);
      const studentIdMatch = u.studentId?.toLowerCase().includes(term);
      const collegeMatch = u.college?.toLowerCase().includes(term);
      
      // Multi-field dynamic filtering
      return displayNameMatch || emailMatch || idMatch || studentIdMatch || collegeMatch;
    });
  }, [users, searchTerm]);

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
    await blockUser(selectedUser.id, blockReason, blockDetails, blockDuration);
    setIsBlockDialogOpen(false);
    setSelectedUser(null);
    setBlockReason("");
    setBlockDetails("");
    setBlockDuration("24 Hours");
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

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-primary italic uppercase tracking-tighter">Institutional Directory</h2>
            <p className="text-muted-foreground font-medium text-lg">Identity management console.</p>
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

        {/* Universal Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            placeholder="Search by Name, Email, UID, Student ID, or Department..." 
            className="pl-12 h-16 rounded-2xl shadow-xl border-2 text-lg font-bold italic focus:ring-primary transition-all bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-4 flex items-center">
            <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10 flex items-center gap-2">
               <Filter className="h-3 w-3 text-primary" />
               <span className="text-[9px] font-black text-primary uppercase tracking-widest">Universal Filter</span>
            </div>
          </div>
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
              <TableRow><TableCell colSpan={5} className="text-center py-20 italic text-muted-foreground">No institutional records found matching your search.</TableCell></TableRow>
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
                  <TableCell className="font-black text-[10px] text-muted-foreground tracking-widest">
                    <div className="flex flex-col">
                      <span>ID: {u.studentId || 'NO-ID'}</span>
                      <span className="opacity-50 text-[8px] uppercase">UID: {u.id}</span>
                    </div>
                  </TableCell>
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

      {/* Block Dialog (Restructured with Modal Requirements) */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="rounded-3xl p-8 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-destructive uppercase italic flex items-center gap-4">
              <UserX className="h-8 w-8" /> Institutional Suspension
            </DialogTitle>
            <DialogDescription className="text-base font-medium opacity-70">
              Configure access revocation for <strong>{selectedUser?.displayName}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-8 space-y-10">
            {/* Reason Dropdown */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 ml-2">Suspension Protocol Reason</Label>
              <Select value={blockReason} onValueChange={setBlockReason}>
                <SelectTrigger className="h-14 rounded-2xl border-2 font-bold focus:ring-primary shadow-inner bg-slate-50">
                  <SelectValue placeholder="Select primary violation..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-3xl">
                  {BLOCK_REASONS.map(reason => (
                    <SelectItem key={reason} value={reason} className="font-bold py-3">
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Details Textarea */}
            {blockReason === "Other" && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 ml-2">Additional Violation Details</Label>
                <Textarea 
                  placeholder="Specify institutional policy violations..."
                  className="min-h-[100px] rounded-2xl border-2 font-medium italic p-4 focus:ring-primary shadow-inner bg-slate-50"
                  value={blockDetails}
                  onChange={(e) => setBlockDetails(e.target.value)}
                />
              </div>
            )}

            {/* Duration Toggles */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 ml-2">Suspension Duration Term</Label>
              <RadioGroup value={blockDuration} onValueChange={setBlockDuration} className="grid grid-cols-2 gap-4">
                {BLOCK_DURATIONS.map(duration => (
                  <div key={duration} className="relative">
                    <RadioGroupItem value={duration} id={`duration-${duration}`} className="peer sr-only" />
                    <Label 
                      htmlFor={`duration-${duration}`} 
                      className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5 hover:bg-slate-50 transition-all font-bold text-xs uppercase"
                    >
                      <span>{duration}</span>
                      <Clock className="h-3.5 w-3.5 opacity-40" />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)} className="rounded-2xl h-14 font-black uppercase tracking-widest px-10 border-2">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBlockAction} 
              disabled={!blockReason || (blockReason === "Other" && !blockDetails.trim())}
              className="rounded-2xl h-14 font-black uppercase tracking-widest px-10 gap-3 shadow-xl active:scale-95 transition-all"
            >
              <Ban className="h-5 w-5" /> CONFIRM TERMINATION
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="rounded-3xl p-8 sm:max-w-lg">
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
