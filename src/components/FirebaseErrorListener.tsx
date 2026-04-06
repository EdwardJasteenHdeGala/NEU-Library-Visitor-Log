'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 * 
 * SAFEGUARD: Clears error state after handling to prevent infinite re-throw loops
 * where the same error is thrown on every React re-render cycle.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      setError(error);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  if (error) {
    // Ignore permission errors for system_config to prevent startup crashes.
    if (error.request.path && error.request.path.includes('system_config')) {
      setError(null); // Clear state so we don't check this path every render
      return null;
    }
    
    // Capture the error and clear state BEFORE throwing.
    // This prevents the component from re-throwing the same error 
    // on every subsequent render cycle (infinite error boundary loop).
    const captured = error;
    setError(null);
    throw captured;
  }

  return null;
}

