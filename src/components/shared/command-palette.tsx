'use client';

import * as React from 'react';
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Settings, 
  Smile, 
  User,
  Search,
  Command,
  FileText,
  Users,
  ShieldCheck,
  Zap,
  BookOpen,
  LayoutDashboard,
  Bell,
  History,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Tools' | 'Administrative' | 'Recent';
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commands: CommandItem[] = [
    { id: 'dashboard', title: 'Operational Overview', category: 'Navigation', icon: LayoutDashboard, action: () => router.push('/') },
    { id: 'library', title: 'Institutional Library', category: 'Navigation', icon: BookOpen, action: () => router.push('/?view=library') },
    { id: 'visitor-log', title: 'Access Registry', category: 'Navigation', icon: Users, action: () => router.push('/?view=visitor-log') },
    { id: 'reports', title: 'Data Analytics', category: 'Navigation', icon: FileText, action: () => router.push('/?view=reports') },
    { id: 'diagnostics', title: 'System Heartbeat', category: 'Tools', icon: Activity, action: () => router.push('/?view=diagnostics') },
    { id: 'users', title: 'Identity Console', category: 'Administrative', icon: ShieldCheck, shortcut: 'A', action: () => router.push('/?view=users') },
    { id: 'feedback', title: 'Voice of Hub', category: 'Administrative', icon: Smile, action: () => router.push('/?view=feedback') },
    { id: 'notifications', title: 'Telemetry Alerts', category: 'Navigation', icon: Bell, action: () => router.push('/?view=notifications') },
    { id: 'audit', title: 'Historical Audit', category: 'Recent', icon: History, action: () => router.push('/?view=audit') },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const categories = Array.from(new Set(filteredCommands.map(c => c.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[650px] p-0 overflow-hidden border-none shadow-3xl bg-transparent mt-[10vh]">
        <div className="bg-card/95 backdrop-blur-xl rounded-[2rem] border border-border shadow-2xl overflow-hidden ring-1 ring-white/20">
          <div className="flex items-center border-b p-6 gap-4 bg-muted/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors relative z-10" />
            <Input 
              id="hub-command-search"
              name="command-search"
              aria-label="Search Institutional Navigation Nodes"
              placeholder="Query institutional nodes..." 
              className="border-none bg-transparent h-12 text-lg font-black italic focus-visible:ring-0 focus-visible:ring-offset-0 px-0 placeholder:text-muted-foreground/50 relative z-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border font-black text-[10px] text-muted-foreground shadow-sm relative z-10">
              <span className="opacity-40 tracking-tighter uppercase px-1">ESC</span>
            </div>
          </div>

          <div className="max-h-[450px] overflow-y-auto p-4 custom-scrollbar">
            {categories.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <Zap className="h-12 w-12 text-muted-foreground animate-pulse" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">Zero matching institutional nodes</p>
              </div>
            ) : (
              categories.map(category => (
                <div key={category} className="mb-6 last:mb-2">
                  <div className="px-4 mb-3 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 italic">{category}</h3>
                    <div className="h-[2px] flex-1 bg-muted/50 ml-4 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    {filteredCommands.filter(c => c.category === category).map(cmd => (
                      <button
                        key={cmd.id}
                        onClick={() => { cmd.action(); setOpen(false); }}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 hover:scale-[1.01] transition-all group border border-transparent hover:border-primary/10 text-left active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-sm ring-1 ring-border group-hover:ring-primary/20">
                            <cmd.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary/80 group-hover:text-primary italic transition-colors">{cmd.title}</p>
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter group-hover:text-muted-foreground transition-colors">Access Sector-01 Node</p>
                          </div>
                        </div>
                        {cmd.shortcut && (
                          <div className="flex items-center gap-1">
                             <span className="text-[8px] font-black text-muted-foreground opacity-30 px-1.5 py-0.5 border rounded-md group-hover:opacity-100 transition-opacity">CMD</span>
                             <span className="text-[10px] font-black text-primary/40 group-hover:text-primary transition-colors">{cmd.shortcut}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-muted/50 p-4 border-t flex items-center justify-between">
             <div className="flex items-center gap-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-secondary" /> Navigation Mode</div>
                <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Global Protocol</div>
             </div>
             <Command className="h-4 w-4 text-primary opacity-20" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
