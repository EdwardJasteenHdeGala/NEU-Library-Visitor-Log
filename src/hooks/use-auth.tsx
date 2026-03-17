
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
  role: 'guest' | 'user' | 'admin';
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
      
      const isInstitutional = user.email && user.email.endsWith('@neu.edu.ph');
      const isAuthorized = user.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email);
      const isCICS = user.email === 'edwardjasteen.degala@neu.edu.ph' || user.email === 'jcesperanza@neu.edu.ph';
      
      // Determine base status
      const defaultCollege = isInstitutional 
        ? (isCICS ? 'CICS' : 'General Education') 
        : 'External (Guest)';
      
      const defaultRole = isInstitutional ? 'user' : 'guest';

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        let needsUpdate = false;
        const updates: any = {};

        // Sync Google Photo
        if (user.photoURL && data.photoURL !== user.photoURL) {
          updates.photoURL = user.photoURL;
          needsUpdate = true;
        }

        // Admin authorization check
        if (isAuthorized && !data.isAuthorizedAdmin) {
          updates.isAuthorizedAdmin = true;
          needsUpdate = true;
        }

        // Department sync for CICS
        if (isCICS && data.college !== 'CICS') {
          updates.college = 'CICS';
          needsUpdate = true;
        }

        // Role switching for authorized admins
        if (isAuthorized && intendedRole && data.role !== intendedRole) {
          updates.role = intendedRole;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
          setProfile({ ...data, ...updates });
        } else {
          setProfile(data);
        }
      } else {
        // Create new profile
        const initialRole = (isAuthorized && intendedRole === 'admin') ? 'admin' : defaultRole;
        
        const profileData = {
          id: user.uid,
          email: user.email!,
          studentId: isInstitutional ? 'G-AUTH' : 'GUEST-USER',
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
      console.error("Error managing profile:", error);
    } finally {
      setLoading(false);
      setIntendedRole(null);
    }
  };

  const login = async (requestedRole?: 'user' | 'admin') => {
    try {
      if (requestedRole) {
        setIntendedRole(requestedRole);
      }
      const provider = new GoogleAuthProvider();
      // Only force select account, don't restrict domain at the provider level 
      // so Gmail users can sign in as guests.
      provider.setCustomParameters({ 
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
    if (!user || !firestore || !profile) return false;
    
    // Non-institutional users cannot verify a student ID
    if (!user.email?.endsWith('@neu.edu.ph')) {
      toast({
        title: "Restricted Action",
        description: "Only institutional accounts can link a Student ID.",
        variant: "destructive"
      });
      return false;
    }

    try {
      await updateDoc(doc(firestore, 'user_profiles', user.uid), {
        studentId: studentId,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, studentId });
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
