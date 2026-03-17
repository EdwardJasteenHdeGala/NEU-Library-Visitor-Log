"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, History, MessageSquare, AlertCircle, TrendingUp, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { format } from "date-fns";

export function AdminOverview() {
  const firestore = useFirestore();

  const visitsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(5));
  }, [firestore]);

  const { data: recentVisits, isLoading } = useCollection(visitsQuery);

  const stats = [
    { title: "Daily Visits", value: "124", icon: Users, color: "bg-blue-600", trend: "+12%" },
    { title: "Weekly Visits", value: "842", icon: TrendingUp, color: "bg-green-600", trend: "+5%" },
    { title: "Monthly Visits", value: "3,241", icon: Users, color: "bg-orange-600", trend: "+18%" },
    { title: "Pending Feedback", value: "5", icon: MessageSquare, color: "bg-red-600", trend: "" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary mb-2">System Dashboard</h2>
          <p className="text-muted-foreground font-medium">Real-time overview of library activity and system status.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-lg shadow-sm border flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Filter className="h-4 w-4" />
            Quick Range:
            <Select defaultValue="today">
              <SelectTrigger className="border-none bg-transparent h-8 w-[120px] shadow-none p-0 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="neu-card-shadow border-none overflow-hidden hover:scale-[1.02] transition-transform">
            <div className={`h-1.5 ${stat.color}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-4xl font-black text-primary">{stat.value}</span>
                  {stat.trend && <p className="text-[10px] font-bold text-green-600">{stat.trend} from last period</p>}
                </div>
                <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
                    <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 neu-card-shadow border-none overflow-hidden">
          <CardHeader className="border-b bg-muted/20 p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Latest Visitor Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-none">
                  <TableHead className="font-bold py-4">Visitor Name</TableHead>
                  <TableHead className="font-bold py-4">College</TableHead>
                  <TableHead className="font-bold py-4">Purpose</TableHead>
                  <TableHead className="font-bold py-4">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Loading logs...</TableCell></TableRow>
                ) : recentVisits?.map((visit, i) => (
                  <TableRow key={i} className="hover:bg-muted/30 border-b">
                    <TableCell className="font-bold py-4">{visit.userName}</TableCell>
                    <TableCell className="text-sm">{visit.college}</TableCell>
                    <TableCell>
                      <span className="text-xs font-bold uppercase tracking-widest bg-accent/10 text-accent px-2 py-1 rounded">
                        {visit.purpose}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {visit.timestamp?.seconds ? format(visit.timestamp.seconds * 1000, 'h:mm a') : 'Just now'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="neu-card-shadow border-none">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Quick Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">By Purpose</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="reading">Reading Books</SelectItem>
                  <SelectItem value="thesis">Thesis Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">By College</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  <SelectItem value="cas">CAS</SelectItem>
                  <SelectItem value="cba">CBA</SelectItem>
                  <SelectItem value="coed">COED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Employment Status</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}