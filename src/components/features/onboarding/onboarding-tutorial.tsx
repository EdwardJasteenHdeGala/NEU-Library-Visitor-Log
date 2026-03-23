"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Info, 
  ShieldCheck, 
  GraduationCap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  content?: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: "Welcome to the Access Hub",
    description: "Your formal gateway to New Era University's library resources and visitor registry.",
    icon: <Info className="h-10 w-10 text-secondary" />,
    content: (
      <div className="space-y-4 py-4">
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 italic text-sm text-muted-foreground">
          &quot;Advancing scholarship through automated registry synchronization.&quot;
        </div>
        <p className="text-sm">This portal synchronizes your identity with the institutional audit registry in real-time.</p>
      </div>
    )
  },
  {
    title: "Identity Synchronization",
    description: "How we verify and secure your access to institutional facilities.",
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    content: (
      <div className="space-y-4 py-4">
        <ul className="space-y-3">
          <li className="flex gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
            <span>Institutional members use their Google accounts for instant verification.</span>
          </li>
          <li className="flex gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
            <span>Guests must provide basic identification for a temporary access pass.</span>
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "Navigating the Portal",
    description: "Quickly access resources, track your status, and manage your profile.",
    icon: <GraduationCap className="h-10 w-10 text-accent" />,
    content: (
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-xl text-xs font-bold text-center">Visitor Registry</div>
          <div className="p-3 bg-muted rounded-xl text-xs font-bold text-center">Audit Logs</div>
          <div className="p-3 bg-muted rounded-xl text-xs font-bold text-center">Profile Settings</div>
          <div className="p-3 bg-muted rounded-xl text-xs font-bold text-center">Help Desk</div>
        </div>
      </div>
    )
  },
  {
    title: "Ready to Begin?",
    description: "You are now synchronized with the NEU Access Hub architecture.",
    icon: <ArrowRight className="h-10 w-10 text-secondary animate-float" />,
    content: (
      <div className="py-8 text-center">
        <p className="text-lg font-bold italic text-primary">&quot;Enter with Purpose. Study with Excellence.&quot;</p>
      </div>
    )
  }
];

export function OnboardingTutorial() {
  const { profile, completeTutorial } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(profile?.tutorialCompleted === false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleComplete = async () => {
    await completeTutorial();
    setIsOpen(false);
  };

  const step = STEPS[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg rounded-[2.5rem] border-none shadow-3xl bg-card p-0 gap-0 overflow-hidden">
        <div className="absolute top-6 right-6 z-10">
          <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-6 rounded-3xl bg-muted/50 shadow-inner">
              {step.icon}
            </div>
            <div className="space-y-2">
               <DialogHeader>
                <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-primary">
                  {step.title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium italic">
                  {step.description}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="min-h-[160px]">
            {step.content}
          </div>

          <div className="flex items-center justify-center gap-2">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 transition-all duration-300 rounded-full",
                  currentStep === i ? "w-8 bg-secondary" : "w-1.5 bg-muted"
                )} 
              />
            ))}
          </div>
        </div>

        <DialogFooter className="bg-muted/30 p-8 flex sm:justify-between items-center gap-4">
          <div className="flex gap-2">
            <Button 
                variant="ghost" 
                onClick={handleSkip} 
                className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary rounded-xl"
            >
              Skip
            </Button>
            <Button 
                variant="ghost" 
                onClick={handleCancel} 
                className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive rounded-xl"
            >
              Cancel
            </Button>
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="rounded-xl font-bold uppercase text-[10px] tracking-widest px-6"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext}
              className="portal-button-primary rounded-xl font-bold uppercase text-[10px] tracking-widest px-8 shadow-secondary/20"
            >
              {currentStep === STEPS.length - 1 ? "Finish" : "Continue"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
