'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { initializeFirebase } from '.';

type FirebaseContextValue = {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} | null;

const FirebaseContext = createContext<FirebaseContextValue>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const firebase = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    return null;
  }
  return context.app;
};

export const useFirestore = (): Firestore | null => {
  const context = useContext(FirebaseContext);
  if (!context) {
    return null;
  }
  return context.firestore;
};

export const useAuth = (): Auth | null => {
  const context = useContext(FirebaseContext);
  if (!context) {
    return null;
  }
  return context.auth;
};

