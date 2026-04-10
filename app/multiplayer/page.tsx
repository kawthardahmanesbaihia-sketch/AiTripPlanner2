'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, AlertCircle } from 'lucide-react';
import { AnimatedBackgroundElements } from '@/components/animated-background-elements';
import { SessionLobby } from '@/components/multiplayer/session-lobby';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { isFirebaseInitialized } from '@/lib/firebase-config';

export default function MultiplayerPage() {
  const { sessionId, error } = useMultiplayer();
  const router = useRouter();

  // Redirect to session if already in one
  useEffect(() => {
    if (sessionId) {
      router.push(`/multiplayer/session/${sessionId}`);
    }
  }, [sessionId, router]);

  return (
    <div className="relative min-h-screen px-4 py-16">
      <AnimatedBackgroundElements />

      <div className="container relative z-10 mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Plane className="h-8 w-8" />
          </motion.div>

          <h1 className="mb-4 text-balance text-5xl font-bold md:text-6xl">
            Travel Together
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Plan your next adventure with friends in real-time. Collaborate on
            preferences and discover the perfect destination together.
          </p>
        </motion.div>

        {/* Firebase Configuration Alert */}
        {!isFirebaseInitialized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Firebase Not Configured</AlertTitle>
              <AlertDescription>
                Multiplayer features are unavailable. Please set up Firebase environment variables
                (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and
                NEXT_PUBLIC_FIREBASE_DATABASE_URL) to use this feature. See MULTIPLAYER_SETUP.md
                for instructions.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Lobby */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SessionLobby />
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid gap-4 md:grid-cols-3"
        >
          {[
            {
              title: 'Real-time Sync',
              description:
                'See your friends\' preferences update instantly as they select',
            },
            {
              title: 'Collaborative Analysis',
              description:
                'Get AI recommendations based on everyone\'s combined preferences',
            },
            {
              title: 'Easy Sharing',
              description:
                'Share a simple session code with friends to invite them',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm"
            >
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
