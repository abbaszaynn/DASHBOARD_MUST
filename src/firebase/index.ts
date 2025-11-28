import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// App is initialized on the client, so we need to check if it already exists
// to prevent re-initialization errors.
function initializeFirebase(): { app: FirebaseApp; firestore: Firestore; auth: Auth } {
  if (getApps().length) {
    const app = getApp();
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    return { app, firestore, auth };
  } else {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    return { app, firestore, auth };
  }
}

export { initializeFirebase };
export * from './provider';
