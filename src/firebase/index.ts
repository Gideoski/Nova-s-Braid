
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
 * This version supports both client-side and server-side rendering (SSR) by 
 * ensuring services are available during Node.js execution while keeping 
 * browser-specific optimizations (like long polling) for the client.
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
        console.error("Firebase App initialization failed:", e);
        throw e;
      }
    }
  }

  if (!firestoreInstance) {
    try {
      // Force long polling on the client to avoid connectivity issues in restricted environments.
      // This is skipped on the server (Node.js) as it relies on browser-specific networking.
      if (typeof window !== 'undefined') {
        firestoreInstance = initializeFirestore(appInstance, {
          experimentalForceLongPolling: true,
          experimentalAutoDetectLongPolling: false,
        });
      } else {
        firestoreInstance = getFirestore(appInstance);
      }
    } catch (e) {
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
