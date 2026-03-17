"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { format } from "date-fns";

export function VisitorLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();

  const visitsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: visits, isLoading } = useCollection(visitsQuery);

  const filteredVisits = visits?.filter(visit => 
    visit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const uniqueUserCount = new Set(visits?.map(v => v.userId)).size;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary mb-2">Visitor Log</h2>
          <p className="text-muted-foreground font-medium">Track all visitor entries into the library.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search visitor..." 
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="neu-card-shadow border-none">
        <CardContent className="p-0 overflow-hidden rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary text-white hover:bg-primary">
                <TableHead className="font-bold text-white">Name</TableHead>
                <TableHead className="font-bold text-white">College</TableHead>
                <TableHead className="font-bold text-white">Purpose</TableHead>
                <TableHead className="font-bold text-white">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading logs...</TableCell></TableRow>
              ) : filteredVisits.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">No entries found.</TableCell></TableRow>
              ) : filteredVisits.map((visit, i) => (
                <TableRow key={i} className="hover:bg-muted/50 border-b">
                  <TableCell className="font-bold">{visit.userName}</TableCell>
                  <TableCell>{visit.college}</TableCell>
                  <TableCell>
                    <span className="text-xs font-bold uppercase tracking-widest bg-accent/10 text-accent px-2 py-1 rounded">
                      {visit.purpose}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'MMM dd, yyyy h:mm a') : 'Just now'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary p-6 rounded-xl flex items-center justify-between text-white shadow-xl">
            <span className="text-lg font-bold">Total Visits: {visits?.length || 0}</span>
            <Users className="h-6 w-6 opacity-50" />
        </div>
        <div className="bg-primary p-6 rounded-xl flex items-center justify-between text-white shadow-xl">
            <span className="text-lg font-bold">Unique Users: {uniqueUserCount}</span>
            <Users className="h-6 w-6 opacity-50" />
        </div>
      </div>
    </div>
  );
}