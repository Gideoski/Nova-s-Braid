
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore'

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

/**
 * Initializes Firebase services using a robust singleton pattern.
 * This version forces aggressive connectivity settings for Firestore to avoid timeouts.
 */
export function initializeFirebase() {
  if (!appInstance) {
    const apps = getApps();
    if (apps.length > 0) {
      appInstance = apps[0];
    } else {
      try {
        appInstance = initializeApp(firebaseConfig);
      } catch (e) {
        throw e;
      }
    }
  }

  if (!firestoreInstance) {
    try {
      // Force long polling on the client to avoid connectivity issues (like the 10s timeout)
      // in restricted cloud or proxy environments.
      if (typeof window !== 'undefined') {
        firestoreInstance = initializeFirestore(appInstance, {
          experimentalForceLongPolling: true,
          experimentalAutoDetectLongPolling: false,
          // Explicitly setting host can sometimes bypass proxy handshake delays
          host: 'firestore.googleapis.com',
          ssl: true,
        });
      } else {
        // Fallback for SSR/Node environment
        firestoreInstance = getFirestore(appInstance);
      }
    } catch (e) {
      // If initialization fails, fallback to standard getter
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
