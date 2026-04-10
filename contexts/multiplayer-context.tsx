'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isFirebaseInitialized } from '@/lib/firebase-config';
import {
  FirebaseSession,
  FirebasePlayer,
  SharedPreferences,
  createSession,
  joinSession,
  leaveSession,
  updateSessionPreferences,
  setPlayerReady,
  getSessionData,
  onSessionChange,
  updateSessionAnalysis,
} from '@/lib/firebase-utils';

/**
 * Context for multiplayer session management
 */
interface MultiplayerContextType {
  // Session info
  sessionId: string | null;
  userId: string | null;
  username: string | null;
  session: FirebaseSession | null;
  
  // Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Players
  players: FirebasePlayer[];
  currentPlayer: FirebasePlayer | null;
  
  // Preferences
  preferences: SharedPreferences;
  
  // Actions
  createNewSession: (username: string) => Promise<{ sessionId: string; userId: string } | null>;
  joinExistingSession: (sessionId: string, username: string) => Promise<boolean>;
  leaveCurrentSession: () => Promise<void>;
  updatePreferences: (preferences: Partial<SharedPreferences>) => Promise<void>;
  setReady: (isReady: boolean) => Promise<void>;
  submitAnalysis: (results: any) => Promise<void>;
  
  // Utilities
  isHost: boolean;
  allPlayersReady: boolean;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [session, setSession] = useState<FirebaseSession | null>(null);

  // Status
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    !isFirebaseInitialized
      ? 'Firebase is not configured. Please set up Firebase environment variables to use multiplayer features.'
      : null
  );

  // Preferences
  const [preferences, setPreferences] = useState<SharedPreferences>({});

  // Firebase subscription
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // Computed values
  const players = session ? Object.values(session.players || {}) : [];
  const currentPlayer = players.find((p) => p.userId === userId) || null;
  const isHost = session?.host.userId === userId;
  const allPlayersReady = players.length > 0 && players.every((p) => p.isReady);

  // Create new session
  const createNewSession = useCallback(async (newUsername: string) => {
    try {
      setIsLoading(true);

      if (!isFirebaseInitialized) {
        const errorMsg = 'Firebase is not configured. Please set up Firebase environment variables.';
        setError(errorMsg);
        return null;
      }

      setError(null);

      const { sessionId: newSessionId, userId: newUserId } = await createSession(newUsername);

      setSessionId(newSessionId);
      setUserId(newUserId);
      setUsername(newUsername);
      setIsConnected(true);

      return { sessionId: newSessionId, userId: newUserId };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMsg);
      console.error('[v0] Create session error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Join existing session
  const joinExistingSession = useCallback(async (joinSessionId: string, newUsername: string) => {
    try {
      setIsLoading(true);

      if (!isFirebaseInitialized) {
        const errorMsg = 'Firebase is not configured. Please set up Firebase environment variables.';
        setError(errorMsg);
        return false;
      }

      setError(null);

      // Verify session exists
      const sessionData = await getSessionData(joinSessionId);
      if (!sessionData) {
        throw new Error(
          `Session "${joinSessionId}" not found. The session may have expired or the ID may be incorrect.`
        );
      }

      const result = await joinSession(joinSessionId, newUsername);
      if (!result) {
        throw new Error('Failed to join session');
      }

      setSessionId(joinSessionId);
      setUserId(result.userId);
      setUsername(newUsername);
      setIsConnected(true);

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to join session';
      setError(errorMsg);
      console.error('[v0] Join session error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Leave session
  const leaveCurrentSession = useCallback(async () => {
    try {
      if (sessionId && userId) {
        await leaveSession(sessionId, userId);
      }

      // Cleanup
      if (unsubscribe) {
        unsubscribe();
      }

      setSessionId(null);
      setUserId(null);
      setUsername(null);
      setSession(null);
      setPreferences({});
      setIsConnected(false);
      setError(null);
    } catch (err) {
      console.error('[v0] Leave session error:', err);
    }
  }, [sessionId, userId, unsubscribe]);

  // Update preferences
  const updatePreferences = useCallback(
    async (newPreferences: Partial<SharedPreferences>) => {
      try {
        if (!sessionId || !userId) {
          throw new Error('Not connected to session');
        }

        await updateSessionPreferences(sessionId, userId, newPreferences);
        setPreferences((prev) => ({ ...prev, ...newPreferences }));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update preferences';
        setError(errorMsg);
        console.error('[v0] Update preferences error:', err);
      }
    },
    [sessionId, userId],
  );

  // Set ready status
  const setReady = useCallback(
    async (isReady: boolean) => {
      try {
        if (!sessionId || !userId) {
          throw new Error('Not connected to session');
        }

        await setPlayerReady(sessionId, userId, isReady);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update ready status';
        setError(errorMsg);
        console.error('[v0] Set ready error:', err);
      }
    },
    [sessionId, userId],
  );

  // Submit analysis results
  const submitAnalysis = useCallback(
    async (results: any) => {
      try {
        if (!sessionId) {
          throw new Error('Not connected to session');
        }

        await updateSessionAnalysis(sessionId, results);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to submit analysis';
        setError(errorMsg);
        console.error('[v0] Submit analysis error:', err);
      }
    },
    [sessionId],
  );

  // Subscribe to session changes
  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const unsub = onSessionChange(sessionId, (sessionData) => {
      if (sessionData) {
        setSession(sessionData);
        setPreferences(sessionData.preferences || {});
      } else {
        // Session was deleted
        setSession(null);
      }
    });

    setUnsubscribe(() => unsub);

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [sessionId]);

  const value: MultiplayerContextType = {
    sessionId,
    userId,
    username,
    session,
    isConnected,
    isLoading,
    error,
    players,
    currentPlayer,
    preferences,
    createNewSession,
    joinExistingSession,
    leaveCurrentSession,
    updatePreferences,
    setReady,
    submitAnalysis,
    isHost,
    allPlayersReady,
  };

  return <MultiplayerContext.Provider value={value}>{children}</MultiplayerContext.Provider>;
}

/**
 * Hook to use multiplayer context
 */
export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within MultiplayerProvider');
  }
  return context;
}
