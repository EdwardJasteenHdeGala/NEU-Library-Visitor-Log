'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { CircuitBreaker } from '@/lib/safeguards';

// Shared circuit breaker for all non-blocking writes.
// After 5 consecutive permission failures, halts writes for 30s
// to prevent cascading error storms.
const writeBreaker = new CircuitBreaker(5, 30_000);

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 * Protected by circuit breaker to prevent write storms.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  if (!writeBreaker.canProceed()) {
    console.warn('[NonBlockingWrite] Circuit open — dropping setDoc to', docRef.path);
    return;
  }

  setDoc(docRef, data, options)
    .then(() => writeBreaker.recordSuccess())
    .catch(error => {
      writeBreaker.recordFailure();
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data,
        })
      );
    });
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  if (!writeBreaker.canProceed()) {
    console.warn('[NonBlockingWrite] Circuit open — dropping addDoc to', colRef.path);
    return Promise.resolve(undefined);
  }

  const promise = addDoc(colRef, data)
    .then((result) => {
      writeBreaker.recordSuccess();
      return result;
    })
    .catch(error => {
      writeBreaker.recordFailure();
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      );
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  if (!writeBreaker.canProceed()) {
    console.warn('[NonBlockingWrite] Circuit open — dropping updateDoc to', docRef.path);
    return;
  }

  updateDoc(docRef, data)
    .then(() => writeBreaker.recordSuccess())
    .catch(error => {
      writeBreaker.recordFailure();
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      );
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  if (!writeBreaker.canProceed()) {
    console.warn('[NonBlockingWrite] Circuit open — dropping deleteDoc for', docRef.path);
    return;
  }

  deleteDoc(docRef)
    .then(() => writeBreaker.recordSuccess())
    .catch(error => {
      writeBreaker.recordFailure();
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      );
    });
}