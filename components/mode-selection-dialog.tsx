'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Users2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export interface ModeSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModeSelectionDialog({ isOpen, onClose }: ModeSelectionDialogProps) {
  const modes = [
    {
      id: 'single',
      label: 'Single',
      description: 'Plan your trip solo with AI guidance',
      icon: User,
      href: '/upload',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'duo',
      label: 'Duo',
      description: 'Plan with one friend in real-time',
      icon: Users,
      href: '/multiplayer',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'squad',
      label: 'Squad',
      description: 'Plan with your entire friend group',
      icon: Users2,
      href: '/multiplayer',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          >
            <div className="w-full max-w-2xl">
              <Card className="border-2 bg-card/95 backdrop-blur-md p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">Choose Your Adventure</h2>
                  <p className="text-muted-foreground">
                    Select how you want to plan your next trip
                  </p>
                </div>

                {/* Mode Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  {modes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <Link key={mode.id} href={mode.href}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={onClose}
                          className="w-full h-full"
                        >
                          <Card className="border-2 p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-card to-card/50">
                            {/* Icon Background */}
                            <div className={`bg-gradient-to-r ${mode.color} rounded-lg p-4 mb-4 w-fit mx-auto opacity-80 group-hover:opacity-100 transition-opacity`}>
                              <Icon className="h-8 w-8 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-foreground mb-2">
                              {mode.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {mode.description}
                            </p>

                            {/* Badge */}
                            <div className="mt-4 pt-4 border-t border-border/30">
                              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                {mode.id === 'single' ? 'Solo' : mode.id === 'duo' ? '2 Players' : '3+ Players'}
                              </span>
                            </div>
                          </Card>
                        </motion.button>
                      </Link>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-border/30 text-center">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
