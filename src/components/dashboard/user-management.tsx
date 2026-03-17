
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserCog, ShieldCheck, Mail, BookOpen } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Badge } from "@/components/ui/badge";

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'user_profiles'), orderBy('displayName', 'asc'));
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary mb-2">User Management</h2>
          <p className="text-muted-foreground font-medium">Manage library access and administrative roles.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or ID..." 
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neu-card-shadow border-none bg-primary text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <UserCog className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Registered</p>
              <p className="text-2xl font-black">{users?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card-shadow border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Admins</p>
              <p className="text-2xl font-black text-primary">
                {users?.filter(u => u.role === 'admin').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card-shadow border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authorized Admins</p>
              <p className="text-2xl font-black text-primary">
                {users?.filter(u => u.isAuthorizedAdmin).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold text-primary">Name / Email</TableHead>
              <TableHead className="font-bold text-primary">Student ID</TableHead>
              <TableHead className="font-bold text-primary">College</TableHead>
              <TableHead className="font-bold text-primary">Access Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading users...</TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">No users found.</TableCell></TableRow>
            ) : filteredUsers.map((u, i) => (
              <TableRow key={i} className="hover:bg-muted/30 border-b">
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">{u.displayName}</span>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{u.studentId}</TableCell>
                <TableCell className="text-sm">{u.college || 'General'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {u.role === 'admin' && (
                      <Badge className="bg-primary text-white text-[9px] uppercase font-black">Admin</Badge>
                    )}
                    {u.role === 'user' && (
                      <Badge variant="outline" className="text-primary text-[9px] uppercase font-black">User</Badge>
                    )}
                    {u.isAuthorizedAdmin && (
                      <Badge className="bg-secondary text-primary text-[9px] uppercase font-black">Authorized</Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
