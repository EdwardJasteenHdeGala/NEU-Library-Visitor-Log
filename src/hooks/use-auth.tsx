
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  email: string;
  studentId: string;
  role: 'user' | 'admin';
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  verifyStudentId: (studentId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        if (!user.email?.endsWith('@neu.edu.ph')) {
            toast({
                title: "Invalid Domain",
                description: "Access is restricted to @neu.edu.ph accounts.",
                variant: "destructive"
            });
            await signOut(auth);
            setProfile(null);
            setLoading(false);
            return;
        }
        await fetchProfile(user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const fetchProfile = async (user: User) => {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfile(docSnap.data() as UserProfile);
    } else {
      setProfile(null);
    }
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const verifyStudentId = async (studentId: string) => {
    if (!user) return false;
    
    // In a real app, you might verify this against a master list.
    // Here we just save the ID for the first time or check if it matches.
    try {
      const profileData: UserProfile = {
        email: user.email!,
        studentId: studentId,
        role: user.email === 'edwardjasteen.degala@neu.edu.ph' ? 'admin' : 'user',
        displayName: user.displayName || 'Visitor'
      };
      
      await setDoc(doc(db, 'users', user.uid), profileData);
      setProfile(profileData);
      return true;
    } catch (error: any) {
        toast({
            title: "Verification Error",
            description: "Failed to link Student ID.",
            variant: "destructive"
        });
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, verifyStudentId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
