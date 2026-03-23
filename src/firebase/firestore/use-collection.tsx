'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * useCollection provides a real-time listener for Firestore collections.
 * It includes a "Silent Handshake" mode to prevent crashes during identity sync.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  if (memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    console.error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
  }

  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        if (!isMounted) return;
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        const path: string =
          memoizedTargetRefOrQuery.type === 'collection'
            ? (memoizedTargetRefOrQuery as CollectionReference).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();

        // SILENT HANDSHAKE: Catch permission-denied errors during transient role verification
        // Enhanced check to be more robust across different environments/SDK versions
        const errMsg = String(err.message || err).toLowerCase();
        const errCode = String(err.code || '').toLowerCase();

        const isPermissionDenied = 
          errCode.includes('permission-denied') || 
          errCode.includes('unauthenticated') ||
          errMsg.includes('permissions') ||
          errMsg.includes('denied');

        if (isPermissionDenied) {
          console.warn(`[Institutional Registry] Access deferred for: ${path}. Identity sync in progress or whitelist mismatch.`);
          console.debug(`[Institutional SDK] Full Error:`, err);
          setError(err);
          setData([]); // Return empty list instead of crashing
          setIsLoading(false);
          return;
        }

        if (!isMounted) return;

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
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
      
      try {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      } catch (e) {
        console.warn("[Institutional SDK] Suppressed internal target assertion during cleanup:", e);
      }
    };
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
