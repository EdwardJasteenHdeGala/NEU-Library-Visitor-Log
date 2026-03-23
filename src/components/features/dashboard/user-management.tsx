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
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useUserService } from "@/hooks/use-user-service";
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
import { EmptyState } from "@/components/ui/empty-state";
import { diagnosticsLogger } from "@/lib/diagnostics";

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
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [isAdding, setIsAdding] = useState(false);
  
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockDetails, setBlockDetails] = useState("");
  const [blockDuration, setBlockDuration] = useState("24 Hours");

  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [warningTitle, setWarningTitle] = useState("Institutional Warning");
  const [warningMessage, setWarningMessage] = useState("");

  const userService = useUserService();
  const { toast } = useToast();
  const { 
    setUserRole, 
    blockUser, 
    unblockUser,
    sendWarning,
    transferSuperAdmin,
    profile: currentUserProfile 
  } = useAuth();

  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<any>(null);
  const [transferConfirmText, setTransferConfirmText] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const isSuperAdmin = currentUserProfile?.role === 'superadmin';
  const isAdmin = currentUserProfile?.isAuthorizedAdmin === true;

  const usersQuery = useMemoFirebase(() => {
    if (!isAdmin || !userService) return null;
    return userService.getUsersQuery();
  }, [userService, isAdmin]);

  const invitesQuery = useMemoFirebase(() => {
    if (!isAdmin || !userService) return null;
    return userService.getInvitesQuery();
  }, [userService, isAdmin]);

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
  }, [users, debouncedSearchTerm]);

  const handleInviteUser = async () => {
    if (!newEmail || !userService || !currentUserProfile) return;
    setIsAdding(true);
    
    await userService.inviteUser(
      newEmail, 
      inviteRole, 
      currentUserProfile.id, 
      currentUserProfile.displayName || 'Admin'
    );

    setTimeout(() => {
        setIsAdding(false);
        setIsAddUserOpen(false);
        setNewEmail("");
        setInviteRole("member");
        toast({ title: "Invitation Sent", description: `Pending ${inviteRole.toUpperCase()} authorization created for ${newEmail}.` });
    }, 800);
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!userService || !currentUserProfile) return;
    await userService.revokeInvite(inviteId, currentUserProfile.id, currentUserProfile.displayName || 'Admin');
    toast({ title: "Invitation Revoked", description: "Authorization removed from registry." });
  };

  const handleBlockAction = async () => {
    if (!selectedUser || !blockReason) return;
    await blockUser(selectedUser.id, blockReason, blockDetails, blockDuration);
    
    // Telemetry mirroring for institutional logs
    diagnosticsLogger.error(`[SUSPENSION] ${selectedUser.displayName} suspended: ${blockReason}`, { details: blockDetails, duration: blockDuration }, 'system');

    setIsBlockDialogOpen(false);
    setSelectedUser(null);
    setBlockReason("");
    setBlockDetails("");
    setBlockDuration("24 Hours");
  };

  const handleSendWarning = async () => {
    if (!selectedUser || !warningMessage) return;
    await sendWarning(selectedUser.id, warningTitle, warningMessage);
    
    // Telemetry mirroring for institutional logs
    diagnosticsLogger.warn(`[WARNING] Issued to ${selectedUser.displayName}: ${warningTitle}`, { message: warningMessage }, 'system');

    setIsWarningDialogOpen(false);
    setSelectedUser(null);
    setWarningMessage("");
  };

  const handleTransferOwnership = async () => {
    if (!transferTarget || transferConfirmText !== "TRANSFER") return;
    setIsTransferring(true);
    await transferSuperAdmin(transferTarget.email, "Institutional ownership delegation");
    setTimeout(() => {
      setIsTransferring(false);
      setIsTransferDialogOpen(false);
      setTransferTarget(null);
      setTransferConfirmText("");
    }, 1000);
  };

  return (
    <div className="space-y-[2.5rem] animate-in fade-in duration-700 pb-[5rem]">
      {/* Header Alignment */}
      <div className="flex flex-col gap-[1.5rem]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[1.5rem]">
          <div className="space-y-[0.5rem]">
            <h2 className="text-[2rem] md:text-[3rem] font-black text-primary italic uppercase tracking-tighter leading-none text-glow-primary">
              Institutional Directory
            </h2>
            <p className="text-[0.625rem] md:text-[0.875rem] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 leading-none">
              Identity & Access Management Console
            </p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="h-[3.5rem] px-8 gap-3 rounded-[1.25rem] font-black text-[0.75rem] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto bg-primary border-b-4 border-primary/20">
                <UserPlus className="h-[1.25rem] w-[1.25rem] text-secondary" />
                Authorize Member
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md rounded-[2.5rem] border-none shadow-3xl p-8 bg-card">
              <DialogHeader>
                <DialogTitle className="text-[1.5rem] font-black text-primary uppercase italic tracking-tighter">Authorize Access</DialogTitle>
                <DialogDescription className="text-xs font-medium opacity-60">Pre-authorize identity for institutional portal access.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="hub-invite-email" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 opacity-50">Email Address</Label>
                  <Input 
                      id="hub-invite-email"
                      name="invite-email"
                      placeholder="user@neu.edu.ph" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="h-12 rounded-xl border-2 font-bold focus:ring-primary shadow-inner bg-muted/20"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 opacity-50">Authorized Role Term</Label>
                  <RadioGroup value={inviteRole} onValueChange={(v: any) => setInviteRole(v)} className="flex gap-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="member" id="invite-member" />
                      <Label htmlFor="invite-member" className="font-black text-[10px] uppercase tracking-widest cursor-pointer">Member</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="admin" id="invite-admin" />
                      <Label htmlFor="invite-admin" className="font-black text-[10px] uppercase tracking-widest cursor-pointer">Admin</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button 
                  onClick={handleInviteUser} 
                  disabled={isAdding || !newEmail.includes('@')}
                  className="w-full h-14 font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl gap-3"
                >
                  {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      <UserCheck className="h-5 w-5 text-secondary" />
                      Grant Authorization
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Global Filter Alignment */}
        <div className="sticky top-0 z-40 py-6 bg-background/90 backdrop-blur-md rounded-b-[2rem] border-b border-border shadow-sm">
          <div className="relative group max-w-4xl mx-auto">
            <Search className="absolute left-[1.5rem] top-1/2 -translate-y-1/2 h-[1.5rem] w-[1.5rem] text-muted-foreground group-focus-within:text-primary transition-all" />
            <Input 
              id="hub-user-directory-search"
              name="user-search"
              aria-label="Search Institutional Directory"
              placeholder="Search Name, Email, Institutional ID, or Department..." 
              className="pl-[4rem] h-[3.5rem] rounded-[1.25rem] shadow-xl border-2 text-[0.875rem] font-bold italic focus:ring-primary transition-all bg-card border-border focus:scale-[1.01]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/40 p-1.5 rounded-[1.25rem] mb-10 border border-border shadow-inner">
          <TabsTrigger value="active" className="rounded-[1rem] font-black text-[10px] uppercase tracking-[0.2em] gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all h-full">
            <UserCheck className="h-4 w-4" /> Active ({users?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-[1rem] font-black text-[10px] uppercase tracking-[0.2em] gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all h-full">
            <Clock className="h-4 w-4" /> Pending ({invites?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="animate-in slide-in-from-left-4 duration-500">
          <Card className="neu-card-shadow border-none overflow-hidden rounded-[2rem] bg-card shadow-2xl ring-1 ring-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-none">
                    <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest px-8">Member Identity</TableHead>
                    <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest hidden md:table-cell">Institutional ID</TableHead>
                    <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest">Auth Status</TableHead>
                    <TableHead className="font-black text-primary py-6 uppercase text-[10px] tracking-widest text-right px-8">Intervention</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse border-b">
                        <TableCell className="py-6 px-8"><div className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-full shrink-0 bg-muted/60" /><div className="space-y-2"><Skeleton className="h-4 w-32 bg-muted/50" /><Skeleton className="h-3 w-24 bg-muted/40" /></div></div></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20 bg-muted/50" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full bg-muted/60" /></TableCell>
                        <TableCell className="text-right px-8"><Skeleton className="h-8 w-8 rounded-full ml-auto bg-muted/60" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-20">
                         <EmptyState icon={Search} title="No Identifiers Found" message="Try refining your search terms or department scope." />
                      </TableCell>
                    </TableRow>
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
                          ) : u.role === 'superadmin' ? (
                            <Badge className="bg-[#032e41] text-secondary text-[8px] border-2 border-secondary/20 uppercase font-black px-3 py-1 rounded-full shadow-lg">Super Admin</Badge>
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
                                  <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsWarningDialogOpen(true); }} className="gap-2 cursor-pointer text-primary h-11 transition-colors hover:bg-primary/5"><AlertTriangle className="h-4 w-4" /><span className="text-[10px] uppercase font-black">Issue Warning</span></DropdownMenuItem>
                                  
                                  {isAdmin && u.role !== 'superadmin' && (
                                    <DropdownMenuItem onClick={() => setUserRole(u.id, u.role === 'admin' ? 'member' : 'admin')} className="gap-2 cursor-pointer h-11 transition-colors hover:bg-primary/5"><ShieldCheck className="h-4 w-4" /><span className="text-[10px] uppercase font-black">{u.role === 'admin' ? 'Revoke Admin' : 'Promote Admin'}</span></DropdownMenuItem>
                                  )}
                                  
                                  {isSuperAdmin && (
                                    <>
                                      <DropdownMenuItem onClick={() => { setTransferTarget(u); setIsTransferDialogOpen(true); }} className="gap-2 cursor-pointer h-11 text-secondary transition-colors hover:bg-secondary/5 font-bold"><ShieldAlert className="h-4 w-4" /><span className="text-[10px] uppercase font-black">Transfer Ownership</span></DropdownMenuItem>
                                    </>
                                  )}

                                  <DropdownMenuSeparator className="my-1" />
                                  {u.isBlocked ? (
                                    <DropdownMenuItem onClick={() => unblockUser(u.id)} className="gap-2 cursor-pointer text-green-600 h-11"><ShieldCheck className="h-4 w-4" /><span className="text-[10px] uppercase font-black">Restore Access</span></DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsBlockDialogOpen(true); }} disabled={u.role === 'superadmin'} className="gap-2 cursor-pointer text-destructive h-11"><Ban className="h-4 w-4" /><span className="text-[10px] uppercase font-black">Suspend Member</span></DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {isCurrentUser && u.role === 'admin' && (
                                 <DropdownMenuItem onClick={() => toast({ title: "Protocol Check", description: "Use the resignation portal in settings to revoke your own admin status." })} className="gap-2 cursor-pointer text-muted-foreground h-11"><ShieldOff className="h-4 w-4" /><span className="text-[10px] uppercase font-black">Resign Access</span></DropdownMenuItem>
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
          <Card className="neu-card-shadow border-none overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-card shadow-2xl">
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
                    <TableRow>
                      <TableCell colSpan={4} className="py-20">
                         <EmptyState icon={Mail} title="No Pending Access" message="Pre-authorized institutional invitations will appear here." />
                      </TableCell>
                    </TableRow>
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
                      className="flex items-center p-4 rounded-xl border-2 cursor-pointer peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5 hover:bg-muted/50 transition-all font-bold text-xs uppercase"
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
                      className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5 hover:bg-muted/50 transition-all font-bold text-[10px] md:text-xs uppercase"
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
              <Label htmlFor="hub-warning-title" className="text-[10px] font-black uppercase tracking-widest ml-2">Alert Title</Label>
              <Input 
                id="hub-warning-title"
                name="warning-title"
                value={warningTitle} 
                onChange={(e) => setWarningTitle(e.target.value)} 
                className="h-12 rounded-xl border-2 font-bold" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hub-warning-message" className="text-[10px] font-black uppercase tracking-widest ml-2">Message Content</Label>
              <Textarea 
                id="hub-warning-message"
                name="warning-message"
                placeholder="Details of the warning..." 
                className="min-h-[120px] rounded-2xl border-2 font-medium italic p-4 text-base" 
                value={warningMessage} 
                onChange={(e) => setWarningMessage(e.target.value)} 
              />
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
      {/* Transfer Ownership Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-3xl p-6 md:p-8 border-none shadow-3xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-secondary uppercase italic flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-secondary" /> Institutional Delegation
            </DialogTitle>
            <DialogDescription className="text-sm font-medium opacity-70">
              You are about to transfer <strong>Super Admin</strong> ownership to <strong>{transferTarget?.displayName}</strong>. This action is irreversible once confirmed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="bg-secondary/5 border-2 border-dashed border-secondary/20 p-6 rounded-2xl space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Institutional protocol Warning</p>
              <p className="text-xs font-medium italic leading-relaxed text-muted-foreground">
                Upon delegation, your specific authority over role management and system governance will be downgraded to standard administrative level.
              </p>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-50">Confirm Delegation Code</Label>
              <Input 
                placeholder="Type 'TRANSFER' to authorize" 
                value={transferConfirmText}
                onChange={(e) => setTransferConfirmText(e.target.value)}
                className="h-14 rounded-xl border-2 font-black tracking-[0.2em] text-center focus:ring-secondary focus:border-secondary"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)} className="rounded-xl h-14 px-8 font-bold border-2 w-full sm:w-auto">Retain Ownership</Button>
            <Button 
              onClick={handleTransferOwnership} 
              disabled={transferConfirmText !== "TRANSFER" || isTransferring} 
              className="rounded-xl h-14 px-10 gap-2 bg-secondary text-primary font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all w-full sm:w-auto"
            >
              {isTransferring ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
              AUTHORIZE DELEGATION
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
