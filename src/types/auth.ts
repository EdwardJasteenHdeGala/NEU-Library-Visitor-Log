export interface UserProfile {
  id: string;
  email: string;
  studentId: string;
  role: 'guest' | 'member' | 'admin' | 'superadmin';
  isAuthorizedAdmin: boolean;
  isSuperAdmin: boolean;
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
  theme?: 'light' | 'dark' | 'system';
  timezone?: string;
  tutorialCompleted?: boolean;
  rfidTag?: string;
  resignationStatus?: 'pending' | 'approved' | 'rejected' | null;
  resignationReason?: string;
  resignationRequestedAt?: any;
}
