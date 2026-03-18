"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  serverTimestamp, 
} from 'firebase/firestore';
import { useFirebase, useUser, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email: string;
  studentId: string;
  role: 'guest' | 'user' | 'admin';
  isAuthorizedAdmin: boolean;
  isSuperAdmin?: boolean;
  displayName: string;
  photoURL?: string;
  college?: string;
  createdAt: any;
  updatedAt: any;
  theme?: 'light' | 'dark';
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  login: (requestedRole?: 'user' | 'admin' | 'guest') => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<boolean>;
  switchRole: (newRole: 'user' | 'admin') => Promise<void>;
  setUserRole: (userId: string, newRole: 'user' | 'admin' | 'guest') => Promise<void>;
  resignAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// INSTITUTIONAL SUPER ADMINS
export const BOOTSTRAP_SUPER_ADMIN_EMAIL = 'edwardjasteen.degala@neu.edu.ph';
const AUTHORIZED_ADMIN_EMAILS = [
  BOOTSTRAP_SUPER_ADMIN_EMAIL,
  'jcesperanza@neu.edu.ph'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [intendedRole, setIntendedRole] = useState<'user' | 'admin' | 'guest' | null>(null);
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
      const docRef = doc(firestore, 'users', uid);
      let docSnap = await getDoc(docRef);
      
      const userEmail = user.email?.toLowerCase();
      const isInstitutional = userEmail && userEmail.endsWith('@neu.edu.ph');
      const isBootstrapAdmin = userEmail === BOOTSTRAP_SUPER_ADMIN_EMAIL;
      const isAuthorized = userEmail && AUTHORIZED_ADMIN_EMAILS.includes(userEmail);
      
      const defaultCollege = isInstitutional ? 'General Education' : 'External / Guest';
      const defaultRole = isInstitutional ? 'user' : 'guest';

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        let needsUpdate = false;
        const updates: any = {};

        if (user.photoURL && data.photoURL !== user.photoURL) {
          updates.photoURL = user.photoURL;
          needsUpdate = true;
        }

        // FORCE SUPER ADMIN / ADMIN PRIVILEGES
        if ((isAuthorized || isBootstrapAdmin) && (!data.isAuthorizedAdmin || (isBootstrapAdmin && !data.isSuperAdmin))) {
          updates.isAuthorizedAdmin = true;
          updates.isSuperAdmin = isBootstrapAdmin;
          // Ensure they are actually in the admin role for the UI
          if (data.role !== 'admin') updates.role = 'admin';
          needsUpdate = true;
        }

        if (needsUpdate) {
          updateDocumentNonBlocking(docRef, { ...updates, updatedAt: serverTimestamp() });
          setProfile({ ...data, ...updates });
        } else {
          setProfile(data);
        }
      } else {
        // Enforce domain restriction for Google login if not Guest
        if (intendedRole !== 'guest' && !isInstitutional) {
          toast({
            title: "Access Denied",
            description: "Institutional login requires an @neu.edu.ph account.",
            variant: "destructive"
          });
          await signOut(auth);
          return;
        }

        const initialRole = (isAuthorized || isBootstrapAdmin) ? 'admin' : (intendedRole === 'guest' ? 'guest' : defaultRole);
        
        const profileData = {
          id: user.uid,
          email: userEmail,
          studentId: isInstitutional ? 'PENDING-ID' : 'GUEST-ID',
          role: initialRole, 
          isAuthorizedAdmin: !!isAuthorized || isBootstrapAdmin,
          isSuperAdmin: isBootstrapAdmin,
          displayName: user.displayName || 'Visitor',
          photoURL: user.photoURL || '',
          college: defaultCollege,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          theme: 'light'
        };
        
        setDocumentNonBlocking(docRef, profileData, { merge: true });
        setProfile(profileData as any);
      }
    } catch (error) {
      console.error("Profile Sync Error:", error);
    } finally {
      setLoading(false);
      setIntendedRole(null);
    }
  };

  const login = async (requestedRole?: 'user' | 'admin' | 'guest') => {
    try {
      if (requestedRole) {
        setIntendedRole(requestedRole);
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !firestore || !profile) return false;
    try {
      const docRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, ...data });
      return true;
    } catch (error: any) {
        return false;
    }
  };

  const switchRole = async (newRole: 'user' | 'admin') => {
    if (!profile || !profile.isAuthorizedAdmin) return;
    try {
      const docRef = doc(firestore, 'users', profile.id);
      updateDocumentNonBlocking(docRef, { 
        role: newRole,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, role: newRole });
      toast({
        title: "Role Switched",
        description: `Your active role is now ${newRole.toUpperCase()}.`,
      });
    } catch (error: any) {}
  };

  const setUserRole = async (userId: string, newRole: 'user' | 'admin' | 'guest') => {
    if (!profile?.isAuthorizedAdmin || !firestore) return;
    try {
      const docRef = doc(firestore, 'users', userId);
      updateDocumentNonBlocking(docRef, {
        role: newRole,
        isAuthorizedAdmin: newRole === 'admin',
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {}
  };

  const resignAdmin = async () => {
    if (!profile || !profile.isAuthorizedAdmin || profile.isSuperAdmin) return;
    try {
      const docRef = doc(firestore, 'users', profile.id);
      updateDocumentNonBlocking(docRef, {
        role: 'user',
        isAuthorizedAdmin: false,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, role: 'user', isAuthorizedAdmin: false });
    } catch (error: any) {}
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading: loading || isUserLoading, 
      login, 
      logout, 
      updateProfileData, 
      switchRole, 
      setUserRole,
      resignAdmin
    }}>
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