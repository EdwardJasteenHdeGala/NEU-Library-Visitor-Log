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
  updateProfileData: (data: Partial<UserProfile>) => Promise<boolean>;
  switchRole: (newRole: 'user' | 'admin') => Promise<void>;
  setUserRole: (userId: string, newRole: 'user' | 'admin' | 'guest') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authorized administrators with high-level access
export const SUPER_ADMIN_EMAIL = 'edwardjasteen.degala@neu.edu.ph';
const AUTHORIZED_ADMIN_EMAILS = [
  SUPER_ADMIN_EMAIL,
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
  }, [user, isUserLoading, auth]);

  const fetchOrCreateProfile = async (uid: string) => {
    if (!user || !firestore) return;
    try {
      const docRef = doc(firestore, 'user_profiles', uid);
      const docSnap = await getDoc(docRef);
      
      const isInstitutional = user.email && user.email.endsWith('@neu.edu.ph');
      const isAuthorized = user.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email);
      
      // CICS Department identification
      const isCICS = user.email === SUPER_ADMIN_EMAIL || user.email === 'jcesperanza@neu.edu.ph';
      
      const defaultCollege = isInstitutional 
        ? (isCICS ? 'CICS' : 'General Education') 
        : 'External (Guest)';
      
      const defaultRole = isInstitutional ? 'user' : 'guest';

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        let needsUpdate = false;
        const updates: any = {};

        if (user.photoURL && data.photoURL !== user.photoURL) {
          updates.photoURL = user.photoURL;
          needsUpdate = true;
        }

        if (isAuthorized && !data.isAuthorizedAdmin) {
          updates.isAuthorizedAdmin = true;
          needsUpdate = true;
        }

        if (isCICS && data.college !== 'CICS') {
          updates.college = 'CICS';
          needsUpdate = true;
        }

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
        const initialRole = (isAuthorized && intendedRole === 'admin') ? 'admin' : defaultRole;
        
        const profileData = {
          id: user.uid,
          email: user.email!,
          studentId: isInstitutional ? 'PENDING-ID' : 'GUEST-ID',
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
      provider.setCustomParameters({ prompt: 'select_account' });
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
    return updateProfileData({ studentId });
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !firestore || !profile) return false;
    
    try {
      const docRef = doc(firestore, 'user_profiles', user.uid);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, ...data });
      return true;
    } catch (error: any) {
        toast({
            title: "Update Error",
            description: "Failed to update profile information.",
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

  const setUserRole = async (userId: string, newRole: 'user' | 'admin' | 'guest') => {
    if (!profile?.isAuthorizedAdmin || !firestore) return;

    try {
      const docRef = doc(firestore, 'user_profiles', userId);
      await updateDoc(docRef, {
        role: newRole,
        isAuthorizedAdmin: newRole === 'admin',
        updatedAt: serverTimestamp()
      });
      toast({
        title: "User Role Updated",
        description: `User has been successfully updated to: ${newRole.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: "Failed to update user role.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading: loading || isUserLoading, login, logout, verifyStudentId, updateProfileData, switchRole, setUserRole }}>
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
