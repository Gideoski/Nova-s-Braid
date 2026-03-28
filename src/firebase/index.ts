
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore'

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

/**
 * Initializes Firebase services using a robust singleton pattern.
 * Focuses on forcing long-polling for environments with restricted streaming capabilities.
 */
export function initializeFirebase() {
  if (!appInstance) {
    const apps = getApps();
    if (apps.length > 0) {
      appInstance = apps[0];
    } else {
      appInstance = initializeApp(firebaseConfig);
    }
  }

  if (!firestoreInstance) {
    try {
      // In the browser, we use initializeFirestore to force long polling.
      // This is crucial for environments that block or timeout standard WebSocket/Streaming connections.
      if (typeof window !== 'undefined') {
        firestoreInstance = initializeFirestore(appInstance, {
          experimentalForceLongPolling: true,
          experimentalAutoDetectLongPolling: false,
        });
      } else {
        // For Server-Side Rendering (SSR)
        firestoreInstance = getFirestore(appInstance);
      }
    } catch (e) {
      // If initializeFirestore fails (e.g., already initialized), fallback to getFirestore
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
