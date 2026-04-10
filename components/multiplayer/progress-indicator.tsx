'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Loader2 } from 'lucide-react';
import { useMultiplayer } from '@/contexts/multiplayer-context';

interface ProgressStep {
  id: string;
  label: string;
  description: string;
}

const steps: ProgressStep[] = [
  {
    id: 'players',
    label: 'Players Joined',
    description: 'Waiting for all players to join',
  },
  {
    id: 'images',
    label: 'Select Images',
    description: 'Browse and select travel images',
  },
  {
    id: 'preferences',
    label: 'Set Preferences',
    description: 'Choose budget, dates, interests',
  },
  {
    id: 'ready',
    label: 'Ready Status',
    description: 'All players mark ready',
  },
  {
    id: 'analysis',
    label: 'Analyze Results',
    description: 'Get destination recommendations',
  },
];

export function ProgressIndicator() {
  const { players = [], preferences, session, allPlayersReady } = useMultiplayer();

  const getCurrentStep = (): number => {
    if (!players || !players.length) return 0;
    if (!preferences.selectedImages?.length) return 1;
    if (!preferences.budget && !preferences.interests?.length) return 2;
    if (!allPlayersReady) return 3;
    if (session?.analysisResults) return 4;
    return 3;
  };

  const currentStep = getCurrentStep();
  const safePlayersArray = Array.isArray(players) ? players : [];
  const playersCount = Math.max(safePlayersArray.length, 1);
  const totalReadyPlayers = safePlayersArray.filter((p) => p?.isReady).length;

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              {/* Step Circle */}
              <div className="flex-shrink-0">
                <motion.div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                        : 'bg-muted text-muted-foreground'
                  }`}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-1">
                <h3
                  className={`font-semibold ${
                    isCompleted || isCurrent
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>

                {/* Step-specific Status */}
                {isCurrent && step.id === 'players' && (
                  <p className="text-xs text-primary font-semibold mt-1">
                    {safePlayersArray.length} player{safePlayersArray.length !== 1 ? 's' : ''} joined
                  </p>
                )}

                {isCurrent && step.id === 'images' && (
                  <p className="text-xs text-primary font-semibold mt-1">
                    {(preferences.selectedImages || []).length} image
                    {(preferences.selectedImages || []).length !== 1 ? 's' : ''}{' '}
                    selected
                  </p>
                )}

                {isCurrent && step.id === 'preferences' && (
                  <div className="text-xs text-primary font-semibold mt-1 space-y-1">
                    {preferences.budget && (
                      <p>Budget: {preferences.budget}</p>
                    )}
                    {(preferences.interests || []).length > 0 && (
                      <p>{preferences.interests.length} interest(s) selected</p>
                    )}
                  </div>
                )}

                {isCurrent && step.id === 'ready' && (
                  <p className="text-xs text-primary font-semibold mt-1">
                    {totalReadyPlayers} of {safePlayersArray.length} player
                    {safePlayersArray.length !== 1 ? 's' : ''} ready
                  </p>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-5 top-10 w-0.5 h-12 bg-border" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Ready Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-4 border-t border-border/30"
      >
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          Player Readiness
        </p>
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/60"
              initial={{ width: '0%' }}
              animate={{
                width: `${Math.round((totalReadyPlayers / playersCount) * 100)}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {totalReadyPlayers} of {playersCount}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
