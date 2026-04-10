'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatedBackgroundElements } from '@/components/animated-background-elements';
import { PlayerList } from '@/components/multiplayer/player-list';
import { SessionInfo } from '@/components/multiplayer/session-info';
import { SharedPreferencesForm } from '@/components/multiplayer/shared-preferences-form';
import { AnalysisResults } from '@/components/multiplayer/analysis-results';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';

export default function SessionPage() {
  const params = useParams();
  const sessionIdParam = params.sessionId as string;
  const router = useRouter();
  const {
    sessionId,
    userId,
    username,
    session,
    isConnected,
    allPlayersReady,
    submitAnalysis,
    players,
  } = useMultiplayer();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Join session if not already connected
  useEffect(() => {
    if (!isConnected && !sessionId) {
      // We need to join the session from URL
      // This will be handled by the session joining flow
      // For now, just redirect back if can't connect
      const timer = setTimeout(() => {
        if (!isConnected) {
          router.push('/multiplayer');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, sessionId, router]);

  // Verify session matches URL param
  useEffect(() => {
    if (sessionId && sessionId !== sessionIdParam) {
      router.push(`/multiplayer/session/${sessionId}`);
    }
  }, [sessionId, sessionIdParam, router]);

  const handleAnalyze = async () => {
    try {
      if (!session || !players.length) {
        setError('Unable to analyze without players and preferences');
        return;
      }

      setIsAnalyzing(true);
      setError(null);

      // Prepare consolidated preferences
      const consolidatedPrefs = {
        interests: session.preferences.interests || [],
        budget: session.preferences.budget,
        dateRange: session.preferences.dateRange,
        destination: session.preferences.destination,
        travelType: session.preferences.travelType,
      };

      // Call the multiplayer analysis API
      const response = await fetch('/api/multiplayer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: consolidatedPrefs,
          playerCount: players.length,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const results = await response.json();
      await submitAnalysis(results);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMsg);
      console.error('[v0] Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Loading state
  if (!isConnected || !session) {
    return (
      <div className="relative min-h-screen px-4 py-16">
        <AnimatedBackgroundElements />
        <div className="container relative z-10 mx-auto max-w-4xl flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-center"
          >
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">
              {isConnected
                ? 'Loading session...'
                : 'Connecting to session...'}
            </p>
            {!isConnected && !sessionId && (
              <p className="text-xs text-muted-foreground mt-4">
                Tip: Make sure you have the correct session ID
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Show results if analysis is complete
  if (session.analysisResults) {
    return (
      <div className="relative min-h-screen px-4 py-16">
        <AnimatedBackgroundElements />
        <div className="container relative z-10 mx-auto max-w-4xl">
          <AnalysisResults />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-16">
      <AnimatedBackgroundElements />

      <div className="container relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            {username}&apos;s Session
          </h1>
          <p className="text-muted-foreground">
            Collaborating with {players.length} {players.length === 1 ? 'player' : 'players'}
          </p>
        </motion.div>

        {/* Main Layout: Sidebar + Content + Right Sidebar */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Player List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <PlayerList />
          </motion.div>

          {/* Center - Preferences Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <SharedPreferencesForm />
          </motion.div>

          {/* Right Sidebar - Session Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <SessionInfo />
          </motion.div>
        </div>

        {/* Analyze Button - Full Width Below */}
        {allPlayersReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="border-2 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-1">Ready to Discover?</h3>
                  <p className="text-sm text-muted-foreground">
                    All players are ready. Analyze preferences together and find
                    your perfect destination!
                  </p>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  size="lg"
                  className="flex-shrink-0"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze Together
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive mt-4">{error}</p>
              )}
            </Card>
          </motion.div>
        )}

        {/* Waiting for Ready Status */}
        {!allPlayersReady && players.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="border-2 border-border/50 bg-muted/30 p-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Waiting for {players.filter((p) => !p.isReady).length}{' '}
                  {players.filter((p) => !p.isReady).length === 1
                    ? 'player'
                    : 'players'}{' '}
                  to be ready...
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.userId}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.2,
                        repeat: Infinity,
                      }}
                      className={`h-3 w-3 rounded-full ${
                        player.isReady ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
