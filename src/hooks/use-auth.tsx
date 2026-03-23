
"use client";


import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserSessionPersistence
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

import { UserProfile } from '@/types/auth';
import { diagnosticsLogger } from '@/lib/diagnostics';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  login: (roleHint?: 'member' | 'guest') => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<boolean>;
  viewMode: 'guest' | 'member' | 'admin';
  switchViewMode: (newMode: 'member' | 'admin') => void;
  setUserRole: (userId: string, newRole: 'member' | 'admin' | 'superadmin') => Promise<void>;
  requestResignation: (reason: string) => Promise<void>;
  handleResignationRequest: (userId: string, action: 'approve' | 'reject') => Promise<void>;
  transferSuperAdmin: (targetEmail: string, reason: string) => Promise<void>;
  blockUser: (userId: string, reason: string, details: string, duration: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  sendWarning: (userId: string, title: string, message: string) => Promise<void>;
  completeTutorial: () => Promise<void>;
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
  const [viewMode, setViewMode] = useState<'guest' | 'member' | 'admin'>('guest');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const activeUnsubRef = React.useRef<(() => void) | null>(null);

  const fetchOrCreateProfile = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      if (!user || !firestore) {
        setLoading(false);
        return;
      }

      // Cleanup any existing listener before starting new one
      if (activeUnsubRef.current) {
        activeUnsubRef.current();
        activeUnsubRef.current = null;
      }

      const docRef = doc(firestore, 'users', uid);
      const inviteQuery = query(collection(firestore, 'invites'), where('email', '==', user.email?.toLowerCase() || ''));

      // 1. Parallelize core identity and authorization fetches
      const [docSnap, inviteSnap] = await Promise.all([
        getDoc(docRef),
        getDocs(inviteQuery).catch(() => null)
      ]);

      // 1. Authorization Logic: ONLY whitelisted or invited emails are admins
      const userEmail = user.email?.toLowerCase() || '';
      const isInstitutional = userEmail.endsWith('@neu.edu.ph');
      const isWhitelisted = AUTHORIZED_ADMIN_EMAILS.includes(userEmail);
      const isSuperAdminAuto = userEmail === BOOTSTRAP_SUPER_ADMIN_EMAIL;
      
      let inheritedRole: 'member' | 'admin' | 'guest' | null = null;
      if (inviteSnap && !inviteSnap.empty) {
        inheritedRole = inviteSnap.docs[0].data().role;
      }

      let isDbAdmin = false;
      let isDbSuperAdmin = false;
      let currentRole: string | null = null;
      let existingData: UserProfile | null = null;

      if (docSnap.exists()) {
        existingData = docSnap.data() as UserProfile;
        currentRole = existingData.role;
        isDbAdmin = currentRole === 'admin';
        isDbSuperAdmin = currentRole === 'superadmin';
      }

      // 2. Strict Hierarchy Logic: Honor manual DB elevations while defaulting strictly to user
      const shouldBeAdmin = isWhitelisted || inheritedRole === 'admin' || isSuperAdminAuto || isDbAdmin || isDbSuperAdmin;

      // 3. Immediate Hydration Logic
      if (existingData && docSnap.exists()) {
        
        // PERMANENT STATE: Use the DB's current role to respect UI-based demotions/promotions.
        // Bootstrap superadmin is the only hardcoded exception.
        let finalRole = (isSuperAdminAuto ? 'superadmin' : currentRole) as 'member' | 'admin' | 'superadmin' | 'guest';
        let finalShouldBeAdmin = finalRole === 'admin' || finalRole === 'superadmin';

        // Sync Firestore if bootstrap needs applying
        if (finalRole !== currentRole && firestore) {
          updateDocumentNonBlocking(docRef, { 
            role: finalRole, 
            isAuthorizedAdmin: finalShouldBeAdmin, 
            isSuperAdmin: isSuperAdminAuto || isDbSuperAdmin,
            updatedAt: serverTimestamp() 
          });
        }

        const processed = {
          ...existingData,
          role: finalRole,
          isAuthorizedAdmin: finalShouldBeAdmin,
          isSuperAdmin: isSuperAdminAuto || isDbSuperAdmin
        } as UserProfile;
        
        setProfile(processed);
        setViewMode('member');
      } else {
        // NEW ACCOUNT CREATION LOCKDOWN
        const isAuthorized = isWhitelisted || inheritedRole === 'admin' || isSuperAdminAuto;
        
        const defaultDesignation = isInstitutional ? 'student' : 'guest';
        const defaultUnit = isInstitutional ? 'Pending Assignment' : 'External';

        const profileData: UserProfile = {
          id: uid,
          email: userEmail,
          studentId: isInstitutional ? '' : 'GUEST-ID',
          role: isAuthorized ? (isSuperAdminAuto ? 'superadmin' : 'admin') : (isInstitutional ? 'member' : 'guest'),
          isAuthorizedAdmin: isAuthorized,
          isSuperAdmin: isSuperAdminAuto,
          displayName: user.displayName || 'Institutional Member',
          photoURL: user.photoURL || '',
          department: defaultUnit,
          college: '',
          designation: defaultDesignation as any,
          profileCompleted: !isInstitutional,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          theme: 'light',
          isBlocked: false,
          tutorialCompleted: false
        };

        setDocumentNonBlocking(docRef, profileData, { merge: true });
        setProfile(profileData);
        setViewMode('member');
      }

      let innerMounted = true;
      const unsub = onSnapshot(docRef, (snap) => {
        if (innerMounted && snap.exists()) {
          const data = snap.data() as UserProfile;
          const isSuperAdminAuto = userEmail === BOOTSTRAP_SUPER_ADMIN_EMAIL;
          
          let liveRole = (isSuperAdminAuto ? 'superadmin' : data.role) as 'member' | 'admin' | 'superadmin' | 'guest';
          let liveShouldBeAdmin = liveRole === 'admin' || liveRole === 'superadmin';

          const processed = {
            ...data,
            role: liveRole,
            isAuthorizedAdmin: liveShouldBeAdmin,
            isSuperAdmin: isSuperAdminAuto || data.role === 'superadmin'
          } as UserProfile;
          
          setProfile(processed);
          // Sync view mode if it was accidentally shifted
          setViewMode(prev => (!liveShouldBeAdmin && prev === 'admin' ? 'member' : prev));
          setLoading(false);
        }
      }, (err) => {
        console.warn("Institutional Sync Listener Error:", err);
        setLoading(false);
      });

      activeUnsubRef.current = () => {
        innerMounted = false;
        setTimeout(() => {
          try { unsub(); } catch (e) { console.warn("[Institutional Auth] Suppressed unmount assertion:", e); }
        }, 0);
      };

    } catch (error: any) {
      console.error("Identity Sync Error:", error);
      diagnosticsLogger.error("Identity Sync Failure", { 
        userId: uid, 
        error: error.message, 
        code: error.code 
      }, 'auth');
    } finally {
      // Ensure loading is released even on failure
      setLoading(false);
    }
  }, [user, firestore]);

  useEffect(() => {
    if (isUserLoading) return;

    const checkProfile = async () => {
      // Safety timeout: prevent perpetual loading spinner if Firestore hangs
      const timeoutId = setTimeout(() => {
        setLoading(false);
        diagnosticsLogger.warn("Identity Sync Timeout", { userId: user?.uid || 'anonymous' }, 'auth');
      }, 12000);

      if (user) {
        await fetchOrCreateProfile(user.uid);
      } else {
        if (activeUnsubRef.current) {
          activeUnsubRef.current();
          activeUnsubRef.current = null;
        }
        setProfile(null);
        setViewMode('guest');
        setLoading(false);
      }
      
      clearTimeout(timeoutId);
    };

    checkProfile();

    return () => {
      if (activeUnsubRef.current) {
        activeUnsubRef.current();
        activeUnsubRef.current = null;
      }
    };
  }, [user, isUserLoading, fetchOrCreateProfile]);

  const login = async (roleHint?: 'member' | 'guest') => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      if (roleHint === 'member') provider.setCustomParameters({ hd: 'neu.edu.ph' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      diagnosticsLogger.error("Institutional Gateway Auth Error", { code: error.code, message: error.message }, 'auth');
      toast({ title: "Synchronization Error", description: error.message || "Identity hub unreachable.", variant: "destructive" });
    }
  };

  const logout = async () => { await signOut(auth); };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !firestore || !profile) return false;
    try {
      const docRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(docRef, { ...data, updatedAt: serverTimestamp() });
      setProfile({ ...profile, ...data });
      return true;
    } catch (error: any) { return false; }
  };

  const auditLog = async (data: { 
    action: string, 
    targetId: string, 
    oldRole: string, 
    newRole: string, 
    reason?: string,
    metadata?: any
  }) => {
    if (!firestore || !profile) return;
    try {
      const logRef = doc(collection(firestore, 'role_audit_logs'));
      await setDocumentNonBlocking(logRef, {
        ...data,
        actorId: profile.id,
        actorName: profile.displayName,
        actorEmail: profile.email,
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Audit log failed:", e);
    }
  };

  const switchViewMode = (newMode: 'member' | 'admin') => {
    if (!profile || !profile.isAuthorizedAdmin) return;
    setViewMode(newMode);
    toast({ title: "View Mode Switched", description: `Now viewing as ${newMode.toUpperCase()}.` });
  };

  const setUserRole = async (userId: string, newRole: 'member' | 'admin' | 'superadmin') => {
    if (!profile || !firestore) return;
    
    const isSuperAdmin = profile.role === 'superadmin';
    const isAdmin = profile.role === 'admin';

    // 1. Admin Logic: CAN elevate Member -> Admin. CANNOT demote or touch Super Admin.
    if (isAdmin && !isSuperAdmin) {
      if (newRole !== 'admin') {
        toast({ title: "Authority Required", description: "Only the Super Admin can demote administrative roles.", variant: "destructive" });
        return;
      }
    }

    // 2. Super Admin Logic: Full control.
    if (!isSuperAdmin && !isAdmin) {
      toast({ title: "Authority Required", description: "Administrative privileges required.", variant: "destructive" });
      return;
    }

    try {
      const targetRef = doc(firestore, 'users', userId);
      const targetSnap = await getDoc(targetRef);
      if (!targetSnap.exists()) return;
      const targetData = targetSnap.data() as UserProfile;

      // 1. Admin Elevation Rule: CAN elevate ONLY Members -> Admin.
      if (isAdmin && !isSuperAdmin) {
        if (targetData.role !== 'member') {
          toast({ title: "Authority Required", description: "You can only elevate institutional Members.", variant: "destructive" });
          return;
        }
        if (newRole !== 'admin') {
          toast({ title: "Authority Required", description: "Only the Super Admin can demote roles.", variant: "destructive" });
          return;
        }
      }

      // 2. Super Admin Check: Super Admin can do anything (except self-demote if it leaves system without superadmin, but transfer handles that)
      if (!isSuperAdmin && !isAdmin) {
         toast({ title: "Access Denied", description: "Administrative privileges required.", variant: "destructive" });
         return;
      }

      // Protection: Normal Admins cannot modify Super Admins
      if (isAdmin && !isSuperAdmin && targetData.role === 'superadmin') {
         toast({ title: "Access Denied", description: "You cannot modify the Super Admin account.", variant: "destructive" });
         return;
      }

      updateDocumentNonBlocking(targetRef, {
        role: newRole,
        isAuthorizedAdmin: newRole === 'admin' || newRole === 'superadmin',
        updatedAt: serverTimestamp()
      });

      await auditLog({ 
        action: 'ROLE_CHANGE', 
        targetId: userId, 
        oldRole: targetData.role, 
        newRole: newRole,
        reason: 'Administrative elevation/update'
      });

      if (userId === user?.uid) setViewMode(newRole === 'admin' ? 'admin' : 'member');
      toast({ title: "Role Synchronized", description: `User ${newRole === 'admin' ? 'promoted' : 'updated'} to ${newRole.toUpperCase()}.` });
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  };

  const transferSuperAdmin = async (targetEmail: string, reason: string) => {
    if (!profile?.isSuperAdmin || !firestore) return;
    try {
      // Find user by email
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', targetEmail.toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ title: "Recipient Not Found", description: "Target email must have a registered account.", variant: "destructive" });
        return;
      }

      const targetDoc = snap.docs[0];
      const targetId = targetDoc.id;
      const targetData = targetDoc.data() as UserProfile;

      const currentRef = doc(firestore, 'users', profile.id);
      const targetRef = doc(firestore, 'users', targetId);
      
      // Atomic delegation pattern
      updateDocumentNonBlocking(currentRef, { role: 'admin', isSuperAdmin: false, updatedAt: serverTimestamp() });
      updateDocumentNonBlocking(targetRef, { role: 'superadmin', isSuperAdmin: true, isAuthorizedAdmin: true, updatedAt: serverTimestamp() });
      
      await auditLog({ 
        action: 'SUPER_ADMIN_TRANSFER', 
        targetId: targetId, 
        oldRole: 'superadmin', 
        newRole: 'superadmin',
        reason: reason,
        metadata: { targetEmail }
      });

      toast({ title: "Ownership Transferred", description: `Institutional authority delegated to ${targetEmail}.` });
      setProfile({ ...profile, role: 'admin', isSuperAdmin: false });
    } catch (error: any) {
      toast({ title: "Transfer Failed", description: error.message, variant: "destructive" });
    }
  };

  const requestResignation = async (reason: string) => {
    if (!profile || profile.role !== 'admin') {
      toast({ title: "Protocol Violation", description: "Only Admins can submit resignation requests.", variant: "destructive" });
      return;
    }
    try {
      const docRef = doc(firestore, 'users', profile.id);
      updateDocumentNonBlocking(docRef, { 
        resignationStatus: 'pending', 
        resignationReason: reason,
        resignationRequestedAt: serverTimestamp(),
        updatedAt: serverTimestamp() 
      });
      
      await auditLog({ 
        action: 'RESIGNATION_REQUESTED', 
        targetId: profile.id, 
        oldRole: 'admin', 
        newRole: 'admin',
        reason: reason
      });

      toast({ title: "Request Submitted", description: "Your resignation is now pending Super Admin approval." });
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleResignationRequest = async (userId: string, action: 'approve' | 'reject') => {
    if (!profile?.isSuperAdmin || !firestore) return;
    try {
      const targetRef = doc(firestore, 'users', userId);
      const targetSnap = await getDoc(targetRef);
      if (!targetSnap.exists()) return;
      const targetData = targetSnap.data() as UserProfile;

      if (action === 'approve') {
        const isInstitutional = targetData.email.toLowerCase().endsWith('@neu.edu.ph');
        const nextRole = isInstitutional ? 'member' : 'guest';
        
        updateDocumentNonBlocking(targetRef, { 
          role: nextRole, 
          isAuthorizedAdmin: false, 
          resignationStatus: 'approved',
          updatedAt: serverTimestamp() 
        });

        await auditLog({ 
          action: 'RESIGNATION_APPROVED', 
          targetId: userId, 
          oldRole: 'admin', 
          newRole: nextRole,
          reason: targetData.resignationReason
        });
        toast({ title: "Resignation Approved", description: `Member demoted to ${nextRole.toUpperCase()}.` });
      } else {
        updateDocumentNonBlocking(targetRef, { 
          resignationStatus: 'rejected',
          updatedAt: serverTimestamp() 
        });
        await auditLog({ 
          action: 'RESIGNATION_REJECTED', 
          targetId: userId, 
          oldRole: 'admin', 
          newRole: 'admin',
          reason: 'Super Admin rejection'
        });
        toast({ title: "Resignation Rejected", description: "The administrative request was denied." });
      }
    } catch (error: any) {
      toast({ title: "Action Failed", description: error.message, variant: "destructive" });
    }
  };

  const blockUser = async (userId: string, reason: string) => {
    if (!profile?.isAuthorizedAdmin || !firestore) return;
    try {
      const userRef = doc(firestore, 'users', userId);
      updateDocumentNonBlocking(userRef, { isBlocked: true, blockedReason: reason, updatedAt: serverTimestamp() });
      toast({ title: "User Blocked", description: "Identity registry updated." });
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  };

  const unblockUser = async (userId: string) => {
    if (!profile?.isAuthorizedAdmin || !firestore) return;
    try {
      const userRef = doc(firestore, 'users', userId);
      updateDocumentNonBlocking(userRef, { isBlocked: false, blockedReason: null, updatedAt: serverTimestamp() });
      toast({ title: "Access Restored", description: "Member re-authorized." });
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  };

  const sendWarning = async (userId: string, title: string, message: string) => {
    if (!profile?.isAuthorizedAdmin || !firestore) return;
    try {
      const notificationRef = doc(firestore, 'notifications', `warning-${userId}-${Date.now()}`);
      setDocumentNonBlocking(notificationRef, { userId, title, message, read: false, timestamp: serverTimestamp() }, { merge: true });
      toast({ title: "Warning Sent", description: "Alert logged." });
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  };
  const completeTutorial = async () => {
    if (!user || !profile) return;
    try {
      const docRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(docRef, { tutorialCompleted: true, updatedAt: serverTimestamp() });
      setProfile({ ...profile, tutorialCompleted: true });
    } catch (error: any) {
      console.error("Failed to complete tutorial:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, login, logout, updateProfileData,
      viewMode, switchViewMode, setUserRole, requestResignation, handleResignationRequest, transferSuperAdmin,
      blockUser, unblockUser, sendWarning, completeTutorial
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
