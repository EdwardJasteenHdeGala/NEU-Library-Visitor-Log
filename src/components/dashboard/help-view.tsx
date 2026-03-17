
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { HelpCircle, Mail, Phone, Book } from "lucide-react";

export function HelpView() {
  const faqs = [
    {
      q: "How do I log a visit?",
      a: "Once signed in, select your purpose of visit from the dropdown menu on the welcome screen and click 'Confirm Entry'."
    },
    {
      q: "Can I use my personal Google account?",
      a: "No, access is restricted to institutional accounts (@neu.edu.ph) for security and verification purposes."
    },
    {
      q: "I lost my School ID, what should I do?",
      a: "Please report lost IDs to the Registrar's Office immediately. You can still use your Google account to log in for library access."
    },
    {
      q: "How do I provide feedback?",
      a: "Navigate to the 'Feedback' tab in the menu to submit your ratings and comments about library services."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-primary mb-2">Help & Support</h2>
        <p className="text-muted-foreground font-medium">Find answers to common questions and contact support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neu-card-shadow border-none">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <p className="font-bold">Email Support</p>
            <p className="text-sm text-muted-foreground">library-support@neu.edu.ph</p>
          </CardContent>
        </Card>
        <Card className="neu-card-shadow border-none">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <p className="font-bold">Call Us</p>
            <p className="text-sm text-muted-foreground">+63 (2) 8-123-4567</p>
          </CardContent>
        </Card>
        <Card className="neu-card-shadow border-none">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <p className="font-bold">User Guide</p>
            <p className="text-sm text-muted-foreground">Download PDF Guide</p>
          </CardContent>
        </Card>
      </div>

      <Card className="neu-card-shadow border-none">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-bold">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
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
