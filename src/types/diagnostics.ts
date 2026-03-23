import { Timestamp } from "firebase/firestore";

export interface SystemLog {
  id?: string;
  level: 'error' | 'warn' | 'info';
  source: 'auth' | 'firestore' | 'ui' | 'system' | 'security';
  message: string;
  details?: string;
  stack?: string;
  userId?: string;
  userEmail?: string;
  path?: string;
  sessionId?: string;
  timestamp: Timestamp | Date;
  resolved: boolean;
  metadata?: {
    ua?: string;
    resolution?: string;
    [key: string]: any;
  };
}
