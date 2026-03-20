
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, Loader2, Send, History, User, LayoutList, PenLine, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, where, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeedbackViewProps {
  onBack?: () => void;
}

export function FeedbackView({ onBack }: FeedbackViewProps) {
  const { profile } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [rating, setRating] = useState("5");
  const [visitType, setVisitType] = useState("study");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const feedbackQuery = useMemoFirebase(() => {
    if (!profile?.id || !firestore) return null;
    // Admins see all, users see only their own
    if (isAdmin) {
      return query(collection(firestore, 'feedback'), orderBy('timestamp', 'desc'));
    }
    return query(
      collection(firestore, 'feedback'), 
      where('userId', '==', profile.id),
      orderBy('timestamp', 'desc')
    );
  }, [firestore, profile?.id, isAdmin]);

  const { data: feedbackList, isLoading: isLoadingFeedback } = useCollection(feedbackQuery);

  const handleSubmit = () => {
    if (!message.trim() || !profile || !firestore) {
      toast({ title: "Incomplete Form", description: "Message required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    addDocumentNonBlocking(collection(firestore, 'feedback'), {
      userId: profile.id,
      userName: profile.displayName,
      userPhoto: profile.photoURL || '',
      rating: parseInt(rating),
      visitType,
      message: message.trim(),
      timestamp: new Date(),
      isResolved: false
    });
    
    setTimeout(() => {
      toast({ title: "Feedback Received", description: "Audit trail updated." });
      setMessage("");
      setRating("5");
      setVisitType("study");
      setIsSubmitting(false);
    }, 600);
  };

  const handleResolve = async (item: any) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'feedback', item.id), { isResolved: true });
    
    addDocumentNonBlocking(collection(firestore, 'notifications'), {
      userId: item.userId,
      title: "Feedback Addressed",
      message: `Your institutional feedback regarding '${item.visitType}' has been reviewed and marked as resolved by administration.`,
      timestamp: new Date(),
      read: false,
      type: 'resolution'
    });
    
    toast({ title: "Resolution Logged", description: "The member has been notified of the resolution." });
  };

  const getSentiment = (ratingValue: number) => {
    if (ratingValue >= 4) return { label: 'POSITIVE', color: 'text-green-600 bg-green-50 border-green-200' };
    if (ratingValue === 3) return { label: 'NEUTRAL', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'CRITICAL', color: 'text-red-600 bg-red-50 border-red-200 animate-pulse' };
  };

  const renderFeedbackList = () => (
    <div className="grid grid-cols-1 gap-6">
      {isLoadingFeedback ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-bold text-muted-foreground animate-pulse">Retrieving telemetry...</p>
        </div>
      ) : feedbackList?.length === 0 ? (
        <Card className="p-20 flex flex-col items-center justify-center text-center gap-4 border-dashed border-2 rounded-[2rem] bg-white/40">
          <MessageSquare className="h-12 w-12 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground font-bold italic">No feedback telemetry recorded.</p>
        </Card>
      ) : (
        feedbackList?.map((item) => (
          <Card key={item.id} className="neu-card-shadow border-none overflow-hidden hover:scale-[1.01] transition-transform bg-white rounded-[2rem]">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex md:flex-col items-center gap-5 md:w-56 shrink-0">
                  <Avatar className="h-20 w-20 border-4 border-primary/10 shadow-xl">
                    <AvatarImage src={item.userPhoto} />
                    <AvatarFallback className="bg-primary/5 text-primary"><User className="h-8 w-8" /></AvatarFallback>
                  </Avatar>
                  <div className="md:text-center space-y-1">
                    <p className="font-black text-primary text-base italic line-clamp-1">{item.userName}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      {item.timestamp?.seconds ? format(item.timestamp.seconds * 1000, 'MMM dd, yyyy') : 'Recently'}
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 space-y-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < item.rating ? 'fill-secondary text-secondary' : 'text-muted/30'}`} />
                      ))}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] bg-secondary/10 text-primary px-5 py-1.5 rounded-full border border-secondary/20 shadow-sm">
                      {item.visitType}
                    </span>
                    <span className={cn("text-[9px] font-black uppercase tracking-[0.3em] px-5 py-1.5 rounded-full border shadow-sm", getSentiment(item.rating).color)}>
                      {getSentiment(item.rating).label}
                    </span>
                    {item.isResolved && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> RESOLVED
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-medium text-primary/80 leading-relaxed italic border-l-4 border-secondary/30 pl-6 py-2">
                    "{item.message}"
                  </p>
                  {isAdmin && !item.isResolved && (
                    <Button onClick={() => handleResolve(item)} variant="outline" size="sm" className="h-10 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest mt-4">
                      <CheckCircle2 className="h-4 w-4 text-green-600" /> Mark as Resolved & Notify
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderFeedbackForm = () => (
    <Card className="neu-card-shadow border-none rounded-[3rem] overflow-hidden bg-white max-w-2xl mx-auto shadow-2xl">
      <CardHeader className="bg-primary p-12 text-center text-white relative">
         <div className="absolute inset-0 bg-dot-pattern opacity-10" />
         <div className="flex justify-center gap-4 mb-6 relative z-10">
            {[...Array(5)].map((_, i) => (
              <button key={i} onClick={() => setRating((i + 1).toString())} className="hover:scale-125 transition-all duration-300 drop-shadow-xl">
                <Star className={`h-14 w-14 ${i < parseInt(rating) ? 'fill-secondary text-secondary' : 'text-white/20'}`} />
              </button>
            ))}
         </div>
         <CardTitle className="text-3xl font-black italic tracking-tighter uppercase relative z-10">Rate Your Experience</CardTitle>
      </CardHeader>
      <CardContent className="p-10 md:p-16 space-y-12 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-3 flex items-center gap-4">
                  <Star className="h-5 w-5 text-secondary" /> Institutional Score
              </label>
              <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger className="h-16 rounded-2xl border-2 font-black focus:ring-primary shadow-inner text-lg bg-muted/5">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-3xl">
                      <SelectItem value="5" className="font-bold">5 - Institutional Excellence</SelectItem>
                      <SelectItem value="4" className="font-bold">4 - High Compliance</SelectItem>
                      <SelectItem value="3" className="font-bold">3 - Standard Access</SelectItem>
                      <SelectItem value="2" className="font-bold">2 - Substandard</SelectItem>
                      <SelectItem value="1" className="font-bold">1 - Critical Failure</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-3 flex items-center gap-4">
                  <History className="h-5 w-5 text-secondary" /> Activity Type
              </label>
              <Select value={visitType} onValueChange={setVisitType}>
                  <SelectTrigger className="h-16 rounded-2xl border-2 font-black focus:ring-primary shadow-inner text-lg bg-muted/5">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-3xl max-h-[300px]">
                      <SelectItem value="study" className="font-bold italic">Knowledge Retrieval</SelectItem>
                      <SelectItem value="research" className="font-bold italic">Advanced Research</SelectItem>
                      <SelectItem value="borrow" className="font-bold italic">Media Borrowing</SelectItem>
                      <SelectItem value="computer" className="font-bold italic">Digital Workspace</SelectItem>
                      <SelectItem value="facility" className="font-bold italic">Facility Utilization</SelectItem>
                      <SelectItem value="printing" className="font-bold italic">Reprographic Service</SelectItem>
                  </SelectContent>
              </Select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-3 flex items-center gap-4">
              <MessageSquare className="h-5 w-5 text-secondary" /> Detailed Sentiment
          </label>
          <Textarea 
              placeholder="Provide constructive institutional feedback..." 
              className="min-h-[200px] text-xl p-10 rounded-[2.5rem] border-2 focus:ring-primary shadow-inner bg-muted/20 italic font-medium"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !message.trim()}
          className="w-full h-24 bg-primary hover:bg-primary/95 text-white font-black text-2xl gap-6 shadow-3xl rounded-[2rem] group relative overflow-hidden active:scale-[0.98] transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {isSubmitting ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <Send className="h-8 w-8 text-secondary group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
              TRANSMIT TELEMETRY
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {onBack && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2 -ml-2 text-primary/50 hover:text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-[0.2em] gap-2 rounded-xl h-8 px-4"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {isAdmin ? "Return to Dashboard" : "Return to Log Entry"}
        </Button>
      )}

      {isAdmin ? (
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl font-black text-primary mb-2 italic uppercase tracking-tighter">System Sentiments</h2>
            <p className="text-muted-foreground font-medium text-lg">Review and monitor institutional experience telemetry.</p>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-18 bg-muted/40 p-1.5 rounded-[2rem] mb-12 shadow-inner border border-muted/50">
              <TabsTrigger value="list" className="rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] gap-4 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all h-full">
                <LayoutList className="h-6 w-6" />
                Sentiment Board
              </TabsTrigger>
              <TabsTrigger value="form" className="rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] gap-4 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all h-full">
                <PenLine className="h-6 w-6" />
                Submit Feedback
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="animate-in slide-in-from-left-6 duration-700">
              {renderFeedbackList()}
            </TabsContent>
            
            <TabsContent value="form" className="animate-in slide-in-from-right-6 duration-700">
              {renderFeedbackForm()}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-primary italic uppercase tracking-tighter">Rate Your Visit</h2>
            <p className="text-xl text-muted-foreground font-medium opacity-80">Help us advance institutional standards.</p>
          </div>
          {renderFeedbackForm()}
        </div>
      )}
    </div>
  );
}
