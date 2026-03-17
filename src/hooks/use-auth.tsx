
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  writeBatch, 
  query, 
  collection, 
  where, 
  getDocs, 
  limit, 
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
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
      
      // CHECK FOR PRE-ADDED USER BY EMAIL
      if (!docSnap.exists() && user.email) {
        const q = query(collection(firestore, 'user_profiles'), where('email', '==', user.email), limit(1));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const preDoc = qSnap.docs[0];
          const preData = preDoc.data() as UserProfile;
          
          // Migrate pre-added profile to UID-indexed profile
          const migratedData = {
            ...preData,
            id: user.uid,
            displayName: user.displayName || preData.displayName,
            photoURL: user.photoURL || preData.photoURL,
            updatedAt: serverTimestamp()
          };
          
          await setDoc(docRef, migratedData);
          await deleteDoc(preDoc.ref);
          setProfile(migratedData as any);
          setLoading(false);
          return;
        }
      }

      const isInstitutional = user.email && user.email.endsWith('@neu.edu.ph');
      const isBootstrapAdmin = user.email === BOOTSTRAP_SUPER_ADMIN_EMAIL;
      const isAuthorized = user.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email);
      
      const isCICS = user.email === BOOTSTRAP_SUPER_ADMIN_EMAIL || user.email === 'jcesperanza@neu.edu.ph';
      
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
        const initialRole = (isAuthorized && intendedRole === 'admin') || isBootstrapAdmin ? 'admin' : defaultRole;
        
        const profileData = {
          id: user.uid,
          email: user.email!,
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

  const transferSuperAdmin = async (targetUserId: string) => {
    if (!profile?.isSuperAdmin || !firestore) {
      toast({
        title: "Permission Denied",
        description: "Only the Super Admin can transfer ownership.",
        variant: "destructive"
      });
      return;
    }

    try {
      const batch = writeBatch(firestore);
      const currentRef = doc(firestore, 'user_profiles', profile.id);
      const targetRef = doc(firestore, 'user_profiles', targetUserId);

      batch.update(currentRef, {
        isSuperAdmin: false,
        updatedAt: serverTimestamp()
      });

      batch.update(targetRef, {
        isSuperAdmin: true,
        role: 'admin',
        isAuthorizedAdmin: true,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      setProfile({ ...profile, isSuperAdmin: false });

      toast({
        title: "Ownership Transferred",
        description: "Super Admin privileges have been successfully transferred.",
      });
    } catch (error: any) {
      toast({
        title: "Transfer Error",
        description: "Failed to transfer Super Admin status.",
        variant: "destructive"
      });
    }
  };

  const resignAdmin = async () => {
    if (!profile || !profile.isAuthorizedAdmin) return;
    
    if (profile.isSuperAdmin) {
      toast({
        title: "Action Restricted",
        description: "Super Admin cannot resign without transferring ownership first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const docRef = doc(firestore, 'user_profiles', profile.id);
      await updateDoc(docRef, {
        role: 'user',
        isAuthorizedAdmin: false,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, role: 'user', isAuthorizedAdmin: false });
      toast({
        title: "Privileges Resigned",
        description: "You have successfully resigned your administrative access.",
      });
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: "Failed to resign admin privileges.",
        variant: "destructive"
      });
    }
  };

  const addUserByEmail = async (email: string, role: 'user' | 'admin' | 'guest', college: string) => {
    if (!profile?.isAuthorizedAdmin || !firestore) return false;
    try {
      const q = query(collection(firestore, 'user_profiles'), where('email', '==', email), limit(1));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        toast({
          title: "Duplicate User",
          description: "A user with this email already exists in the directory.",
          variant: "destructive"
        });
        return false;
      }

      await addDoc(collection(firestore, 'user_profiles'), {
        email,
        role,
        isAuthorizedAdmin: role === 'admin',
        college,
        displayName: 'New User (Pending)',
        studentId: 'PENDING-ID',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({
        title: "User Pre-Registered",
        description: `Access for ${email} has been configured.`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error Adding User",
        description: "Failed to pre-register the user email.",
        variant: "destructive"
      });
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
