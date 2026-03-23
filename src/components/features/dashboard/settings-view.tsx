"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  Palette, 
  Bell, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Save, 
  Loader2, 
  ArrowLeft,
  Moon,
  Sun
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SettingsViewProps {
  onBack?: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { profile, updateProfileData } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    theme: profile?.theme || 'light',
    pushNotifications: true,
    emailAlerts: true,
    biometricAccess: false,
    rfidTag: profile?.rfidTag || ''
  });

  const updateTheme = (newTheme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
    localStorage.setItem('institutional-theme', newTheme);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateProfileData({ 
      theme: settings.theme as 'light' | 'dark' | 'system', 
      rfidTag: settings.rfidTag 
    });
    setIsSaving(false);
    if (success) {
      toast({ title: "Settings Updated", description: "Institutional preferences saved." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-[2.5rem] animate-in fade-in duration-700 pb-[5rem]">
      {/* Institutional Settings Header */}
      <div className="flex flex-col gap-[1.5rem]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-[1.5rem]">
          <div className="space-y-[0.5rem]">
            <h2 className="text-[2rem] md:text-[3.5rem] font-black tracking-tighter text-primary uppercase italic leading-none text-glow-primary">Portal Settings</h2>
            <p className="text-[0.625rem] md:text-[0.875rem] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 leading-none">Configure your institutional experience.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="neu-card-shadow border-none rounded-[2rem] bg-card shadow-xl overflow-hidden">
          <CardHeader className="p-8 bg-muted/30 border-b">
            <CardTitle className="text-lg font-black text-primary flex items-center gap-3 uppercase italic">
              <Palette className="h-5 w-5 text-secondary" /> Visual Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interface Theme</Label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => updateTheme('light')}
                  className={cn(
                    "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                    settings.theme === 'light' ? "border-primary bg-primary/5 shadow-inner" : "border-muted bg-card hover:border-primary/20"
                  )}
                >
                  <Sun className={cn("h-6 w-6", settings.theme === 'light' ? "text-primary" : "text-muted-foreground")} />
                  <span className="font-black text-[10px] uppercase tracking-widest">Institutional</span>
                </button>
                <button 
                  onClick={() => updateTheme('dark')}
                  className={cn(
                    "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                    settings.theme === 'dark' ? "border-primary bg-primary/5 shadow-inner" : "border-muted bg-card hover:border-primary/20"
                  )}
                >
                  <Moon className={cn("h-6 w-6", settings.theme === 'dark' ? "text-primary" : "text-muted-foreground")} />
                  <span className="font-black text-[10px] uppercase tracking-widest">Night Mode</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card-shadow border-none rounded-[2rem] bg-card shadow-xl overflow-hidden">
          <CardHeader className="p-8 bg-muted/30 border-b">
            <CardTitle className="text-lg font-black text-primary flex items-center gap-3 uppercase italic">
              <Bell className="h-5 w-5 text-secondary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <div className="flex flex-col"><span className="font-bold text-xs uppercase tracking-tight">Push Alerts</span><span className="text-[9px] text-muted-foreground">Mobile log updates</span></div>
              </div>
              <Switch checked={settings.pushNotifications} onCheckedChange={(v) => setSettings({...settings, pushNotifications: v})} />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div className="flex flex-col"><span className="font-bold text-xs uppercase tracking-tight">Email Summaries</span><span className="text-[9px] text-muted-foreground">Weekly activity digest</span></div>
              </div>
              <Switch checked={settings.emailAlerts} onCheckedChange={(v) => setSettings({...settings, emailAlerts: v})} />
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card-shadow border-none rounded-[2rem] bg-card/60 shadow-xl overflow-hidden md:col-span-2 ring-1 ring-border">
          <CardHeader className="p-8 bg-muted/30 border-b">
            <CardTitle className="text-lg font-black text-primary flex items-center gap-3 uppercase italic">
              <ShieldCheck className="h-5 w-5 text-secondary" /> Identity Hardware
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-muted/20 rounded-2xl border shadow-inner gap-6 hover:bg-muted/30 transition-all">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-black text-foreground uppercase tracking-tight">RFID / Smart Card Link</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bind physical hardware to your digital identity.</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex-1 sm:w-64">
                   <Input 
                      placeholder="Awaiting terminal scan..." 
                      className="h-14 border-2 focus:ring-primary font-mono text-center sm:text-left font-bold rounded-xl bg-muted/20"
                      value={settings.rfidTag}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, rfidTag: e.target.value})}
                   />
                </div>
                <Button variant="outline" className="h-14 border-2 text-primary hover:bg-muted/10 font-black uppercase tracking-widest rounded-xl px-8 shadow-sm">
                   Pair
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-8">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="h-20 px-16 bg-primary text-white font-black text-xl rounded-[2rem] shadow-3xl gap-4 hover:scale-105 transition-all"
        >
          {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6 text-secondary" />}
          SYNCHRONIZE PREFERENCES
        </Button>
      </div>
    </div>
  );
}
