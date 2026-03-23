import { collection, addDoc, serverTimestamp, getFirestore } from "firebase/firestore";
import { SystemLog } from "@/types/diagnostics";
import { diagnosticSession } from "./diagnostics/session";

/**
 * Institutional System Diagnostics Logger
 * 
 * Provides a robust, non-blocking mechanism to persist runtime anomalies
 * and system health metrics to the institutional registry.
 */
class DiagnosticsLogger {
  private collectionName = 'system_diagnostics';

  async log(log: Omit<SystemLog, 'timestamp' | 'resolved' | 'id'>) {
    try {
      const db = getFirestore();
      const colRef = collection(db, this.collectionName);
      
      const logEntry = {
        ...log,
        timestamp: serverTimestamp(),
        resolved: false,
        sessionId: diagnosticSession.getSessionId(),
        path: typeof window !== 'undefined' ? window.location.pathname : 'server-side',
        metadata: {
          ...log.metadata,
          ua: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          resolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown'
        }
      };

      // Non-blocking fire-and-forget to Firestore
      addDoc(colRef, logEntry).catch(err => {
        console.warn("[DiagnosticsLogger] Recovery failure:", err);
      });

      // Mirror to local file-based error logging system via API
      if (log.level === 'error' || log.level === 'warn') {
        const errorPayload = {
          message: `[${log.level.toUpperCase()}] ${log.message}`,
          stack: log.stack || (log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : null),
          userId: diagnosticSession.getSessionId(),
        };

        fetch('/api/issues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorPayload)
        }).catch(err => {
          console.warn("[DiagnosticsLogger] Failed to write to local issues API:", err);
        });
      }

      // Mirror to console for local development awareness
      if (process.env.NODE_ENV === 'development') {
        const style = log.level === 'error' ? 'color: #ff4d4d; font-weight: bold;' : 'color: #ffa500;';
        console.log(`%c[System ${log.level.toUpperCase()}] ${log.message}`, style, log.details || '');
      }
    } catch (err) {
      // Fail silently to prevent logger-induced crashes
      console.warn("[DiagnosticsLogger] Initialization deferred:", err);
    }
  }

  error(message: string, details?: any, source: SystemLog['source'] = 'system') {
    this.log({
      level: 'error',
      source,
      message,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      ...(details instanceof Error ? { stack: details.stack } : {})
    });
  }

  warn(message: string, details?: any, source: SystemLog['source'] = 'system') {
    this.log({
      level: 'warn',
      source,
      message,
      details: typeof details === 'string' ? details : JSON.stringify(details)
    });
  }

  info(message: string, details?: any, source: SystemLog['source'] = 'system') {
    this.log({
      level: 'info',
      source,
      message,
      details: typeof details === 'string' ? details : JSON.stringify(details)
    });
  }
}

export const diagnosticsLogger = new DiagnosticsLogger();
