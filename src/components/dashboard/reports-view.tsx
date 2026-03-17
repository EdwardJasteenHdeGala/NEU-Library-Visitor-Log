"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ReportsView() {
  const reports = [
    { name: "Weekly Summary", purpose: "Admin Audit", timestamp: "May 20, 2024" },
    { name: "Monthly Usage", purpose: "Resource Planning", timestamp: "Jun 01, 2024" },
    { name: "Semester Review", purpose: "Library Stats", timestamp: "Jun 15, 2024" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-primary mb-2">Reports</h2>
        <p className="text-muted-foreground font-medium">Generate and export library visitation data.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search reports..." className="pl-12 h-14 text-lg neu-card-shadow" />
      </div>

      <Card className="neu-card-shadow border-none overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-black text-primary uppercase">Report Name</TableHead>
              <TableHead className="font-black text-primary uppercase">Purpose</TableHead>
              <TableHead className="font-black text-primary uppercase">Date Generated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report, i) => (
              <TableRow key={i} className="hover:bg-muted/30">
                <TableCell className="font-bold py-4">{report.name}</TableCell>
                <TableCell className="py-4">{report.purpose}</TableCell>
                <TableCell className="text-muted-foreground py-4">{report.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button size="lg" className="h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl gap-3 neu-card-shadow">
            <Download className="h-6 w-6" />
            Export CSV
          </Button>
          <div className="bg-primary p-4 px-8 rounded-xl flex items-center justify-between text-white neu-card-shadow">
            <span className="text-xl font-black">Unique Users: 12</span>
            <Users className="h-6 w-6 opacity-50" />
          </div>
      </div>
    </div>
  );
}