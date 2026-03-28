'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore, getFirestore } from 'firebase/firestore';

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

/**
 * Initializes Firebase services with hardened settings for restricted environments.
 */
export function initializeFirebase() {
  if (!appInstance) {
    const apps = getApps();
    appInstance = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  }

  if (!firestoreInstance) {
    if (typeof window !== 'undefined') {
      try {
        // Force long polling to bypass restrictive proxies/firewalls common in cloud IDEs.
        // We explicitly set the host and disable auto-detection to ensure a stable connection.
        firestoreInstance = initializeFirestore(appInstance, {
          experimentalForceLongPolling: true,
          experimentalAutoDetectLongPolling: false,
          host: 'firestore.googleapis.com',
          ssl: true,
        });
      } catch (e) {
        // If already initialized or fails, fallback to standard getter
        firestoreInstance = getFirestore(appInstance);
      }
    } else {
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

export function getSdks() {
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
