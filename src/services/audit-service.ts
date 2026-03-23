import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  Timestamp,
  Firestore,
  serverTimestamp
} from "firebase/firestore";

export interface AuditEntry {
  id?: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: any;
  resourceId?: string;
  resourceType?: string;
}

export class AuditService {
  constructor(private firestore: Firestore) {}

  getAuditLogsQuery(displayLimit: number = 100) {
    return query(
      collection(this.firestore, 'audit_logs'), 
      orderBy('timestamp', 'desc'),
      limit(displayLimit)
    );
  }

  async logAction(entry: Omit<AuditEntry, 'timestamp'>) {
    try {
      await addDoc(collection(this.firestore, 'audit_logs'), {
        ...entry,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Audit Logging Failure:", error);
    }
  }

  async logResourceAction(
    adminId: string, 
    adminName: string, 
    action: string, 
    details: string, 
    resourceId?: string, 
    resourceType?: string
  ) {
    return this.logAction({
      adminId,
      adminName,
      action,
      details,
      resourceId,
      resourceType
    });
  }
}
