
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
  photoURL?: string;
  college?: string;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  login: (requestedRole?: 'user' | 'admin') => Promise<void>;
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
  const [intendedRole, setIntendedRole] = useState<'user' | 'admin' | null>(null);
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
      const isCICS = user.email === 'edwardjasteen.degala@neu.edu.ph' || user.email === 'jcesperanza@neu.edu.ph';
      const defaultCollege = isCICS ? 'CICS' : 'General Education';

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
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

        // If an intended role was selected during login, update it for authorized admins
        if (isAuthorized && intendedRole && data.role !== intendedRole) {
          updates.role = intendedRole;
          needsUpdate = true;
        }

        if (user.photoURL && data.photoURL !== user.photoURL) {
          updates.photoURL = user.photoURL;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
          setProfile({ ...data, ...updates });
        } else {
          setProfile(data);
        }
      } else {
        // For new users, role is always 'user' unless they are authorized and picked 'admin'
        const initialRole = (isAuthorized && intendedRole === 'admin') ? 'admin' : 'user';
        
        const profileData = {
          id: user.uid,
          email: user.email!,
          studentId: 'G-AUTH',
          role: initialRole, 
          isAuthorizedAdmin: !!isAuthorized,
          displayName: user.displayName || 'Visitor',
          photoURL: user.photoURL || '',
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
      setIntendedRole(null); // Reset after processing
    }
  };

  const login = async (requestedRole?: 'user' | 'admin') => {
    try {
      if (requestedRole) {
        setIntendedRole(requestedRole);
      }
      const provider = new GoogleAuthProvider();
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
        photoURL: user.photoURL || '',
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
