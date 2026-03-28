'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore'

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

/**
 * Initializes Firebase services using a singleton pattern.
 * This ensures that services like Firestore are configured correctly (e.g., long polling)
 * and that we don't attempt to re-initialize an already running app.
 */
export function initializeFirebase() {
  if (!appInstance) {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      try {
        // Attempt to initialize via Firebase App Hosting environment variables
        appInstance = initializeApp();
      } catch (e) {
        // Fallback to config object for local development
        appInstance = initializeApp(firebaseConfig);
      }
    }
  }

  if (!firestoreInstance) {
    try {
      // Force long polling to avoid connectivity issues in restricted environments (like Cloud Workstations)
      // This is the recommended setting for stable connections in the prototype environment.
      firestoreInstance = initializeFirestore(appInstance, {
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      // If already initialized or initialization fails, fallback to getFirestore
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
