'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, LogOut, X } from 'lucide-react';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { useRouter } from 'next/navigation';

export function SessionInfo() {
  const [copiedSessionId, setCopiedSessionId] = useState(false);
  const { sessionId, isHost, leaveCurrentSession } = useMultiplayer();
  const router = useRouter();

  const copySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopiedSessionId(true);
      setTimeout(() => setCopiedSessionId(false), 2000);
    }
  };

  const handleLeave = async () => {
    await leaveCurrentSession();
    router.push('/multiplayer');
  };

  return (
    <Card className="border-2 bg-card/50 backdrop-blur-sm p-6">
      <h2 className="mb-4 text-lg font-bold">Session Info</h2>

      <div className="space-y-4">
        {/* Session ID */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Session ID</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-muted rounded font-mono text-sm font-semibold break-all">
              {sessionId}
            </code>
            <Button
              onClick={copySessionId}
              size="sm"
              variant="ghost"
              className="flex-shrink-0"
            >
              {copiedSessionId ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Host Badge */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Role</p>
          <p className="text-sm font-semibold">
            {isHost ? '👑 Session Host' : '🎯 Participant'}
          </p>
        </div>

        {/* Leave Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full"
        >
          <Button
            onClick={handleLeave}
            variant="outline"
            size="sm"
            className="w-full text-destructive hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Leave Session
          </Button>
        </motion.div>

        {isHost && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              onClick={handleLeave}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              End Session
            </Button>
          </motion.div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>Tip:</strong> Share the session ID with friends to invite them. They&apos;ll need it to join.
        </p>
      </div>
    </Card>
  );
}
