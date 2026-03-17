
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Fingerprint, Loader2 } from "lucide-react";

export function VerifyStudentId() {
  const [studentId, setStudentId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyStudentId } = useAuth();
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setIsVerifying(true);
    const success = await verifyStudentId(studentId);
    setIsVerifying(false);

    if (success) {
      toast({
        title: "Link Successful",
        description: "Your account is now linked to your Student ID.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl border-accent/20">
        <CardHeader className="text-center">
            <div className="mx-auto bg-accent/10 p-3 rounded-full w-fit mb-4">
                <Fingerprint className="h-10 w-10 text-accent" />
            </div>
          <CardTitle className="text-2xl font-bold">Verify Identity</CardTitle>
          <CardDescription>
            Please link your Student ID to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID Number</Label>
              <Input 
                id="studentId"
                placeholder="e.g. 24-13347-177" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)}
                className="h-12 text-lg text-center font-mono tracking-widest"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 gap-2" 
              disabled={isVerifying || !studentId.trim()}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
