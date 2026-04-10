'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Check } from 'lucide-react';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { useRouter } from 'next/navigation';
import { isFirebaseInitialized } from '@/lib/firebase-config';

export function SessionLobby() {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionIdInput] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  const {
    createNewSession,
    joinExistingSession,
    isLoading,
    error,
    sessionId: connectedSessionId,
    userId,
  } = useMultiplayer();

  const router = useRouter();

  const handleCreateSession = async () => {
    if (!username.trim()) return;

    const result = await createNewSession(username);
    if (result) {
      // Will redirect from page component
    }
  };

  const handleJoinSession = async () => {
    if (!username.trim() || !sessionId.trim()) return;

    const cleanId = sessionId.trim().toLowerCase(); // ✅ تصحيح
    const success = await joinExistingSession(cleanId, username);
    if (success) {
      // Will redirect from page component
    }
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(connectedSessionId || '');
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  // If already connected, show join info
  if (connectedSessionId && userId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md"
      >
        <Card className="border-2 bg-card/50 backdrop-blur-sm p-8">
          <h2 className="mb-4 text-2xl font-bold text-center">Session Created!</h2>

          <p className="text-center text-muted-foreground mb-6">
            Share this code with other players to join your session
          </p>

          <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <p className="text-xs text-muted-foreground mb-2 text-center">Session ID</p>
            <p className="text-2xl font-mono font-bold text-center text-primary mb-4">
              {connectedSessionId}
            </p>
            <Button
              onClick={copySessionId}
              size="sm"
              className="w-full"
              variant={copiedSessionId ? "secondary" : "default"}
            >
              {copiedSessionId ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Session ID
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mb-6">
            Waiting for players to join...
          </p>

          <Button
            onClick={() => router.push(`/multiplayer/session/${connectedSessionId}`)}
            className="w-full"
            size="lg"
          >
            Continue to Session
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Mode Selection */}
      {mode === null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            Play Together
          </h2>

          <p className="text-center text-muted-foreground mb-8">
            Explore travel destinations with friends in real-time
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <motion.button
              whileHover={{ scale: isFirebaseInitialized ? 1.02 : 1 }}
              whileTap={{ scale: isFirebaseInitialized ? 0.98 : 1 }}
              onClick={() => isFirebaseInitialized && setMode('create')}
              className="group"
              disabled={!isFirebaseInitialized}
            >
              <Card className={`border-2 p-8 h-full transition-all ${
                isFirebaseInitialized 
                  ? 'hover:border-primary/50 hover:shadow-lg cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}>
                <h3 className="text-xl font-bold mb-2">Create Session</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new multiplayer session and invite friends
                </p>
              </Card>
            </motion.button>

            <motion.button
              whileHover={{ scale: isFirebaseInitialized ? 1.02 : 1 }}
              whileTap={{ scale: isFirebaseInitialized ? 0.98 : 1 }}
              onClick={() => isFirebaseInitialized && setMode('join')}
              className="group"
              disabled={!isFirebaseInitialized}
            >
              <Card className={`border-2 p-8 h-full transition-all ${
                isFirebaseInitialized 
                  ? 'hover:border-primary/50 hover:shadow-lg cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}>
                <h3 className="text-xl font-bold mb-2">Join Session</h3>
                <p className="text-sm text-muted-foreground">
                  Join a friend&apos;s session with a session ID
                </p>
              </Card>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Create Mode */}
      {mode === 'create' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-2 bg-card/50 backdrop-blur-sm p-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode(null)}
              className="mb-4"
            >
              ← Back
            </Button>

            <h2 className="mb-6 text-2xl font-bold">Create Session</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCreateSession}
                disabled={!username.trim() || isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Session'
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Join Mode */}
      {mode === 'join' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-2 bg-card/50 backdrop-blur-sm p-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode(null)}
              className="mb-4"
            >
              ← Back
            </Button>

            <h2 className="mb-6 text-2xl font-bold">Join Session</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Session ID</label>
                <Input
                  placeholder="Enter session ID from your friend"
                  value={sessionId}
                  onChange={(e) => setSessionIdInput(e.target.value)} // ✅ هنا تصحيح
                  disabled={isLoading}
                  className="font-mono"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                onClick={handleJoinSession}
                disabled={!username.trim() || !sessionId.trim() || isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Session'
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
