
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare } from "lucide-react";

export function FeedbackView() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-primary mb-2">Feedback</h2>
        <div className="flex items-center justify-center gap-2 text-secondary font-bold">
            <Star className="h-5 w-5 fill-current" />
            <span>Average Rating: 4.2/5 (18 entries)</span>
        </div>
      </div>

      <Card className="neu-card-shadow border-none">
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Rating</label>
                <Select defaultValue="5">
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                        <SelectItem value="4">4 - Good</SelectItem>
                        <SelectItem value="3">3 - Average</SelectItem>
                        <SelectItem value="2">2 - Poor</SelectItem>
                        <SelectItem value="1">1 - Terrible</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Visit Type</label>
                <Select defaultValue="study">
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="study">Studying</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="borrow">Borrowing Books</SelectItem>
                        <SelectItem value="computer">Computer Use</SelectItem>
                        <SelectItem value="facility">Facility Use</SelectItem>
                        <SelectItem value="printing">Printing/Scanning</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Your Message</label>
            <Textarea 
                placeholder="Share your experience or suggestions for improvement..." 
                className="min-h-[150px] text-lg p-4"
            />
          </div>

          <Button className="w-full h-14 bg-red-800 hover:bg-red-900 text-white font-black text-xl gap-2 neu-card-shadow">
            Submit Feedback
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4 text-muted-foreground">
        <MessageSquare className="h-5 w-5" />
        <p className="text-sm italic">Thank you for helping us improve our services.</p>
      </div>
    </div>
  );
}
