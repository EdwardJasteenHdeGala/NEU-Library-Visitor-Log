"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, Loader2, Send, History, User, LayoutList, PenLine } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FeedbackView() {
  const { profile } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [rating, setRating] = useState("5");
  const [visitType, setVisitType] = useState("study");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = profile?.role === 'admin';

  // Admin Query: Load all feedback
  const feedbackQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'feedback'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: feedbackList, isLoading: isLoadingFeedback } = useCollection(feedbackQuery);

  const handleSubmit = async () => {
    if (!message.trim() || !profile || !firestore) {
      toast({
        title: "Incomplete Form",
        description: "Please share your message before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'feedback'), {
        userId: profile.id,
        userName: profile.displayName,
        userPhoto: profile.photoURL || '',
        rating: parseInt(rating),
        visitType,
        message: message.trim(),
        timestamp: serverTimestamp()
      });
      
      toast({
        title: "Feedback Received",
        description: "Thank you! Your input helps us improve the library hub.",
      });
      
      setMessage("");
      setRating("5");
      setVisitType("study");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not send feedback. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFeedbackList = () => (
    <div className="grid grid-cols-1 gap-6">
      {isLoadingFeedback ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-bold text-muted-foreground animate-pulse">Retrieving feedback logs...</p>
        </div>
      ) : feedbackList?.length === 0 ? (
        <Card className="p-20 flex flex-col items-center justify-center text-center gap-4 border-dashed border-2">
          <MessageSquare className="h-12 w-12 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground font-bold italic">No feedback has been recorded yet.</p>
        </Card>
      ) : (
        feedbackList?.map((item) => (
          <Card key={item.id} className="neu-card-shadow border-none overflow-hidden hover:scale-[1.01] transition-transform bg-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex md:flex-col items-center gap-4 md:w-48 shrink-0">
                  <Avatar className="h-16 w-16 border-2 border-primary/10">
                    <AvatarImage src={item.userPhoto} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div className="md:text-center">
                    <p className="font-black text-primary text-sm line-clamp-1">{item.userName}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {item.timestamp?.seconds ? format(item.timestamp.seconds * 1000, 'MMM dd, yyyy') : 'Recently'}
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < item.rating ? 'fill-secondary text-secondary' : 'text-muted'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-secondary/10 text-primary px-3 py-1 rounded-full border border-secondary/20">
                      {item.visitType}
                    </span>
                  </div>
                  <p className="text-lg font-medium text-primary/80 leading-relaxed italic">
                    "{item.message}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderFeedbackForm = () => (
    <Card className="neu-card-shadow border-none rounded-[2rem] overflow-hidden bg-white max-w-2xl mx-auto">
      <CardHeader className="bg-primary p-8 text-center text-white">
         <div className="flex justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setRating((i + 1).toString())}
                className="hover:scale-110 transition-transform"
              >
                <Star 
                  className={`h-10 w-10 ${i < parseInt(rating) ? 'fill-secondary text-secondary' : 'text-white/20'}`} 
                />
              </button>
            ))}
         </div>
         <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Rate our service</CardTitle>
      </CardHeader>
      <CardContent className="p-8 md:p-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Star className="h-3 w-3" /> Score
              </label>
              <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 font-bold focus:ring-primary shadow-inner">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="5" className="font-bold">5 - Excellent</SelectItem>
                      <SelectItem value="4" className="font-bold">4 - Good</SelectItem>
                      <SelectItem value="3" className="font-bold">3 - Average</SelectItem>
                      <SelectItem value="2" className="font-bold">2 - Poor</SelectItem>
                      <SelectItem value="1" className="font-bold">1 - Terrible</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 flex items-center gap-2">
                  <History className="h-3 w-3" /> Visit Type
              </label>
              <Select value={visitType} onValueChange={setVisitType}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 font-bold focus:ring-primary shadow-inner">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="study" className="font-bold">Studying</SelectItem>
                      <SelectItem value="research" className="font-bold">Research</SelectItem>
                      <SelectItem value="borrow" className="font-bold">Borrowing Books</SelectItem>
                      <SelectItem value="computer" className="font-bold">Computer Use</SelectItem>
                      <SelectItem value="facility" className="font-bold">Facility Use</SelectItem>
                      <SelectItem value="printing" className="font-bold">Printing/Scanning</SelectItem>
                  </SelectContent>
              </Select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 flex items-center gap-2">
              <MessageSquare className="h-3 w-3" /> Your Comments
          </label>
          <Textarea 
              placeholder="Share your experience or suggestions for improvement..." 
              className="min-h-[150px] text-lg p-6 rounded-3xl border-2 focus:ring-primary shadow-inner bg-muted/20"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !message.trim()}
          className="w-full h-16 md:h-20 bg-primary hover:bg-primary/95 text-white font-black text-xl md:text-2xl gap-3 neu-card-shadow rounded-2xl group overflow-hidden relative"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              TRANSMIT FEEDBACK
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  if (isAdmin) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-primary mb-2 italic uppercase">System Sentiments</h2>
            <p className="text-muted-foreground font-medium">Review institutional feedback or contribute your own experience.</p>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-muted p-1 rounded-2xl mb-8">
            <TabsTrigger value="list" className="rounded-xl font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:text-primary">
              <LayoutList className="h-4 w-4" />
              Feedback Board
            </TabsTrigger>
            <TabsTrigger value="form" className="rounded-xl font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:text-primary">
              <PenLine className="h-4 w-4" />
              Submit My Feedback
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="animate-in fade-in slide-in-from-left-4 duration-300">
            {renderFeedbackList()}
          </TabsContent>
          
          <TabsContent value="form" className="animate-in fade-in slide-in-from-right-4 duration-300">
            {renderFeedbackForm()}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-primary italic uppercase">How was your visit?</h2>
        <p className="text-muted-foreground font-medium italic">Your feedback helps us provide a better research environment.</p>
      </div>
      {renderFeedbackForm()}
      <div className="flex items-center justify-center gap-4 text-muted-foreground p-6">
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
               <Avatar className="h-full w-full">
                  <AvatarImage src={`https://picsum.photos/seed/${i + 10}/100/100`} />
               </Avatar>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest italic opacity-50">Join others in helping us improve.</p>
      </div>
    </div>
  );
}
