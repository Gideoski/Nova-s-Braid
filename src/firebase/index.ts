
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore, getFirestore } from 'firebase/firestore';

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

/**
 * Initializes Firebase services with forced long-polling to bypass
 * connectivity issues in restricted cloud environments.
 */
export function initializeFirebase() {
  if (!appInstance) {
    const apps = getApps();
    appInstance = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  }

  if (!firestoreInstance) {
    if (typeof window !== 'undefined') {
      // On the client, we MUST use initializeFirestore to force long polling.
      // This is the most reliable way to prevent the "10-second timeout" error.
      try {
        firestoreInstance = initializeFirestore(appInstance, {
          experimentalForceLongPolling: true,
          useFetchStreams: false, // Further stabilize connection by disabling streams
        });
      } catch (e) {
        // If already initialized (common in hot-reload), get current instance
        firestoreInstance = getFirestore(appInstance);
      }
    } else {
      // Server-side context
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
