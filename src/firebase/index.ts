import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Check whether the Firebase config is still using placeholder values.
 * If so, skip initialization entirely to avoid hanging network requests.
 */
function isPlaceholderConfig(): boolean {
  return (
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey.startsWith('REPLACE_WITH') ||
    !firebaseConfig.projectId ||
    firebaseConfig.projectId.startsWith('REPLACE_WITH')
  );
}

// App is initialized on the client, so we need to check if it already exists
// to prevent re-initialization errors.
function initializeFirebase(): { app: FirebaseApp; firestore: Firestore; auth: Auth } | null {
  if (isPlaceholderConfig()) {
    console.warn(
      '[Firebase] Config has placeholder values — skipping initialization. ' +
      'Update src/firebase/config.ts with real credentials to enable Firestore features.'
    );
    return null;
  }

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
