
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { 
  useFirebase, 
  useUser, 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking,
} from '@/firebase';
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
  profileCompleted: boolean;
  createdAt: any;
  updatedAt: any;
  theme?: 'light' | 'dark';
  rfidTag?: string;
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  login: (roleHint?: 'user' | 'guest') => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<boolean>;
  switchRole: (newRole: 'user' | 'admin') => Promise<void>;
  setUserRole: (userId: string, newRole: 'user' | 'admin' | 'guest') => Promise<void>;
  resignAdmin: () => Promise<void>;
  blockUser: (userId: string, reason: string, details: string, duration: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  sendWarning: (userId: string, title: string, message: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const BOOTSTRAP_SUPER_ADMIN_EMAIL = 'edwardjasteen.degala@neu.edu.ph';
const AUTHORIZED_ADMIN_EMAILS = [
  BOOTSTRAP_SUPER_ADMIN_EMAIL,
  'jcesperanza@neu.edu.ph',
  'nhica.valderas@neu.edu.ph'
];

/**
 * AuthProvider manages the institutional identity synchronization logic.
 * Enforces session-only persistence to disable auto-login.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading) return;

    let unsubscribe = () => {};

    const checkProfile = async () => {
      if (user) {
        const unsub = await fetchOrCreateProfile(user.uid);
        if (unsub) unsubscribe = unsub;
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    checkProfile();

    return () => unsubscribe();
  }, [user, isUserLoading]);

  const fetchOrCreateProfile = async (uid: string) => {
    if (!user || !firestore) return undefined;
    try {
      const docRef = doc(firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      const userEmail = user.email?.toLowerCase() || '';
      const isInstitutional = userEmail.endsWith('@neu.edu.ph');
      const isWhitelisted = AUTHORIZED_ADMIN_EMAILS.includes(userEmail);

      // Check for pending pre-authorized invites
      let inheritedRole: 'user' | 'admin' | 'guest' | null = null;
      try {
        const inviteQuery = query(collection(firestore, 'invites'), where('email', '==', userEmail));
        const inviteSnap = await getDocs(inviteQuery);
        if (!inviteSnap.empty) {
          inheritedRole = inviteSnap.docs[0].data().role;
        }
      } catch (e) {
        console.warn("Invite registry scan deferred.");
      }

      const processProfileData = (data: Partial<UserProfile>) => {
        const updatedProfile = { 
          ...data, 
          isAuthorizedAdmin: isWhitelisted || data.isAuthorizedAdmin || inheritedRole === 'admin',
          isSuperAdmin: userEmail === BOOTSTRAP_SUPER_ADMIN_EMAIL
        } as UserProfile;
        setProfile(updatedProfile);
      };

      if (!docSnap.exists()) {
        const defaultRole = isWhitelisted ? 'admin' : (inheritedRole || (isInstitutional ? 'user' : 'guest'));
        const defaultDesignation = isInstitutional ? 'student' : 'guest';
        const defaultUnit = isInstitutional ? 'Pending Assignment' : 'External';

        const profileData: Partial<UserProfile> = {
          id: user.uid,
          email: userEmail,
          studentId: isInstitutional ? '' : 'GUEST-ID',
          role: defaultRole as any, 
          isAuthorizedAdmin: isWhitelisted || inheritedRole === 'admin',
          isSuperAdmin: userEmail === BOOTSTRAP_SUPER_ADMIN_EMAIL,
          displayName: user.displayName || 'Visitor',
          photoURL: user.photoURL || '',
          department: defaultUnit,
          college: defaultUnit,
          designation: defaultDesignation as any,
          profileCompleted: !isInstitutional, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          theme: 'light',
          isBlocked: false
        };
        
        setDocumentNonBlocking(docRef, profileData, { merge: true });
        processProfileData(profileData);
      }

      const unsubscribe = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          processProfileData(snap.data() as UserProfile);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error("Identity Sync Error:", error);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const login = async (roleHint?: 'user' | 'guest') => {
    try {
      // Institutional Protocol: Disable auto-login by enforcing session persistence
      await setPersistence(auth, browserLocalPersistence);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ 
        prompt: 'select_account'
      });
      if (roleHint === 'user') {
        provider.setCustomParameters({ hd: 'neu.edu.ph' });
      }
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: "Identity Sync Deferred",
          description: "Institutional synchronization was cancelled.",
        });
        return;
      }
      toast({
        title: "Synchronization Error",
        description: error.message || "Identity hub unreachable.",
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
        description: `Now operating as ${newRole.toUpperCase()}.`,
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
      toast({ title: "Role Updated", description: "Identity registry synchronized." });
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

  const blockUser = async (userId: string, reason: string, details: string, duration: string) => {
    if (!profile?.isAuthorizedAdmin || !firestore) return;
    try {
      const userRef = doc(firestore, 'users', userId);
      updateDocumentNonBlocking(userRef, {
        isBlocked: true,
        blockedReason: reason,
        updatedAt: serverTimestamp()
      });
      toast({ title: "User Blocked", description: "Identity registry updated." });
    } catch (error: any) {}
  };

  const unblockUser = async (userId: string) => {
    if (!profile?.isAuthorizedAdmin || !firestore) return;
    try {
      const userRef = doc(firestore, 'users', userId);
      updateDocumentNonBlocking(userRef, {
        isBlocked: false,
        blockedReason: null,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Access Restored", description: "Member re-authorized." });
    } catch (error: any) {}
  };

  const sendWarning = async (userId: string, title: string, message: string) => {
    if (!profile?.isAuthorizedAdmin || !firestore) return;
    try {
      const notificationRef = doc(firestore, 'notifications', `warning-${userId}-${Date.now()}`);
      setDocumentNonBlocking(notificationRef, {
        userId,
        title,
        message,
        read: false,
        timestamp: serverTimestamp()
      }, { merge: true });
      toast({ title: "Warning Sent", description: "Alert logged in member registry." });
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
      resignAdmin,
      blockUser,
      unblockUser,
      sendWarning
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
