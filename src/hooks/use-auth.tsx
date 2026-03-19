
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  serverTimestamp, 
  collection,
  setDoc
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
  isBlocked?: boolean;
  blockedReason?: string;
  displayName: string;
  photoURL?: string;
  college?: string;
  department?: string;
  designation: 'student' | 'professor' | 'staff' | 'guest';
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

// TEST ACCOUNTS & AUTHORIZED ADMINS
export const BOOTSTRAP_SUPER_ADMIN_EMAIL = 'edwardjasteen.degala@neu.edu.ph';
const AUTHORIZED_ADMIN_EMAILS = [
  BOOTSTRAP_SUPER_ADMIN_EMAIL,
  'jcesperanza@neu.edu.ph',
  'nhica.valderas@neu.edu.ph'
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
        await fetchOrCreateProfile(user.uid);
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    checkProfile();
  }, [user, isUserLoading]);

  const fetchOrCreateProfile = async (uid: string) => {
    if (!user || !firestore) return;
    try {
      const docRef = doc(firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      const userEmail = user.email?.toLowerCase() || '';
      const isInstitutional = userEmail.endsWith('@neu.edu.ph');
      const isAuthorized = AUTHORIZED_ADMIN_EMAILS.includes(userEmail);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);

        // Ensure Admin Marker exists if authorized
        if (isAuthorized) {
          const adminMarkerRef = doc(firestore, 'roles_admin', uid);
          setDocumentNonBlocking(adminMarkerRef, { active: true }, { merge: true });
        }
      } else {
        // Create new profile based on domain logic
        const defaultRole = isAuthorized ? 'admin' : (isInstitutional ? 'user' : 'guest');
        const defaultDesignation = isInstitutional ? 'student' : 'guest';
        const defaultDepartment = isInstitutional ? 'General Education' : 'External';

        const profileData = {
          id: user.uid,
          email: userEmail,
          studentId: isInstitutional ? 'PENDING-ID' : 'GUEST-ID',
          role: defaultRole, 
          isAuthorizedAdmin: isAuthorized,
          isSuperAdmin: userEmail === BOOTSTRAP_SUPER_ADMIN_EMAIL,
          displayName: user.displayName || 'Visitor',
          photoURL: user.photoURL || '',
          department: defaultDepartment,
          college: defaultDepartment, // Keep both for backward compatibility
          designation: defaultDesignation,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          theme: 'light'
        };
        
        setDocumentNonBlocking(docRef, profileData, { merge: true });
        
        // If admin, create marker
        if (isAuthorized) {
          const adminMarkerRef = doc(firestore, 'roles_admin', uid);
          setDocumentNonBlocking(adminMarkerRef, { active: true }, { merge: true });
        }

        setProfile(profileData as any);
      }
    } catch (error) {
      console.error("Institutional Identity Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ 
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({
        title: "Synchronization Failed",
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
        title: "Protocol Switched",
        description: `Active role updated to ${newRole.toUpperCase()}.`,
      });
    } catch (error: any) {}
  };

  const setUserRole = async (userId: string, newRole: 'user' | 'admin' | 'guest') => {
    if (!profile?.isAuthorizedAdmin || !firestore) return;
    try {
      const docRef = doc(firestore, 'users', userId);
      updateDocumentNonBlocking(docRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      
      // Update admin marker accordingly
      const adminMarkerRef = doc(firestore, 'roles_admin', userId);
      if (newRole === 'admin') {
        setDocumentNonBlocking(adminMarkerRef, { active: true }, { merge: true });
      }
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
      loading, 
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
