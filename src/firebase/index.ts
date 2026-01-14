import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseConfig } from './config';

import { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';

export type FirebaseInstances = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// This wrapper function is used to initialize Firebase and
// is designed to be friendly to Next.js server-side rendering.
export function initializeFirebase(): FirebaseInstances {
  if (getApps().length) {
    const firebaseApp = getApp();
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    return { firebaseApp, auth, firestore };
  } else {
    const firebaseApp = initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    return { firebaseApp, auth, firestore };
  }
}

export {
  FirebaseProvider,
  useCollection,
  useDoc,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
};
