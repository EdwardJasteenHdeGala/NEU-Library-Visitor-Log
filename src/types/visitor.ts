import { Timestamp } from "firebase/firestore";

export interface Visit {
  id: string;
  userId: string;
  userName: string;
  college: string;
  designation: string;
  purpose: string;
  timestamp: Timestamp;
  exitTimestamp?: Timestamp;
  durationMinutes?: number;
}
