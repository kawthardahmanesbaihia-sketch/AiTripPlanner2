'use client';

import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  Unsubscribe,
  DatabaseReference,
} from 'firebase/database';
import { database, isFirebaseInitialized } from './firebase-config';

/**
 * Session data structure stored in Firebase
 */
export interface FirebaseSession {
  sessionId: string;
  createdAt: number;
  host: {
    userId: string;
    username: string;
  };
  status: 'active' | 'completed';
  expiresAt: number;
  players: Record<string, FirebasePlayer>;
  preferences: SharedPreferences;
  lastModifiedBy: string;
  analysisResults: any | null;
}

/**
 * Player data structure
 */
export interface FirebasePlayer {
  userId: string;
  username: string;
  joinedAt: number;
  isReady: boolean;
  lastUpdated: number;
}

/**
 * Shared preferences structure
 */
export interface SharedPreferences {
  destination?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  interests?: string[];
  budget?: string;
  travelType?: string;
  [key: string]: any;
}

/**
 * Generate a random session ID
 */
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 11) + 
         Math.random().toString(36).substring(2, 11);
}

/**
 * Generate a user ID (unique per session)
 */
export function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 11);
}

/**
 * Create a new multiplayer session
 */
export async function createSession(
  hostUsername: string,
): Promise<{ sessionId: string; userId: string }> {
  const sessionId = generateSessionId();
  const userId = generateUserId();
  const now = Date.now();

  const sessionData: FirebaseSession = {
    sessionId,
    createdAt: now,
    host: {
      userId,
      username: hostUsername,
    },
    status: 'active',
    expiresAt: now + 24 * 60 * 60 * 1000, // 24 hour expiry
    players: {
      [userId]: {
        userId,
        username: hostUsername,
        joinedAt: now,
        isReady: false,
        lastUpdated: now,
      },
    },
    preferences: {},
    lastModifiedBy: userId,
    analysisResults: null,
  };

  const sessionRef = ref(database, `sessions/${sessionId}`);
  await set(sessionRef, sessionData);

  return { sessionId, userId };
}

/**
 * Join an existing session
 */
export async function joinSession(
  sessionId: string,
  username: string,
): Promise<{ userId: string } | null> {
  const userId = generateUserId();
  const now = Date.now();

  // Check if session exists
  const sessionRef = ref(database, `sessions/${sessionId}`);
  const snapshot = await get(sessionRef);

  if (!snapshot.exists()) {
    console.error('[v0] Session not found:', sessionId);
    return null;
  }

  const sessionData = snapshot.val();
  if (sessionData.status !== 'active') {
    console.error('[v0] Session is not active');
    return null;
  }

  // Add player to session
  const playerRef = ref(database, `sessions/${sessionId}/players/${userId}`);
  await set(playerRef, {
    userId,
    username,
    joinedAt: now,
    isReady: false,
    lastUpdated: now,
  });

  return { userId };
}

/**
 * Leave a session
 */
export async function leaveSession(sessionId: string, userId: string): Promise<void> {
  const playerRef = ref(database, `sessions/${sessionId}/players/${userId}`);
  await remove(playerRef);

  // Check if session is now empty and delete it
  const sessionRef = ref(database, `sessions/${sessionId}`);
  const snapshot = await get(sessionRef);

  if (snapshot.exists()) {
    const sessionData = snapshot.val();
    const playerCount = Object.keys(sessionData.players || {}).length;

    if (playerCount === 0) {
      await remove(sessionRef);
    }
  }
}

/**
 * Update shared preferences in session
 */
export async function updateSessionPreferences(
  sessionId: string,
  userId: string,
  preferences: Partial<SharedPreferences>,
): Promise<void> {
  if (!isFirebaseInitialized || !database) {
    console.warn('[v0] Firebase not initialized. Cannot update preferences.');
    return;
  }

  try {
    const now = Date.now();
    const updates: Record<string, any> = {};

    // Update preferences
    Object.keys(preferences).forEach((key) => {
      updates[`sessions/${sessionId}/preferences/${key}`] = preferences[key as keyof SharedPreferences];
    });

    // Update last modified info
    updates[`sessions/${sessionId}/lastModifiedBy`] = userId;
    updates[`sessions/${sessionId}/players/${userId}/lastUpdated`] = now;

    // Use the imported update function from firebase
    if (!database) {
      console.error('[v0] Database reference is null when calling update');
      return;
    }
    await update(database, updates);
  } catch (error) {
    console.error('[v0] Error updating session preferences:', error);
    throw error;
  }
}

/**
 * Set player ready status
 */
export async function setPlayerReady(
  sessionId: string,
  userId: string,
  isReady: boolean,
): Promise<void> {
  if (!isFirebaseInitialized || !database) {
    console.warn('[v0] Firebase not initialized. Cannot set player ready status.');
    return;
  }

  try {
    const playerRef = ref(database, `sessions/${sessionId}/players/${userId}/isReady`);
    await set(playerRef, isReady);
  } catch (error) {
    console.error('[v0] Error setting player ready status:', error);
    throw error;
  }
}

/**
 * Get session data
 */
export async function getSessionData(sessionId: string): Promise<FirebaseSession | null> {
  try {
    if (!isFirebaseInitialized || !database) {
      console.warn('[v0] Firebase not initialized when fetching session data');
      return null;
    }

    const sessionRef = ref(database, `sessions/${sessionId}`);
    const snapshot = await get(sessionRef);

    if (!snapshot.exists()) {
      console.log('[v0] Session not found in database:', sessionId);
      return null;
    }

    return snapshot.val();
  } catch (error) {
    console.error('[v0] Error fetching session data:', error);
    return null;
  }
}

/**
 * Subscribe to session changes
 */
export function onSessionChange(
  sessionId: string,
  callback: (session: FirebaseSession | null) => void,
): Unsubscribe | null {
  if (!isFirebaseInitialized || !database) {
    console.warn('[v0] Firebase not initialized. Cannot subscribe to session changes.');
    return null;
  }

  const sessionRef = ref(database, `sessions/${sessionId}`);

  return onValue(
    sessionRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('[v0] Firebase error:', error);
      callback(null);
    },
  );
}

/**
 * Update analysis results for a session
 */
export async function updateSessionAnalysis(
  sessionId: string,
  analysisResults: any,
): Promise<void> {
  if (!isFirebaseInitialized || !database) {
    console.warn('[v0] Firebase not initialized. Cannot update session analysis.');
    return;
  }

  try {
    const resultsRef = ref(database, `sessions/${sessionId}/analysisResults`);
    await set(resultsRef, analysisResults);

    // Mark session as completed
    const statusRef = ref(database, `sessions/${sessionId}/status`);
    await set(statusRef, 'completed');
  } catch (error) {
    console.error('[v0] Error updating session analysis:', error);
    throw error;
  }
}
