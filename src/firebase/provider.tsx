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
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

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
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.app;
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
};
