"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, Loader2, Send, History, User, LayoutList, PenLine } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
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

  const feedbackQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'feedback'), orderBy('timestamp', 'desc'));
  }, [firestore, isAdmin]);

  const { data: feedbackList, isLoading: isLoadingFeedback } = useCollection(feedbackQuery);

  const handleSubmit = () => {
    if (!message.trim() || !profile || !firestore) {
      toast({ title: "Incomplete Form", description: "Please share your message.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    // Non-blocking mutation
    addDocumentNonBlocking(collection(firestore, 'feedback'), {
      userId: profile.id,
      userName: profile.displayName,
      userPhoto: profile.photoURL || '',
      rating: parseInt(rating),
      visitType,
      message: message.trim(),
      timestamp: new Date()
    });
    
    setTimeout(() => {
      toast({ title: "Feedback Received", description: "Thank you for helping us improve." });
      setMessage("");
      setRating("5");
      setVisitType("study");
      setIsSubmitting(false);
    }, 600);
  };

  const renderFeedbackList = () => (
    <div className="grid grid-cols-1 gap-6">
      {isLoadingFeedback ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-bold text-muted-foreground animate-pulse">Retrieving feedback...</p>
        </div>
      ) : feedbackList?.length === 0 ? (
        <Card className="p-20 flex flex-col items-center justify-center text-center gap-4 border-dashed border-2">
          <MessageSquare className="h-12 w-12 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground font-bold italic">No feedback recorded.</p>
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
    <Card className="neu-card-shadow border-none rounded-[2.5rem] overflow-hidden bg-white max-w-2xl mx-auto">
      <CardHeader className="bg-primary p-10 text-center text-white">
         <div className="flex justify-center gap-3 mb-4">
            {[...Array(5)].map((_, i) => (
              <button key={i} onClick={() => setRating((i + 1).toString())} className="hover:scale-125 transition-transform duration-300">
                <Star className={`h-12 w-12 ${i < parseInt(rating) ? 'fill-secondary text-secondary' : 'text-white/20'}`} />
              </button>
            ))}
         </div>
         <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">Rate our hub</CardTitle>
      </CardHeader>
      <CardContent className="p-10 md:p-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 flex items-center gap-3">
                  <Star className="h-4 w-4" /> Score
              </label>
              <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger className="h-16 rounded-2xl border-2 font-black focus:ring-primary shadow-inner text-lg">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-3xl">
                      <SelectItem value="5" className="font-bold">5 - Excellent</SelectItem>
                      <SelectItem value="4" className="font-bold">4 - Good</SelectItem>
                      <SelectItem value="3" className="font-bold">3 - Average</SelectItem>
                      <SelectItem value="2" className="font-bold">2 - Poor</SelectItem>
                      <SelectItem value="1" className="font-bold">1 - Terrible</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 flex items-center gap-3">
                  <History className="h-4 w-4" /> Visit Type
              </label>
              <Select value={visitType} onValueChange={setVisitType}>
                  <SelectTrigger className="h-16 rounded-2xl border-2 font-black focus:ring-primary shadow-inner text-lg">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-3xl max-h-[300px]">
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

        <div className="space-y-4">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 flex items-center gap-3">
              <MessageSquare className="h-4 w-4" /> Your Comments
          </label>
          <Textarea 
              placeholder="Share your suggestions..." 
              className="min-h-[180px] text-xl p-8 rounded-[2rem] border-2 focus:ring-primary shadow-inner bg-muted/20"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !message.trim()}
          className="w-full h-20 bg-primary hover:bg-primary/95 text-white font-black text-2xl gap-4 neu-card-shadow rounded-[1.5rem] group relative overflow-hidden"
        >
          {isSubmitting ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <Send className="h-8 w-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              TRANSMIT FEEDBACK
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  if (isAdmin) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <div>
          <h2 className="text-4xl font-black text-primary mb-2 italic uppercase tracking-tighter">System Sentiments</h2>
          <p className="text-muted-foreground font-medium text-lg">Review and monitor institutional experience telemetry.</p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-16 bg-muted p-1.5 rounded-[1.5rem] mb-10">
            <TabsTrigger value="list" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-3 data-[state=active]:bg-white data-[state=active]:text-primary">
              <LayoutList className="h-5 w-5" />
              Feedback Board
            </TabsTrigger>
            <TabsTrigger value="form" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-3 data-[state=active]:bg-white data-[state=active]:text-primary">
              <PenLine className="h-5 w-5" />
              Submit My Feedback
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="animate-in slide-in-from-left-4 duration-500">
            {renderFeedbackList()}
          </TabsContent>
          
          <TabsContent value="form" className="animate-in slide-in-from-right-4 duration-500">
            {renderFeedbackForm()}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black text-primary italic uppercase tracking-tighter">Rate Your Visit</h2>
        <p className="text-xl text-muted-foreground font-medium opacity-80">Help us advance institutional research standards.</p>
      </div>
      {renderFeedbackForm()}
    </div>
  );
}