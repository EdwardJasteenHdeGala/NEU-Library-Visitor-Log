"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  serverTimestamp, 
  writeBatch, 
  query, 
  collection, 
  where, 
  getDocs, 
  limit
} from 'firebase/firestore';
import { useFirebase, useUser, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
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
  transferSuperAdmin: (targetUserId: string) => Promise<void>;
  resignAdmin: () => Promise<void>;
  addUserByEmail: (email: string, role: 'user' | 'admin' | 'guest', college: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      let docSnap = await getDoc(docRef);
      
      // 1. CLAIMING MECHANISM: Check if this email was pre-authorized (Invited)
      if (!docSnap.exists() && user.email) {
        const q = query(collection(firestore, 'user_profiles'), where('email', '==', user.email.toLowerCase()), limit(1));
        const qSnap = await getDocs(q);
        
        const pendingDoc = qSnap.docs.find(d => !d.data().id || d.data().displayName === 'New User (Pending)');
        
        if (pendingDoc) {
          const preData = pendingDoc.data() as UserProfile;
          const migratedData = {
            ...preData,
            id: user.uid,
            displayName: user.displayName || 'Visitor',
            photoURL: user.photoURL || '',
            updatedAt: serverTimestamp()
          };
          
          // Non-blocking write
          setDocumentNonBlocking(docRef, migratedData, { merge: true });
          deleteDocumentNonBlocking(pendingDoc.ref);
          
          setProfile(migratedData as any);
          setLoading(false);
          toast({
            title: "Access Synchronized",
            description: "Your pre-authorized role and department have been activated.",
          });
          return;
        }
      }

      const isInstitutional = user.email && user.email.endsWith('@neu.edu.ph');
      const isBootstrapAdmin = user.email === BOOTSTRAP_SUPER_ADMIN_EMAIL;
      const isAuthorized = user.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email);
      const isProfessorEsperanza = user.email === 'jcesperanza@neu.edu.ph';
      
      const defaultCollege = isInstitutional 
        ? (isProfessorEsperanza || isBootstrapAdmin ? 'CICS' : 'General Education') 
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

        if (isBootstrapAdmin && !data.isSuperAdmin) {
          updates.isSuperAdmin = true;
          updates.isAuthorizedAdmin = true;
          updates.role = 'admin';
          needsUpdate = true;
        }

        if (isAuthorized && !data.isAuthorizedAdmin && !isBootstrapAdmin) {
          updates.isAuthorizedAdmin = true;
          needsUpdate = true;
        }

        if (isAuthorized && intendedRole && data.role !== intendedRole) {
          updates.role = intendedRole;
          needsUpdate = true;
        }

        if (needsUpdate) {
          updateDocumentNonBlocking(docRef, { ...updates, updatedAt: serverTimestamp() });
          setProfile({ ...data, ...updates });
        } else {
          setProfile(data);
        }
      } else {
        const initialRole = (isAuthorized && intendedRole === 'admin') || isBootstrapAdmin ? 'admin' : defaultRole;
        const profileData = {
          id: user.uid,
          email: user.email!.toLowerCase(),
          studentId: isInstitutional ? 'PENDING-ID' : 'GUEST-ID',
          role: initialRole, 
          isAuthorizedAdmin: !!isAuthorized || isBootstrapAdmin,
          isSuperAdmin: isBootstrapAdmin,
          displayName: user.displayName || 'Visitor',
          photoURL: user.photoURL || '',
          college: defaultCollege,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        setDocumentNonBlocking(docRef, profileData, { merge: true });
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

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !firestore || !profile) return false;
    try {
      const docRef = doc(firestore, 'user_profiles', user.uid);
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
      const docRef = doc(firestore, 'user_profiles', profile.id);
      updateDocumentNonBlocking(docRef, { 
        role: newRole,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, role: newRole });
      toast({
        title: "Role Updated",
        description: `Your active role is now: ${newRole.toUpperCase()}`,
      });
    } catch (error: any) {}
  };

  const setUserRole = async (userId: string, newRole: 'user' | 'admin' | 'guest') => {
    if (!profile?.isAuthorizedAdmin || !firestore) return;
    try {
      const docRef = doc(firestore, 'user_profiles', userId);
      updateDocumentNonBlocking(docRef, {
        role: newRole,
        isAuthorizedAdmin: newRole === 'admin',
        updatedAt: serverTimestamp()
      });
      toast({
        title: "User Role Updated",
        description: `User has been successfully updated to: ${newRole.toUpperCase()}`,
      });
    } catch (error: any) {}
  };

  const transferSuperAdmin = async (targetUserId: string) => {
    if (!profile?.isSuperAdmin || !firestore) return;
    try {
      const batch = writeBatch(firestore);
      const currentRef = doc(firestore, 'user_profiles', profile.id);
      const targetRef = doc(firestore, 'user_profiles', targetUserId);

      batch.update(currentRef, { isSuperAdmin: false, updatedAt: serverTimestamp() });
      batch.update(targetRef, { isSuperAdmin: true, role: 'admin', isAuthorizedAdmin: true, updatedAt: serverTimestamp() });
      await batch.commit();

      setProfile({ ...profile, isSuperAdmin: false });
      toast({
        title: "Ownership Transferred",
        description: "Super Admin privileges have been successfully transferred.",
      });
    } catch (error: any) {}
  };

  const resignAdmin = async () => {
    if (!profile || !profile.isAuthorizedAdmin || profile.isSuperAdmin) return;
    try {
      const docRef = doc(firestore, 'user_profiles', profile.id);
      updateDocumentNonBlocking(docRef, {
        role: 'user',
        isAuthorizedAdmin: false,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, role: 'user', isAuthorizedAdmin: false });
    } catch (error: any) {}
  };

  const addUserByEmail = async (email: string, role: 'user' | 'admin' | 'guest', college: string) => {
    if (!profile?.isAuthorizedAdmin || !firestore) return false;
    const cleanEmail = email.toLowerCase().trim();
    try {
      const q = query(collection(firestore, 'user_profiles'), where('email', '==', cleanEmail), limit(1));
      const qSnap = await getDocs(q);
      
      if (!qSnap.empty) {
        toast({ title: "User Exists", description: "This email is already registered.", variant: "destructive" });
        return false;
      }

      const pendingRef = doc(collection(firestore, 'user_profiles'));
      setDocumentNonBlocking(pendingRef, {
        email: cleanEmail,
        role,
        isAuthorizedAdmin: role === 'admin',
        college,
        displayName: 'New User (Pending)',
        studentId: 'PENDING-ID',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "Invitation Sent", description: `${cleanEmail} pre-authorized.` });
      return true;
    } catch (error: any) {
      return false;
    }
  };

  const verifyStudentId = async (studentId: string) => {
    return updateProfileData({ studentId });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading: loading || isUserLoading, 
      login, 
      logout, 
      verifyStudentId, 
      updateProfileData, 
      switchRole, 
      setUserRole,
      transferSuperAdmin,
      resignAdmin,
      addUserByEmail
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