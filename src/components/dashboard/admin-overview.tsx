"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, History, MessageSquare, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AdminOverview() {
  const stats = [
    { title: "Total Visits", value: "35", icon: Users, color: "bg-blue-600" },
    { title: "Unique Users", value: "12", icon: Users, color: "bg-green-600" },
    { title: "Pending Notifications", value: "5", icon: AlertCircle, color: "bg-orange-600" },
    { title: "Feedback Entries", value: "18", icon: MessageSquare, color: "bg-red-600" },
  ];

  const recentVisits = [
    { name: "John Doe", purpose: "Research", timestamp: "Feb 25, 2025 10:30 AM" },
    { name: "Jane Smith", purpose: "Book Return", timestamp: "Feb 25, 2025 09:15 AM" },
    { name: "Robert Wilson", purpose: "Study", timestamp: "Feb 24, 2025 04:45 PM" },
    { name: "Maria Garcia", purpose: "Consultation", timestamp: "Feb 24, 2025 02:00 PM" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-primary mb-2">Dashboard</h2>
        <p className="text-muted-foreground font-medium">Overview of library activity and system status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="neu-card-shadow border-none overflow-hidden">
            <div className={`h-1 ${stat.color}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-primary">{stat.value}</span>
                <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                    <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="neu-card-shadow border-none">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Recent Visits
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Purpose</TableHead>
                <TableHead className="font-bold">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentVisits.map((visit, i) => (
                <TableRow key={i} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{visit.name}</TableCell>
                  <TableCell>{visit.purpose}</TableCell>
                  <TableCell className="text-muted-foreground">{visit.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}