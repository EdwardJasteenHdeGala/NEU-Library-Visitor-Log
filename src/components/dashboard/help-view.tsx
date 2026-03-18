
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
      q: "How do I log a visit?",
      a: "Select your purpose from the dropdown on the home screen and click 'Confirm Attendance'."
    },
    {
      q: "Can I use my personal Google account?",
      a: "Yes, but institutional synchronization works best with @neu.edu.ph accounts."
    },
    {
      q: "I lost my ID, what should I do?",
      a: "Report it to the Registrar. You can still log in via Google to maintain your audit trail."
    },
    {
      q: "How do I provide feedback?",
      a: "Navigate to the 'Sentiments' or 'Feedback' tab in your respective portal menu."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {onBack && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2 -ml-2 text-primary/50 hover:text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-[0.2em] gap-2 rounded-xl h-8 px-4"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Hub
        </Button>
      )}

      <div>
        <h2 className="text-4xl font-black text-primary mb-2 italic uppercase tracking-tighter">Help & Support</h2>
        <p className="text-muted-foreground font-medium text-lg">Find answers to common institutional questions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neu-card-shadow border-none rounded-[2rem] bg-white shadow-xl hover:scale-105 transition-transform duration-500">
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
        <Card className="neu-card-shadow border-none rounded-[2rem] bg-white shadow-xl hover:scale-105 transition-transform duration-500">
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
        <Card className="neu-card-shadow border-none rounded-[2rem] bg-white shadow-xl hover:scale-105 transition-transform duration-500">
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

      <Card className="neu-card-shadow border-none rounded-[2.5rem] bg-white overflow-hidden shadow-2xl">
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
