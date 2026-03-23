'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { diagnosticsLogger } from '@/lib/diagnostics';
import { useToast } from '@/hooks/use-toast';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It displays a toast notification instead of throwing a hard error to prevent React crashes.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.warn("Caught Global Permission Error:", error);
      
      diagnosticsLogger.log({
        level: 'error',
        source: 'firestore',
        message: 'Missing or Insufficient Permissions',
        details: `Path: ${error.request.path || 'Unknown'} | Action: Persistent Sync`,
        stack: error.stack
      });

      toast({
        title: "Access Restricted",
        description: "Your session token does not have the necessary permissions for this query.",
        variant: "destructive"
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
