import { useMemo } from "react";
import { useFirestore } from "@/firebase";
import { RegistryService } from "@/services/registry-service";

export function useRegistry() {
  const firestore = useFirestore();
  
  return useMemo(() => {
    if (!firestore) return null;
    return new RegistryService(firestore);
  }, [firestore]);
}
