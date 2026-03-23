/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Minus, 
  Maximize2, 
  Bot, 
  User, 
  Loader2,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  Zap,
  Paperclip,
  Image as ImageIcon,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { askInstitutionalAI } from '../../app/actions';
import Image from 'next/image';

interface Message {
  role: 'user' | 'model';
  content: string;
  media?: { data: string; mimeType: string }[];
}

interface Attachment {
  file: File;
  preview: string;
  base64: string;
}

export function AIAssistant(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Greetings, Institutional Member. I am your AI Assistant. How may I facilitate your access to the Hub today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds 4MB institutional limit.`, variant: "destructive" });
        continue;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        const preview = URL.createObjectURL(file);
        setAttachments(prev => [...prev, { file, preview, base64 }]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newArr = [...prev];
      URL.revokeObjectURL(newArr[index].preview);
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const clearChat = () => {
    setMessages([{ role: 'model', content: "Chat session reset. How may I assist you further?" }]);
    setAttachments([]);
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMessage = input.trim() || (attachments.length > 0 ? "Analyzng attached files..." : "");
    const currentMedia = attachments.map(a => ({ data: a.base64, mimeType: a.file.type }));
    
    setInput('');
    setAttachments([]);
    setMessages(prev => [...prev, { role: 'user', content: userMessage, media: currentMedia }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: [{ text: m.content }]
      }));

      const response = await askInstitutionalAI({
        message: userMessage,
        history: history as any,
        context: {
          userName: profile?.displayName || 'Member',
          page: window.location.pathname
        },
        media: currentMedia
      });

      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error("AI Error:", error);
      toast({
        title: "Telemetry Sync Failed",
        description: "The AI subsystem is currently undergoing maintenance. Please try again shortly.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        aria-label="Open Institutional AI Assistant"
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-3xl bg-primary text-white hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-white/20"
      >
        <Sparkles className="h-8 w-8 text-secondary group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-2 -right-2 h-6 w-6 bg-secondary rounded-full animate-pulse border-2 border-primary" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 transition-all duration-500 ease-in-out h-[600px] w-[400px] max-w-[90vw]">
      <Card className="h-full flex flex-col shadow-3xl border-none rounded-[2.5rem] bg-card/95 backdrop-blur-md overflow-hidden ring-1 ring-border">
        <CardHeader className="bg-[#032e41] p-6 text-white flex flex-row items-center justify-between shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#032e41] via-[#032e41] to-[#046c64]/40 opacity-90" />
          <div className="absolute inset-0 bg-dot-pattern opacity-10" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-sm font-black italic uppercase tracking-tighter">Hub AI Assistant</CardTitle>
              <div className="flex items-center gap-1.5 opacity-60">
                 <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Active Core</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <Button variant="ghost" size="icon" title="Clear Chat" className="h-8 w-8 text-white hover:bg-white/10 rounded-full" onClick={clearChat}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Minimize AI Assistant" className="h-8 w-8 text-white hover:bg-white/10 rounded-full" onClick={() => setIsOpen(false)}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Close AI Assistant" className="h-8 w-8 text-white hover:bg-white/10 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-6 space-y-6" scrollHideDelay={200}>
              <div ref={scrollRef} className="space-y-6">
                {messages.map((m, i) => (
                  <div key={i} className="space-y-2">
                    <div className={cn(
                      "flex gap-4 max-w-[85%]",
                      m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}>
                      <Avatar className={cn(
                        "h-8 w-8 shrink-0 border-2",
                        m.role === 'user' ? "border-primary/20" : "border-secondary/20"
                      )}>
                        {m.role === 'model' ? (
                          <>
                            <AvatarImage src="/ai-avatar.png" />
                            <AvatarFallback className="bg-primary/5 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src={profile?.photoURL} />
                            <AvatarFallback className="bg-secondary/5 text-secondary font-bold text-[10px]">{profile?.displayName?.[0] || 'U'}</AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      
                      <div className={cn(
                        "p-4 rounded-[1.5rem] text-[13px] leading-relaxed shadow-sm",
                        m.role === 'model' 
                          ? "bg-muted/50 text-foreground rounded-tl-none italic" 
                          : "bg-primary text-white rounded-tr-none font-medium"
                      )}>
                        {m.content}
                      </div>
                    </div>
                    {m.media && m.media.length > 0 && (
                      <div className={cn("flex flex-wrap gap-2 px-12", m.role === 'user' ? "justify-end" : "justify-start")}>
                         {m.media.map((med, idx) => (
                           <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border shadow-sm">
                             {med.mimeType.startsWith('image/') ? (
                               <img src={`data:${med.mimeType};base64,${med.data}`} alt="Attached" className="object-cover h-full w-full" />
                             ) : (
                               <div className="h-full w-full bg-muted flex items-center justify-center">
                                 <Paperclip className="h-5 w-5 text-muted-foreground" />
                               </div>
                             )}
                           </div>
                         ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 max-w-[85%] animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="h-10 w-48 rounded-[1.5rem] bg-muted/30" />
                  </div>
                )}
              </div>
            </ScrollArea>

            <CardFooter className="p-4 bg-muted/30 border-t shrink-0 flex flex-col gap-3">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 w-full pb-2">
                   {attachments.map((a, i) => (
                      <div key={i} className="relative h-12 w-12 rounded-lg border bg-card shadow-sm group">
                        {a.file.type.startsWith('image/') ? (
                          <img src={a.preview} alt="Preview" className="object-cover h-full w-full rounded-lg" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                             <Paperclip className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <button 
                          onClick={() => removeAttachment(i)}
                          aria-label="Remove attachment"
                          className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-2 w-2" />
                        </button>
                     </div>
                   ))}
                </div>
              )}
              
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative w-full flex items-center gap-2"
              >
                <div className="relative flex-1">
                   <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                   <Input 
                    id="hub-ai-input"
                    name="ai-message"
                    aria-label="Institutional AI Query Input"
                    placeholder="Ask about library, access, or Hub analytics..." 
                    className="h-12 rounded-[1.25rem] border-2 bg-background pl-10 pr-12 text-[12px] font-bold italic focus-visible:ring-primary shadow-inner"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      aria-label="Upload files"
                      onChange={handleFileSelect} 
                      multiple 
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  aria-label="Send message to AI assistant"
                  disabled={isLoading || (!input.trim() && attachments.length === 0)}
                  className="h-12 w-12 rounded-[1.25rem] bg-primary text-white shadow-xl hover:scale-105 active:scale-95 transition-all p-0 flex items-center justify-center border-b-4 border-primary/20"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 text-secondary" />}
                </Button>
              </form>
            </CardFooter>
      </Card>
    </div>
  );
}
