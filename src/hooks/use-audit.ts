import { useMemo } from "react";
import { useFirestore } from "@/firebase";
import { AuditService } from "@/services/audit-service";

export function useAudit() {
  const firestore = useFirestore();
  
  return useMemo(() => {
    if (!firestore) return null;
    return new AuditService(firestore);
  }, [firestore]);
}
