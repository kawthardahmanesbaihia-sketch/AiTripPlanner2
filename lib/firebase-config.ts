'use client';

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, DatabaseReference } from 'firebase/database';

// Check if Firebase environment variables are set
const hasFirebaseConfig = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
);

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase only if config is available
let app: FirebaseApp | null = null;
let database: Database | null = null;
let isFirebaseInitialized = false;

if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    isFirebaseInitialized = true;
    console.log('[v0] Firebase initialized successfully');
  } catch (error) {
    console.error('[v0] Firebase initialization error:', error);
    isFirebaseInitialized = false;
  }
}

export { database, isFirebaseInitialized };

/**
 * Get a reference to a specific path in the database
 */
export function getRef(path: string): DatabaseReference {
  if (!database) {
    throw new Error(
      'Firebase database not initialized. Please configure Firebase environment variables.'
    );
  }
  return ref(database, path);
}
