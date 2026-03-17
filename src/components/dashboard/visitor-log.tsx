"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function VisitorLog() {
  const [searchTerm, setSearchTerm] = useState("");

  const logs = [
    { name: "Juan Dela Cruz", purpose: "Research", timestamp: "May 10, 2024" },
    { name: "Maria Santos", purpose: "Studying", timestamp: "May 12, 2024" },
    { name: "John Smith", purpose: "Thesis", timestamp: "May 15, 2024" },
  ];

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
                <TableHead className="font-bold text-white">Purpose</TableHead>
                <TableHead className="font-bold text-white">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, i) => (
                <TableRow key={i} className="hover:bg-muted/50 border-b">
                  <TableCell className="font-bold">{log.name}</TableCell>
                  <TableCell>{log.purpose}</TableCell>
                  <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary p-6 rounded-xl flex items-center justify-between text-white shadow-xl">
            <span className="text-lg font-bold">Total Visits: 35</span>
            <Users className="h-6 w-6 opacity-50" />
        </div>
        <div className="bg-primary p-6 rounded-xl flex items-center justify-between text-white shadow-xl">
            <span className="text-lg font-bold">Unique Users: 12</span>
            <Users className="h-6 w-6 opacity-50" />
        </div>
      </div>
    </div>
  );
}