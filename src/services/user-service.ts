import { 
  collection, 
  query, 
  orderBy, 
  limit,
  doc, 
  serverTimestamp,
  Firestore,
  where,
  arrayUnion
} from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { AuditService } from "./audit-service";

export class UserService {
  private auditService: AuditService;

  constructor(private firestore: Firestore) {
    this.auditService = new AuditService(firestore);
  }

  getUsersQuery(max: number = 100) {
    return query(
      collection(this.firestore, 'users'), 
      where('isDeleted', '==', false),
      orderBy('updatedAt', 'desc'),
      limit(max)
    );
  }

  getDeletedUsersQuery(max: number = 100) {
    return query(
      collection(this.firestore, 'users'), 
      where('isDeleted', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(max)
    );
  }

  getInvitesQuery(max: number = 50) {
    return query(
      collection(this.firestore, 'invites'), 
      where('isDeleted', '==', false),
      orderBy('timestamp', 'desc'),
      limit(max)
    );
  }

  async blockUser(userId: string, reason: string, adminId: string, adminName: string) {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDocumentNonBlocking(userRef, {
      isBlocked: true,
      blockedReason: reason,
      blockedAt: serverTimestamp(),
      blockedBy: adminId,
      updatedAt: serverTimestamp()
    });

    await this.auditService.logResourceAction(
      adminId,
      adminName,
      'BLOCK_USER',
      `Blocked user ${userId}. Reason: ${reason}`,
      userId,
      'user'
    );
  }

  async unblockUser(userId: string, adminId: string, adminName: string) {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDocumentNonBlocking(userRef, {
      isBlocked: false,
      blockedReason: null,
      updatedAt: serverTimestamp()
    });

    await this.auditService.logResourceAction(
      adminId,
      adminName,
      'UNBLOCK_USER',
      `Unblocked user ${userId}`,
      userId,
      'user'
    );
  }

  async warnUser(userId: string, message: string, adminId: string, adminName: string) {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDocumentNonBlocking(userRef, {
      warnings: arrayUnion({
        message,
        timestamp: new Date().toISOString(),
        adminId,
        adminName
      }),
      updatedAt: serverTimestamp()
    });

    await this.auditService.logResourceAction(
      adminId,
      adminName,
      'WARN_USER',
      `Issued warning to user ${userId}: ${message}`,
      userId,
      'user'
    );
  }

  async softDeleteUser(userId: string, adminId: string, adminName: string) {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDocumentNonBlocking(userRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: adminId,
      updatedAt: serverTimestamp()
    });

    await this.auditService.logResourceAction(
      adminId,
      adminName,
      'SOFT_DELETE_USER',
      `Soft deleted user ${userId}`,
      userId,
      'user'
    );
  }

  async restoreUser(userId: string, adminId: string, adminName: string) {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDocumentNonBlocking(userRef, {
      isDeleted: false,
      updatedAt: serverTimestamp()
    });

    await this.auditService.logResourceAction(
      adminId,
      adminName,
      'RESTORE_USER',
      `Restored user ${userId}`,
      userId,
      'user'
    );
  }

  async inviteUser(email: string, role: string, invitedBy: string, invitedByName: string) {
    const result = await addDocumentNonBlocking(collection(this.firestore, 'invites'), {
      email: email.toLowerCase().trim(),
      role,
      invitedBy,
      invitedByName,
      timestamp: serverTimestamp(),
      status: 'pending',
      isDeleted: false
    });

    await this.auditService.logResourceAction(
      invitedBy,
      invitedByName,
      'INVITE_USER',
      `Invited ${email} as ${role}`,
      result ? (result as any).id : 'unknown',
      'invite'
    );

    return result;
  }

  async revokeInvite(inviteId: string, adminId: string, adminName: string) {
    await this.auditService.logResourceAction(
      adminId,
      adminName,
      'REVOKE_INVITE',
      `Revoked invitation ${inviteId}`,
      inviteId,
      'invite'
    );
    return updateDocumentNonBlocking(doc(this.firestore, 'invites', inviteId), {
      isDeleted: true,
      revokedBy: adminId,
      revokedAt: serverTimestamp()
    });
  }
}
