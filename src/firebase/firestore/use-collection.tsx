// src/lib/firestore/use-collection.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type Query,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { FirestorePermissionError } from '../errors';

interface UseCollectionOptions {
  query?: QueryConstraint[];
}

export const useCollection = <T extends DocumentData>(
  q: Query | null,
  options?: UseCollectionOptions
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let unsubscribe: Unsubscribe | undefined;

    try {
      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const documents = querySnapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() } as T;
          });
          setData(documents);
          setLoading(false);
        },
        async (err) => {
          console.error('Firestore onSnapshot error:', err);
          
          if (err.code === 'permission-denied') {
              const permissionError = new FirestorePermissionError({
                  path: q.path,
                  operation: 'list',
              });
              setError(permissionError);
          } else {
              setError(err);
          }
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Error setting up onSnapshot:', err);
      setError(err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [q]); // The query object is now a dependency

  return { data, loading, error };
};
