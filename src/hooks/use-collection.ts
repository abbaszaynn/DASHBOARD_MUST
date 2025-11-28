'use client';

import { useState, useEffect } from 'react';
import type { Query, DocumentData, Unsubscribe } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface UseCollectionOptions<T> {
  mapDoc?: (doc: DocumentData) => T;
}

export function useCollection<T>(
  query: Query<DocumentData> | null,
  options?: UseCollectionOptions<T>
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const firestore = useFirestore();

  useEffect(() => {
    if (!query || !firestore) {
        setData([]);
        setLoading(false);
        return;
    };

    setLoading(true);

    const unsubscribe: Unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const result: T[] = [];
        querySnapshot.forEach((doc) => {
          if (options?.mapDoc) {
            result.push(options.mapDoc({
              id: doc.id,
              ...doc.data(),
              data: () => ({ id: doc.id, ...doc.data() }) // for compat
            }));
          } else {
            result.push({ id: doc.id, ...doc.data() } as T);
          }
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching collection:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, query, options?.mapDoc]); // mapDoc is not stable, but it's unlikely to change

  return { data, loading, error };
}
