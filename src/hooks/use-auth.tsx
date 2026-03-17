
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email: string;
  studentId: string;
  role: 'user' | 'admin';
  isAuthorizedAdmin: boolean;
  displayName: string;
  college?: string;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  verifyStudentId: (studentId: string) => Promise<boolean>;
  switchRole: (newRole: 'user' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * List of institutional emails authorized to access administrative features.
 */
const AUTHORIZED_ADMIN_EMAILS = [
  'edwardjasteen.degala@neu.edu.ph',
  'jcesperanza@neu.edu.ph'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading) return;

    const checkProfile = async () => {
      if (user) {
        if (user.email && !user.email.endsWith('@neu.edu.ph')) {
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
        await fetchOrCreateProfile(user.uid);
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    checkProfile();
  }, [user, isUserLoading, auth, toast]);

  const fetchOrCreateProfile = async (uid: string) => {
    if (!user || !firestore) return;
    try {
      const docRef = doc(firestore, 'user_profiles', uid);
      const docSnap = await getDoc(docRef);
      
      const isAuthorized = user.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email);
      // Both Edward and Prof. Esperanza are from CICS
      const isCICS = user.email === 'edwardjasteen.degala@neu.edu.ph' || user.email === 'jcesperanza@neu.edu.ph';
      const defaultCollege = isCICS ? 'CICS' : 'General Education';

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Check for required updates (authorization or special department)
        let needsUpdate = false;
        const updates: any = {};

        if (isAuthorized && !data.isAuthorizedAdmin) {
          updates.isAuthorizedAdmin = true;
          needsUpdate = true;
        }

        if (isCICS && data.college !== 'CICS') {
          updates.college = 'CICS';
          needsUpdate = true;
        }

        if (needsUpdate) {
          await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
          setProfile({ ...data, ...updates });
        } else {
          setProfile(data);
        }
      } else {
        // Create new profile for first-time sign-in
        const profileData = {
          id: user.uid,
          email: user.email!,
          studentId: 'G-AUTH',
          role: 'user' as const, 
          isAuthorizedAdmin: !!isAuthorized,
          displayName: user.displayName || 'Visitor',
          college: defaultCollege,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(docRef, profileData);
        setProfile(profileData as any);
      }
    } catch (error) {
      console.error("Error fetching/creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      /**
       * hd: 'neu.edu.ph' - Restricts the account picker to institutional accounts.
       * prompt: 'select_account' - Forces the Google account selector to appear every time,
       * preventing the browser from automatically logging into the previous session.
       */
      provider.setCustomParameters({ 
        hd: 'neu.edu.ph',
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
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
    if (!user || !firestore) return false;
    
    // Check if the student ID matches the test account requirement
    const isTestId = studentId === '24-13347-177';
    const isAuthorized = user.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email);
    const isCICS = user.email === 'edwardjasteen.degala@neu.edu.ph' || user.email === 'jcesperanza@neu.edu.ph';
    const defaultCollege = isCICS ? 'CICS' : 'General Education';

    try {
      const profileData = {
        id: user.uid,
        email: user.email!,
        studentId: studentId,
        role: 'user' as const, 
        isAuthorizedAdmin: !!(isAuthorized || isTestId),
        displayName: user.displayName || 'Visitor',
        college: defaultCollege,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(firestore, 'user_profiles', user.uid), profileData);
      setProfile(profileData as any);
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

  const switchRole = async (newRole: 'user' | 'admin') => {
    if (!profile || !profile.isAuthorizedAdmin) {
      toast({
        title: "Access Denied",
        description: "You are not authorized for administrative access.",
        variant: "destructive"
      });
      return;
    }

    try {
      const docRef = doc(firestore, 'user_profiles', profile.id);
      await updateDoc(docRef, { 
        role: newRole,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, role: newRole });
      toast({
        title: "Role Updated",
        description: `Your active role is now: ${newRole.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: "Failed to switch access role.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading: loading || isUserLoading, login, logout, verifyStudentId, switchRole }}>
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
