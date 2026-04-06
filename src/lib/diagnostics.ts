import { collection, addDoc, serverTimestamp, getFirestore } from "firebase/firestore";
import { SystemLog } from "@/types/diagnostics";
import { diagnosticSession } from "./diagnostics/session";
import { RateLimiter } from "@/lib/safeguards";

/**
 * Institutional System Diagnostics Logger
 * 
 * Provides a robust, non-blocking mechanism to persist runtime anomalies
 * and system health metrics to the institutional registry.
 * 
 * SAFEGUARD: Rate-limited to 20 logs per 60-second window to prevent
 * a feedback loop where logging errors to Firestore triggers more errors.
 */
class DiagnosticsLogger {
  private collectionName = 'system_diagnostics';
  private rateLimiter = new RateLimiter(20, 60_000);

  async log(log: Omit<SystemLog, 'timestamp' | 'resolved' | 'id'>) {
    try {
      // Rate limit check — prevents infinite logging feedback loops
      if (!this.rateLimiter.shouldProceed()) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[DiagnosticsLogger] Rate limit reached — log suppressed. Remaining:', this.rateLimiter.remaining());
        }
        return;
      }

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
        // Log to console only — NEVER re-trigger the logger to avoid recursion
        console.warn("[DiagnosticsLogger] Recovery failure:", err);
      });

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
