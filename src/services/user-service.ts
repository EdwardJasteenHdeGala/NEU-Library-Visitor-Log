import { 
  collection, 
  query, 
  orderBy, 
  limit,
  doc, 
  serverTimestamp,
  Firestore
} from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { AuditService } from "./audit-service";

export class UserService {
  private auditService: AuditService;

  constructor(private firestore: Firestore) {
    this.auditService = new AuditService(firestore);
  }

  getUsersQuery(max: number = 100) {
    return query(
      collection(this.firestore, 'users'), 
      orderBy('updatedAt', 'desc'),
      limit(max)
    );
  }

  getInvitesQuery(max: number = 50) {
    return query(
      collection(this.firestore, 'invites'), 
      orderBy('timestamp', 'desc'),
      limit(max)
    );
  }

  async inviteUser(email: string, role: string, invitedBy: string, invitedByName: string) {
    const result = await addDocumentNonBlocking(collection(this.firestore, 'invites'), {
      email: email.toLowerCase().trim(),
      role,
      invitedBy,
      invitedByName,
      timestamp: serverTimestamp(),
      status: 'pending'
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
    return deleteDocumentNonBlocking(doc(this.firestore, 'invites', inviteId));
  }
}
