
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { HelpCircle, Mail, Phone, Book, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HelpViewProps {
  onBack?: () => void;
}

export function HelpView({ onBack }: HelpViewProps) {
  const faqs = [
    {
      q: "How does the Access Hub track institutional attendance?",
      a: "The Hub records all physical telemetry—including time, department, and stated purpose—for full audit capability. This data is securely processed in real-time."
    },
    {
      q: "Can I link my physical Smart Card or RFID?",
      a: "Yes. Navigate to your Profile Settings under the 'Identity Hardware' section. A quick scan from your local RFID terminal binds your card to your Google Workspace identity for swift physical tapping."
    },
    {
      q: "What constitutes an 'Institutional Suspension'?",
      a: "Supervisors may flag accounts for policy violations (e.g. academic cheating, behavioral misconduct, hardware damage). Suspended accounts are barred from building access until cleared through the Resolution Thread."
    },
    {
      q: "How do Resolution Threads work?",
      a: "Whenever you rate your experience critically via the Sentiments array, Administrators review the telemetry and assign corrective actions. You receive direct Inbox Alerts when cases are resolved."
    },
    {
      q: "Why use 'Multiple Choice' filters on the Visitor Archive?",
      a: "Multiple College targeting allows supervisors to instantly correlate traffic loads between selected departments (e.g. CAS and CICS) during peak capacity periods."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-[2.5rem] animate-in fade-in duration-700 pb-[5rem]">
      {/* Institutional Support Header */}
      <div className="flex flex-col gap-[1.5rem]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-[1.5rem]">
          <div className="space-y-[0.5rem]">
            <h2 className="text-[2rem] md:text-[3.5rem] font-black tracking-tighter text-primary uppercase italic leading-none text-glow-primary">Support Archive</h2>
            <p className="text-[0.625rem] md:text-[0.875rem] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 leading-none">Institutional knowledge base & resource center.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neu-card-shadow border-none rounded-[2rem] bg-card shadow-xl hover:scale-105 transition-transform duration-500 ring-1 ring-border">
          <CardContent className="p-10 flex flex-col items-center text-center gap-5">
            <div className="p-5 bg-primary/5 rounded-2xl shadow-inner">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-primary text-sm uppercase tracking-tighter">Email Support</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">library-support@neu.edu.ph</p>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card-shadow border-none rounded-[2rem] bg-card shadow-xl hover:scale-105 transition-transform duration-500 ring-1 ring-border">
          <CardContent className="p-10 flex flex-col items-center text-center gap-5">
            <div className="p-5 bg-primary/5 rounded-2xl shadow-inner">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-primary text-sm uppercase tracking-tighter">Institutional Line</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">+63 (2) 8-123-4567</p>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card-shadow border-none rounded-[2rem] bg-card shadow-xl hover:scale-105 transition-transform duration-500 ring-1 ring-border">
          <CardContent className="p-10 flex flex-col items-center text-center gap-5">
            <div className="p-5 bg-primary/5 rounded-2xl shadow-inner">
              <Book className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-primary text-sm uppercase tracking-tighter">Audit PDF</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60 underline cursor-pointer">Download Guide</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none rounded-[2.5rem] bg-card overflow-hidden shadow-2xl ring-1 ring-border">
        <CardHeader className="bg-muted/30 p-10 border-b">
          <CardTitle className="text-2xl font-black italic text-primary flex items-center gap-5 uppercase tracking-tighter">
            <HelpCircle className="h-8 w-8 text-secondary" />
            Common Inquiries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b-2 border-muted/50 last:border-0 py-2">
                <AccordionTrigger className="text-left font-black text-primary hover:text-secondary transition-colors text-lg italic tracking-tight no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-medium leading-relaxed italic text-base pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
