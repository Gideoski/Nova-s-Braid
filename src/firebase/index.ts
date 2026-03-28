
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore'

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

/**
 * Initializes Firebase services using a robust singleton pattern.
 * This ensures that Firestore is configured with long polling correctly
 * and prevents multiple initialization attempts which can lead to connection instability.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return {
      firebaseApp: null as any,
      auth: null as any,
      firestore: null as any
    };
  }

  if (!appInstance) {
    const apps = getApps();
    if (apps.length > 0) {
      appInstance = apps[0];
    } else {
      try {
        appInstance = initializeApp(firebaseConfig);
      } catch (e) {
        console.error("Firebase App initialization failed:", e);
        throw e;
      }
    }
  }

  if (!firestoreInstance) {
    try {
      // Force long polling to avoid connectivity issues in restricted environments.
      // initializeFirestore must be called before any other firestore methods.
      firestoreInstance = initializeFirestore(appInstance, {
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: false, // Explicitly disable auto-detection to force it
      });
    } catch (e) {
      // Fallback to getFirestore if initializeFirestore was already called elsewhere
      firestoreInstance = getFirestore(appInstance);
    }
  }

  if (!authInstance) {
    authInstance = getAuth(appInstance);
  }

  return {
    firebaseApp: appInstance,
    auth: authInstance,
    firestore: firestoreInstance
  };
}

/**
 * Helper function to retrieve initialized SDKs. 
 * Delegates to initializeFirebase for consistent initialization.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return initializeFirebase();
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
