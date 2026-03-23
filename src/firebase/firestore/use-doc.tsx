'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * useDoc provides a real-time listener for a specific Firestore document.
 * Includes "Silent Handshake" to handle transient permission errors.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (!isMounted) return;
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (!isMounted) return;
        // SILENT HANDSHAKE: Catch permission-denied errors during transient role verification
        const isPermissionDenied = 
          err.code === 'permission-denied' || 
          err.code === 'unauthenticated' ||
          err.message?.toLowerCase().includes('permissions') ||
          err.message?.toLowerCase().includes('denied');

        if (isPermissionDenied) {
          console.warn(`[Institutional Registry] Access deferred for doc: ${memoizedDocRef.path}.`);
          setError(err);
          setData(null);
          setIsLoading(false);
          return;
        }

        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    let unsubscribed = false;
    return () => {
      isMounted = false;
      if (unsubscribed) return;
      unsubscribed = true;
      
      // DEFERRED UNSUBSCRIPTION: Prevents "INTERNAL ASSERTION FAILED: Unexpected state (ID: ca9)"
      // by allowing the current Firestore change aggregator loop to finish before teardown.
      setTimeout(() => {
        try {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        } catch (e) {
          console.warn("[Institutional Registry] Suppressed unmount assertion:", e);
        }
      }, 0);
    };
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
