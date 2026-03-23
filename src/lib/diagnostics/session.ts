'use client';

/**
 * Diagnostic Session Manager
 * 
 * Generates and maintains a unique session ID for the duration of the 
 * user's browser session. This ID is used to cross-reference technical 
 * logs with user feedback telemetry.
 */
class DiagnosticSession {
  getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    // Check session storage first to maintain ID across reloads within same tab
    const storedId = sessionStorage.getItem('neu_diagnostic_session_id');
    if (storedId) return storedId;

    // Generate new ID if not present (Simple unique ID for institutional use)
    const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('neu_diagnostic_session_id', newId);
    return newId;
  }
}

export const diagnosticSession = new DiagnosticSession();
