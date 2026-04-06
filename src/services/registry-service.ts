  import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  doc, 
  getDocs,
  where,
  Timestamp,
  Firestore,
  serverTimestamp
} from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Visit } from "@/types/visitor";
import { AuditService } from "./audit-service";
import { processBatch } from "@/lib/safeguards";

export class RegistryService {
  private auditService: AuditService;

  constructor(private firestore: Firestore) {
    this.auditService = new AuditService(firestore);
  }

  getVisitsQuery(displayLimit: number = 50, includeDeleted: boolean = false) {
    const base = collection(this.firestore, 'visits');
    if (includeDeleted) {
      return query(base, orderBy('timestamp', 'desc'), limit(displayLimit));
    }
    return query(
      base, 
      where('isDeleted', '==', false),
      orderBy('timestamp', 'desc'),
      limit(displayLimit)
    );
  }

  getActiveVisitsQuery() {
    return query(
      collection(this.firestore, 'visits'), 
      where('exitTimestamp', '==', null),
      where('isDeleted', '==', false)
    );
  }

  async purgeLogs(visits: Visit[], adminId: string, adminName: string) {
    if (!visits || visits.length === 0) return;
    
    await this.auditService.logResourceAction(
      adminId,
      adminName,
      'SOFT_DELETE_LOGS',
      `Soft deleted ${visits.length} visitor records`,
      'bulk',
      'visitor_registry'
    );

    await processBatch(visits, async (visit) => {
      const docRef = doc(this.firestore, 'visits', visit.id);
      updateDocumentNonBlocking(docRef, { 
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: adminId
      });
    }, { batchSize: 10, maxItems: 500, delayMs: 200 });
  }

  async restoreLogs(visitIds: string[], adminId: string, adminName: string) {
    if (!visitIds || visitIds.length === 0) return;

    await this.auditService.logResourceAction(
      adminId,
      adminName,
      'RESTORE_LOGS',
      `Restored ${visitIds.length} visitor records`,
      'bulk',
      'visitor_registry'
    );

    await processBatch(visitIds, async (id) => {
      const docRef = doc(this.firestore, 'visits', id);
      updateDocumentNonBlocking(docRef, { 
        isDeleted: false,
        restoredAt: serverTimestamp(),
        restoredBy: adminId
      });
    }, { batchSize: 10, maxItems: 500, delayMs: 100 });
  }

  async importLogs(csvData: any[], adminId: string, adminName: string) {
    if (!csvData || csvData.length === 0) return;

    await this.auditService.logResourceAction(
      adminId,
      adminName,
      'IMPORT_LOGS',
      `Imported ${csvData.length} records via CSV`,
      'bulk',
      'visitor_registry'
    );

    await processBatch(csvData, async (record) => {
      const colRef = collection(this.firestore, 'visits');
      addDocumentNonBlocking(colRef, {
        ...record,
        importedAt: serverTimestamp(),
        importedBy: adminId,
        isDeleted: false,
        timestamp: record.timestamp || serverTimestamp()
      });
    }, { batchSize: 5 });
  }

  formatCSV(visits: Visit[]) {
    if (!visits || visits.length === 0) return "";

    const headers = ["Name", "College", "Designation", "Purpose", "Status", "Entry Time", "Exit Time", "Duration (Mins)"];
    
    const { format } = require("date-fns"); // Dynamic import or passed as dependency if needed, but registry-service is intended for client/server

    return [
      headers.join(","),
      ...visits.map(v => {
        const entry = v.timestamp instanceof Timestamp 
          ? format(v.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss') 
          : v.timestamp ? format(v.timestamp, 'yyyy-MM-dd HH:mm:ss') : '';
          
        const exit = v.exitTimestamp instanceof Timestamp
          ? format(v.exitTimestamp.toDate(), 'yyyy-MM-dd HH:mm:ss')
          : v.exitTimestamp ? format(v.exitTimestamp, 'yyyy-MM-dd HH:mm:ss') : '';

        return [
          `"${v.userName || 'Visitor'}"`,
          `"${v.college || 'EXTERNAL'}"`,
          `"${v.designation || 'Guest'}"`,
          `"${v.purpose || ''}"`,
          `"${v.exitTimestamp ? 'Archived' : 'Active'}"`,
          `"${entry}"`,
          `"${exit}"`,
          v.durationMinutes || 0
        ].join(",");
      })
    ].join("\n");
  }

  downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
