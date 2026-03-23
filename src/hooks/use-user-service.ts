import { useMemo } from "react";
import { useFirestore } from "@/firebase";
import { UserService } from "@/services/user-service";

export function useUserService() {
  const firestore = useFirestore();
  
  return useMemo(() => {
    if (!firestore) return null;
    return new UserService(firestore);
  }, [firestore]);
}
