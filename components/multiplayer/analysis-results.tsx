'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { Sparkles, TrendingUp } from 'lucide-react';

export function AnalysisResults() {
  const { session } = useMultiplayer();

  if (!session?.analysisResults) {
    return null;
  }

  const results = session.analysisResults;
  const countries = results.countries || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Perfect Destinations</h2>
        <p className="text-muted-foreground">Based on your collaborative preferences</p>
      </motion.div>

      {/* Results Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {countries.slice(0, 3).map((country, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <Card className="border-2 overflow-hidden hover:shadow-lg transition-shadow h-full">
              {/* Image */}
              {country.image && (
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary overflow-hidden">
                  <img
                    src={country.image}
                    alt={country.name}
                    className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {/* Match Percentage Badge */}
                  <div className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                    {Math.round(country.matchPercentage || 0)}%
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{country.name}</h3>

                {/* Climate and Vibe */}
                <div className="mb-4 space-y-2">
                  {country.climate && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Climate:</span>
                      <Badge variant="secondary" className="text-xs">
                        {country.climate}
                      </Badge>
                    </div>
                  )}
                  {country.vibe && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Vibe:</span>
                      <Badge variant="secondary" className="text-xs">
                        {country.vibe}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Reason */}
                {country.reason && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {country.reason}
                  </p>
                )}

                {/* Tags */}
                {country.tags && country.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {country.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      {results.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 bg-gradient-to-br from-primary/10 via-card/50 to-card/50 p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold">Why These Destinations?</h3>
                <p className="text-muted-foreground leading-relaxed">{results.summary}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4"
      >
        <Button size="lg" className="flex-1">
          Share Results
        </Button>
        <Button variant="outline" size="lg" className="flex-1">
          New Analysis
        </Button>
      </motion.div>
    </div>
  );
}
