
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  limit
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
      
      // Role Inheritance from Invites
      let invitedRole: 'user' | 'admin' | null = null;
      try {
        const invitesRef = collection(firestore, 'invites');
        const q = query(invitesRef, where('email', '==', userEmail), where('status', '==', 'pending'), limit(1));
        const inviteSnap = await getDocs(q);
        if (!inviteSnap.empty) {
          const inviteData = inviteSnap.docs[0].data();
          invitedRole = inviteData.role;
          // Synchronize invite status
          updateDocumentNonBlocking(doc(firestore, 'invites', inviteSnap.docs[0].id), {
            status: 'accepted',
            updatedAt: serverTimestamp()
          });
        }
      } catch (e) {
        // Silent error if invites are unreachable
      }

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        const updatedProfile = { 
          ...data, 
          isAuthorizedAdmin: isAuthorized || data.isAuthorizedAdmin || invitedRole === 'admin',
          role: invitedRole || data.role,
          isSuperAdmin: userEmail === BOOTSTRAP_SUPER_ADMIN_EMAIL
        };
        setProfile(updatedProfile);
      } else {
        const defaultRole = invitedRole || (isAuthorized ? 'admin' : (isInstitutional ? 'user' : 'guest'));
        const defaultDesignation = isInstitutional ? 'student' : 'guest';
        const defaultDepartment = isInstitutional ? 'Pending Assignment' : 'External';

        const profileData: Partial<UserProfile> = {
          id: user.uid,
          email: userEmail,
          studentId: isInstitutional ? '' : 'GUEST-ID',
          role: defaultRole as any, 
          isAuthorizedAdmin: isAuthorized || invitedRole === 'admin',
          isSuperAdmin: userEmail === BOOTSTRAP_SUPER_ADMIN_EMAIL,
          displayName: user.displayName || 'Visitor',
          photoURL: user.photoURL || '',
          department: defaultDepartment,
          college: defaultDepartment,
          designation: defaultDesignation as any,
          profileCompleted: !isInstitutional, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          theme: 'light',
          isBlocked: false
        };
        
        setDocumentNonBlocking(docRef, profileData, { merge: true });
        setProfile(profileData as any);
      }
    } catch (error) {
      console.error("Identity Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (roleHint?: 'user' | 'guest') => {
    try {
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
          description: "Institutional synchronization was cancelled. Please try again to access the portal.",
        });
        return;
      }

      console.error("Authentication Gateway Error:", error);
      toast({
        title: "Synchronization Error",
        description: error.message || "The institutional identity hub is currently unreachable.",
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
