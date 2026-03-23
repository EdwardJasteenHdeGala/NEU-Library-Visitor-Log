import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  doc, 
  getDocs,
  where,
  Timestamp,
  Firestore
} from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Visit } from "@/types/visitor";
import { AuditService } from "./audit-service";

export class RegistryService {
  private auditService: AuditService;

  constructor(private firestore: Firestore) {
    this.auditService = new AuditService(firestore);
  }

  getVisitsQuery(displayLimit: number = 50) {
    return query(
      collection(this.firestore, 'visits'), 
      orderBy('timestamp', 'desc'),
      limit(displayLimit)
    );
  }

  getActiveVisitsQuery() {
    return query(
      collection(this.firestore, 'visits'), 
      where('exitTimestamp', '==', null)
    );
  }

  async purgeLogs(visits: Visit[], adminId: string, adminName: string) {
    if (!visits || visits.length === 0) return;
    
    await this.auditService.logResourceAction(
      adminId,
      adminName,
      'PURGE_LOGS',
      `Purged ${visits.length} visitor records`,
      'bulk',
      'visitor_registry'
    );

    // Using non-blocking updates for large purges to avoid UI stall
    visits.forEach(visit => {
      deleteDocumentNonBlocking(doc(this.firestore, 'visits', visit.id));
    });
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
