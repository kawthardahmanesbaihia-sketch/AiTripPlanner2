'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Crown } from 'lucide-react';
import { useMultiplayer } from '@/contexts/multiplayer-context';

export function PlayerList() {
  const { players, userId, isHost, session } = useMultiplayer();

  if (!session) {
    return null;
  }

  return (
    <Card className="border-2 bg-card/50 backdrop-blur-sm p-6">
      <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
        Players ({players.length})
      </h2>

      <div className="space-y-3">
        {players.map((player, index) => (
          <motion.div
            key={player.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between p-3 rounded-lg border border-border/50 transition-colors ${
              player.userId === userId
                ? 'bg-primary/10 border-primary/30'
                : 'bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {player.username[0]?.toUpperCase()}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{player.username}</p>
                  {session.host.userId === player.userId && (
                    <Badge variant="secondary" className="gap-1 h-5">
                      <Crown className="h-3 w-3" />
                      Host
                    </Badge>
                  )}
                  {player.userId === userId && (
                    <Badge variant="outline" className="h-5">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(player.joinedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div>
              {player.isReady ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="flex items-center gap-1 text-green-600 dark:text-green-400"
                >
                  <Check className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-muted-foreground"
                >
                  <Clock className="h-5 w-5" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p>Waiting for players to join...</p>
        </div>
      )}

      {/* Ready status summary */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          Ready: {players.filter((p) => p.isReady).length}/{players.length}
        </p>
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{
              width: `${(players.filter((p) => p.isReady).length / players.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </Card>
  );
}
