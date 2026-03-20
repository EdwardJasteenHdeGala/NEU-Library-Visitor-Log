"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
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
  Filter,
  Mail,
  UserCheck,
  XCircle,
  History,
  ShieldAlert,
  UserCog,
  Megaphone // IMPORTED
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, orderBy, serverTimestamp, doc } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

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
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"user" | "admin">("user");
  const [isAdding, setIsAdding] = useState(false);
  
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockDetails, setBlockDetails] = useState("");
  const [blockDuration, setBlockDuration] = useState("24 Hours");

  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [warningTitle, setWarningTitle] = useState("Institutional Warning");
  const [warningMessage, setWarningMessage] = useState("");

  const firestore = useFirestore();
  const { toast } = useToast();
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

  const invitesQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'invites'), orderBy('timestamp', 'desc'));
  }, [firestore, isAdmin]);

  const { data: users, isLoading: isLoadingUsers } = useCollection(usersQuery);
  const { data: invites, isLoading: isLoadingInvites } = useCollection(invitesQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const term = debouncedSearchTerm.toLowerCase().trim();
    if (!term) return users;

    return users.filter(u => {
      const displayNameMatch = u.displayName?.toLowerCase().includes(term);
      const emailMatch = u.email?.toLowerCase().includes(term);
      const idMatch = u.id?.toLowerCase().includes(term);
      const studentIdMatch = u.studentId?.toLowerCase().includes(term);
      const collegeMatch = u.college?.toLowerCase().includes(term);
      return displayNameMatch || emailMatch || idMatch || studentIdMatch || collegeMatch;
    });
  }, [users, searchTerm]);

  const handleInviteUser = async () => {
    if (!newEmail || !firestore || !currentUserProfile) return;
    setIsAdding(true);
    
    addDocumentNonBlocking(collection(firestore, 'invites'), {
      email: newEmail.toLowerCase().trim(),
      role: inviteRole,
      invitedBy: currentUserProfile.id,
      invitedByName: currentUserProfile.displayName,
      timestamp: serverTimestamp(),
      status: 'pending'
    });

    setTimeout(() => {
        setIsAdding(false);
        setIsAddUserOpen(false);
        setNewEmail("");
        setInviteRole("user");
        toast({ title: "Invitation Sent", description: `Pending ${inviteRole.toUpperCase()} authorization created for ${newEmail}.` });
    }, 800);
  };

  const handleRevokeInvite = (inviteId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'invites', inviteId));
    toast({ title: "Invitation Revoked", description: "Authorization removed from registry." });
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mb-2 -ml-2 text-primary/50 hover:text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-[0.2em] gap-2 h-9"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Return
              </Button>
            )}
            <h2 className="text-2xl md:text-3xl font-black text-primary italic uppercase tracking-tighter">Institutional Directory</h2>
            <p className="text-muted-foreground font-medium text-sm md:text-lg">Identity management console.</p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 gap-2 rounded-xl font-black text-xs uppercase shadow-lg w-full sm:w-auto">
                <UserPlus className="h-5 w-5" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md rounded-2xl p-6 md:p-8">
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
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Pre-Authorized Role</Label>
                  <RadioGroup value={inviteRole} onValueChange={(v: any) => setInviteRole(v)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="user" id="invite-user" />
                      <Label htmlFor="invite-user" className="font-bold text-xs uppercase">Member</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="invite-admin" />
                      <Label htmlFor="invite-admin" className="font-bold text-xs uppercase">Admin</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleInviteUser} 
                  disabled={isAdding || !newEmail.includes('@')}
                  className="w-full h-14 font-black uppercase rounded-xl gap-3"
                >
                  {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      <UserCheck className="h-5 w-5" />
                      GRANT ACCESS
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="sticky top-0 z-40 py-2 bg-background/80 backdrop-blur-md -mx-6 px-6 md:mx-0 md:px-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search Name, Email, ID, or Dept..." 
              className="pl-12 h-14 md:h-16 rounded-2xl shadow-xl border-2 text-base md:text-lg font-bold italic focus:ring-primary transition-all bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/40 p-1.5 rounded-2xl mb-8">
          <TabsTrigger value="active" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2">
            <UserCheck className="h-4 w-4" /> Active ({users?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2">
            <Clock className="h-4 w-4" /> Pending ({invites?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="animate-in slide-in-from-left-4 duration-500">
          <Card className="neu-card-shadow border-none overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white shadow-2xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-none">
                    <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest px-6 md:px-8">Member</TableHead>
                    <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest hidden md:table-cell">ID Reference</TableHead>
                    <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">Status</TableHead>
                    <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest text-right px-6 md:px-8">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse border-b">
                        <TableCell className="py-5 px-6 md:px-8"><div className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-full shrink-0 bg-muted/60" /><div className="space-y-2"><Skeleton className="h-4 w-32 bg-muted/50" /><Skeleton className="h-3 w-24 bg-muted/40" /></div></div></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20 bg-muted/50" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full bg-muted/60" /></TableCell>
                        <TableCell className="text-right px-6 md:px-8"><Skeleton className="h-8 w-8 rounded-full ml-auto bg-muted/60" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-muted-foreground">No records found.</TableCell></TableRow>
                  ) : filteredUsers.map((u) => {
                    const userInitials = u.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
                    const isCurrentUser = u.id === currentUserProfile?.id;

                    return (
                      <TableRow key={u.id} className="hover:bg-muted/30 border-b transition-colors duration-300">
                        <TableCell className="py-5 px-6 md:px-8">
                          <div className="flex items-center gap-3 md:gap-4">
                            <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm shrink-0">
                              <AvatarImage src={u.photoURL} alt={u.displayName} />
                              <AvatarFallback className="bg-muted text-primary font-bold text-xs">{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black text-primary text-sm italic truncate">{u.displayName}</span>
                              <span className="text-[10px] text-muted-foreground font-bold opacity-60 truncate">{u.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-black text-[10px] text-muted-foreground hidden md:table-cell">
                          {u.studentId || 'NO-ID'}
                        </TableCell>
                        <TableCell>
                          {u.isBlocked ? (
                            <Badge variant="destructive" className="text-[8px] uppercase font-black px-2 py-1">Suspended</Badge>
                          ) : u.role === 'admin' ? (
                            <Badge className="bg-primary text-white text-[8px] uppercase font-black px-2 py-1">Admin</Badge>
                          ) : (
                            <Badge variant="outline" className="text-primary text-[8px] uppercase font-black px-2 py-1 border-primary/20">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right px-6 md:px-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full"><MoreVertical className="h-5 w-5 text-muted-foreground" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-none p-2">
                              {!isCurrentUser && (
                                <>
                                  <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsWarningDialogOpen(true); }} className="gap-2 cursor-pointer text-primary h-11"><AlertTriangle className="h-4 w-4" /><span className="text-[10px] uppercase font-black">Issue Warning</span></DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')} className="gap-2 cursor-pointer h-11"><ShieldCheck className="h-4 w-4" /><span className="text-[10px] uppercase font-black">{u.role === 'admin' ? 'Revoke Admin' : 'Promote Admin'}</span></DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-1" />
                                  {u.isBlocked ? (
                                    <DropdownMenuItem onClick={() => unblockUser(u.id)} className="gap-2 cursor-pointer text-green-600 h-11"><ShieldCheck className="h-4 w-4" /><span className="text-[10px] uppercase font-black">Restore Access</span></DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsBlockDialogOpen(true); }} className="gap-2 cursor-pointer text-destructive h-11"><Ban className="h-4 w-4" /><span className="text-[10px] uppercase font-black">Suspend Member</span></DropdownMenuItem>
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
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="animate-in slide-in-from-right-4 duration-500">
          <Card className="neu-card-shadow border-none overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white shadow-2xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-none">
                    <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest px-6 md:px-8">Target Email</TableHead>
                    <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">Invited By</TableHead>
                    <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest">Pre-Auth Role</TableHead>
                    <TableHead className="font-black text-primary py-5 uppercase text-[10px] tracking-widest text-right px-6 md:px-8">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingInvites ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse border-b">
                        <TableCell className="py-5 px-6 md:px-8"><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-lg bg-muted/60" /><Skeleton className="h-4 w-40 bg-muted/50" /></div></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 bg-muted/50" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full bg-muted/60" /></TableCell>
                        <TableCell className="text-right px-6 md:px-8"><Skeleton className="h-8 w-8 rounded-full ml-auto bg-muted/60" /></TableCell>
                      </TableRow>
                    ))
                  ) : invites?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-muted-foreground">No pending invitations recorded.</TableCell></TableRow>
                  ) : invites?.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-muted/30 border-b transition-colors duration-300">
                      <TableCell className="py-5 px-6 md:px-8">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/5 rounded-lg"><Mail className="h-4 w-4 text-primary" /></div>
                          <span className="font-black text-primary text-sm italic">{inv.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">{inv.invitedByName || 'Admin'}</TableCell>
                      <TableCell>
                        <Badge variant={inv.role === 'admin' ? 'default' : 'outline'} className="text-[8px] uppercase font-black">
                          {inv.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6 md:px-8">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/5"
                          onClick={() => handleRevokeInvite(inv.id)}
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Block Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="w-[95vw] max-w-xl rounded-3xl p-6 md:p-10 shadow-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-black text-destructive uppercase italic flex items-center gap-4">
              <UserX className="h-8 w-8" /> Institutional Suspension
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base font-medium opacity-70">
              Configure access revocation for <strong>{selectedUser?.displayName}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 md:py-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 ml-2">Suspension Protocol Reason</Label>
              <RadioGroup value={blockReason} onValueChange={setBlockReason} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BLOCK_REASONS.map(reason => (
                  <div key={reason} className="relative">
                    <RadioGroupItem value={reason} id={`reason-${reason}`} className="peer sr-only" />
                    <Label 
                      htmlFor={`reason-${reason}`} 
                      className="flex items-center p-4 rounded-xl border-2 cursor-pointer peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5 hover:bg-slate-50 transition-all font-bold text-xs uppercase"
                    >
                      {reason}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 ml-2">Suspension Duration Term</Label>
              <RadioGroup value={blockDuration} onValueChange={setBlockDuration} className="grid grid-cols-2 gap-3">
                {BLOCK_DURATIONS.map(duration => (
                  <div key={duration} className="relative">
                    <RadioGroupItem value={duration} id={`duration-${duration}`} className="peer sr-only" />
                    <Label 
                      htmlFor={`duration-${duration}`} 
                      className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5 hover:bg-slate-50 transition-all font-bold text-[10px] md:text-xs uppercase"
                    >
                      <span>{duration}</span>
                      <Clock className="h-3.5 w-3.5 opacity-40" />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)} className="rounded-2xl h-14 font-black uppercase tracking-widest px-8 border-2 w-full sm:w-auto order-2 sm:order-1">Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleBlockAction} 
              disabled={!blockReason}
              className="rounded-2xl h-14 font-black uppercase tracking-widest px-10 gap-3 shadow-xl active:scale-95 transition-all w-full sm:w-auto order-1 sm:order-2"
            >
              <Ban className="h-5 w-5" /> CONFIRM TERMINATION
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-3xl p-6 md:p-8">
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
              <Input value={warningTitle} onChange={(e) => setWarningTitle(e.target.value)} className="h-12 rounded-xl border-2 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Message Content</Label>
              <Textarea placeholder="Details of the warning..." className="min-h-[120px] rounded-2xl border-2 font-medium italic p-4 text-base" value={warningMessage} onChange={(e) => setWarningMessage(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsWarningDialogOpen(false)} className="rounded-xl h-14 px-8 font-bold w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSendWarning} disabled={!warningMessage} className="rounded-xl h-14 px-8 gap-2 bg-primary w-full sm:w-auto">
              <ShieldCheck className="h-4 w-4 text-secondary" /> TRANSMIT ALERT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
