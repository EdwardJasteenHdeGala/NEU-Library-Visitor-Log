
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  UserCog, 
  ShieldCheck, 
  Mail, 
  Globe, 
  MoreVertical, 
  ShieldAlert, 
  UserCheck, 
  ShieldOff, 
  ArrowRightLeft,
  User as UserIcon,
  AlertTriangle,
  UserPlus,
  Loader2,
  Building2,
  Send
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const NEU_COLLEGES = [
  { id: "CICS", name: "Computer & Info Sciences" },
  { id: "CEA", name: "Engineering & Architecture" },
  { id: "CAS", name: "Arts & Sciences" },
  { id: "CBA", name: "Business Administration" },
  { id: "COED", name: "Education" },
  { id: "CON", name: "Nursing" },
  { id: "COM", name: "Medicine" },
  { id: "COL", name: "Law" },
  { id: "GRAD", name: "Graduate School" },
  { id: "SHS", name: "Senior High School" },
  { id: "HS", name: "High School" },
  { id: "EXTERNAL", name: "External / Guest" },
];

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<any>("user");
  const [newCollege, setNewCollege] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const firestore = useFirestore();
  const { 
    setUserRole, 
    transferSuperAdmin, 
    resignAdmin, 
    addUserByEmail,
    profile: currentUserProfile 
  } = useAuth();

  const usersQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'user_profiles'), orderBy('updatedAt', 'desc'));
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.studentId && u.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleAddUser = async () => {
    if (!newEmail.trim() || !newCollege) return;
    setIsAdding(true);
    const success = await addUserByEmail(newEmail.trim(), newRole, newCollege);
    setIsAdding(false);
    if (success) {
      setIsAddUserOpen(false);
      setNewEmail("");
      setNewCollege("");
      setNewRole("user");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary mb-2 italic uppercase">User Directory</h2>
          <p className="text-muted-foreground font-medium">Audit institutional and guest access privileges.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative max-w-sm hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search users..." 
                    className="pl-10 h-12 rounded-xl shadow-sm border-2 w-[240px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 gap-2 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition-transform">
                  <UserPlus className="h-4 w-4" />
                  Grant Access
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem] sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary italic uppercase tracking-tighter">Authorize Access</DialogTitle>
                  <DialogDescription>
                    Provide an email to pre-authorize access. This works like sharing a Google Drive folder; the user gets permissions as soon as they log in.
                  </DialogDescription>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Initial Role</Label>
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger className="h-12 rounded-xl border-2 font-bold focus:ring-primary">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem value="user" className="font-bold text-sm">Institutional User</SelectItem>
                          <SelectItem value="admin" className="font-bold text-sm">Administrator</SelectItem>
                          <SelectItem value="guest" className="font-bold text-sm">Guest Visitor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="college" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Department</Label>
                      <Select value={newCollege} onValueChange={setNewCollege}>
                        <SelectTrigger className="h-12 rounded-xl border-2 font-bold focus:ring-primary">
                          <SelectValue placeholder="College" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl max-h-[300px]">
                          {NEU_COLLEGES.map(c => (
                            <SelectItem key={c.id} value={c.id} className="font-bold text-xs">{c.id}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button 
                    onClick={handleAddUser} 
                    disabled={isAdding || !newEmail.includes('@') || !newCollege}
                    className="w-full h-14 text-lg font-black italic uppercase rounded-2xl shadow-xl gap-2"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        INVITING...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        GRANT PERMISSION
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neu-card-shadow border-none bg-primary text-white rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <UserCog className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Directory Size</p>
              <p className="text-2xl font-black">{users?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card-shadow border-none rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <Globe className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Guest Accounts</p>
              <p className="text-2xl font-black text-primary">
                {users?.filter(u => u.role === 'guest').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card-shadow border-none rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Admins</p>
              <p className="text-2xl font-black text-primary">
                {users?.filter(u => u.role === 'admin').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-2xl bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-none">
              <TableHead className="font-black text-primary py-4 uppercase text-[10px] tracking-widest">User Identity</TableHead>
              <TableHead className="font-black text-primary py-4 uppercase text-[10px] tracking-widest">Institutional ID</TableHead>
              <TableHead className="font-black text-primary py-4 uppercase text-[10px] tracking-widest">Origin</TableHead>
              <TableHead className="font-black text-primary py-4 uppercase text-[10px] tracking-widest">Role</TableHead>
              <TableHead className="font-black text-primary py-4 uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading Directory...</TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">No users matching search criteria.</TableCell></TableRow>
            ) : filteredUsers.map((u, i) => {
              const userInitials = u.displayName
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'U';

              const isSuperAdmin = u.isSuperAdmin === true;
              const isCurrentUser = u.id === currentUserProfile?.id;
              const iAmSuperAdmin = currentUserProfile?.isSuperAdmin === true;
              const isPending = u.displayName === 'New User (Pending)';

              return (
                <TableRow key={u.id} className="hover:bg-muted/30 border-b">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className={cn("h-10 w-10 border-2 shadow-sm", isPending ? "border-dashed border-muted-foreground/30" : "border-muted")}>
                        <AvatarImage src={u.photoURL} alt={u.displayName} />
                        <AvatarFallback className="bg-muted text-primary font-black text-xs">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className={cn("font-bold text-primary flex items-center gap-2", isPending && "italic text-muted-foreground")}>
                          {u.displayName} 
                          {isPending && (
                            <Badge className="text-[7px] bg-secondary/10 text-secondary border-none px-2 h-4 font-black tracking-widest uppercase">
                              PENDING SYNC
                            </Badge>
                          )}
                          {isCurrentUser && <span className="text-[8px] bg-primary text-white px-2 py-0.5 rounded uppercase font-black">You</span>}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] font-black text-muted-foreground">
                    {isPending ? '---' : u.studentId}
                  </TableCell>
                  <TableCell className="text-sm font-bold uppercase tracking-tight italic text-primary/80">{u.college || 'Guest'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {isSuperAdmin && (
                        <Badge className="bg-secondary text-primary text-[9px] uppercase font-black px-2.5 py-1 flex items-center gap-1 shadow-sm border border-primary/20">
                          <ShieldAlert className="h-3 w-3" />
                          Super Admin
                        </Badge>
                      )}
                      {u.role === 'admin' && !isSuperAdmin && (
                        <Badge className="bg-primary text-white text-[9px] uppercase font-black px-2.5 py-1">Admin</Badge>
                      )}
                      {u.role === 'user' && (
                        <Badge variant="outline" className="text-primary text-[9px] uppercase font-black px-2.5 py-1 border-primary/20">Institutional</Badge>
                      )}
                      {u.role === 'guest' && (
                        <Badge className="bg-muted text-muted-foreground text-[9px] uppercase font-black px-2.5 py-1">Guest</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-none">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 py-3">
                          {isCurrentUser ? "Self Control" : "Institutional Permissions"}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {isCurrentUser ? (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  disabled={isSuperAdmin}
                                  className="rounded-xl h-11 gap-3 focus:bg-destructive/5 cursor-pointer text-destructive font-black"
                                >
                                  <ShieldOff className="h-4 w-4" />
                                  <span className="font-black text-xs uppercase tracking-widest">Resign Admin Privileges</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-2xl font-black text-primary italic uppercase tracking-tighter">Confirm Resignation</AlertDialogTitle>
                                  <AlertDialogDescription className="text-base font-medium">
                                    You are about to revoke your own administrative access. You will be demoted to a regular user immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl font-bold">Keep Admin Access</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={resignAdmin}
                                    className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-black"
                                  >
                                    Confirm Demotion
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        ) : (
                          <>
                            {iAmSuperAdmin && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    onSelect={(e) => e.preventDefault()}
                                    className="rounded-xl h-11 gap-3 focus:bg-secondary/10 cursor-pointer text-secondary font-black"
                                  >
                                    <ArrowRightLeft className="h-4 w-4" />
                                    <span className="text-xs uppercase tracking-widest">Transfer Ownership</span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl border-2 border-secondary/20">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-black text-primary italic uppercase tracking-tighter text-center">Transfer Ownership</AlertDialogTitle>
                                    <AlertDialogDescription className="text-center text-base">
                                      Transfer Super Admin status to <strong className="text-primary">{u.displayName}</strong>. You will lose your unique institutional ownership privileges.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="sm:justify-center gap-2">
                                    <AlertDialogCancel className="rounded-xl font-bold border-2">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => transferSuperAdmin(u.id)}
                                      className="bg-secondary text-primary rounded-xl font-black"
                                    >
                                      Confirm Transfer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {!isSuperAdmin && (
                              <>
                                {u.role !== 'admin' ? (
                                  <DropdownMenuItem 
                                    onClick={() => setUserRole(u.id, 'admin')}
                                    className="rounded-xl h-11 gap-3 focus:bg-primary/5 cursor-pointer text-primary"
                                  >
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="font-black text-xs uppercase tracking-widest">Grant Admin Role</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => setUserRole(u.id, 'user')}
                                    className="rounded-xl h-11 gap-3 focus:bg-destructive/5 cursor-pointer text-destructive"
                                  >
                                    <ShieldOff className="h-4 w-4" />
                                    <span className="font-black text-xs uppercase tracking-widest">Revoke Admin Role</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setUserRole(u.id, 'user')}
                                  className="rounded-xl h-11 gap-3 focus:bg-muted cursor-pointer"
                                >
                                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-bold text-xs">Set Institutional User</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setUserRole(u.id, 'guest')}
                                  className="rounded-xl h-11 gap-3 focus:bg-muted cursor-pointer"
                                >
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-bold text-xs">Set External Guest</span>
                                </DropdownMenuItem>
                              </>
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
    </div>
  );
}
