'use client';
import { useState, useEffect } from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

// This is a workaround for a bug in Next.js where the server-side
// rendered HTML is not correctly updated with the client-side
// rendered HTML.
//
// This component will only render on the client-side and will
// initialize Firebase only once.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<any>(null);

  useEffect(() => {
    const app = initializeFirebase();
    setFirebase(app);
  }, []);

  if (!firebase) {
    return null;
  }

  return (
    <FirebaseProvider
      auth={firebase.auth}
      firestore={firebase.firestore}
      firebaseApp={firebase.firebaseApp}
    >
      {children}
    </FirebaseProvider>
  );
}
