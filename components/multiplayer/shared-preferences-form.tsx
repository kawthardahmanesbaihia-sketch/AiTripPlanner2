'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/date-range-picker';
import { ImageSelector } from './image-selector';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { Loader2 } from 'lucide-react';

export function SharedPreferencesForm() {
  const { preferences, updatePreferences, setReady, currentPlayer } = useMultiplayer();
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('images');

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleBudgetSelect = async (budget: string) => {
    setIsUpdating(true);
    await updatePreferences({ budget });
    setIsUpdating(false);
  };



  const handleDateRangeChange = async (startDate: Date, endDate: Date) => {
    setIsUpdating(true);
    await updatePreferences({
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
    setShowDatePicker(false);
    setIsUpdating(false);
  };

  const handleInterestToggle = async (interest: string) => {
    const currentInterests = localPrefs.interests || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter((i) => i !== interest)
      : [...currentInterests, interest];

    setIsUpdating(true);
    await updatePreferences({ interests: newInterests });
    setIsUpdating(false);
  };

  const interests = [
    'Adventure',
    'Culture',
    'Beaches',
    'Mountains',
    'Food',
    'Shopping',
    'Nightlife',
    'Nature',
  ];

  const dateRangeDisplay = localPrefs.dateRange
    ? `${new Date(localPrefs.dateRange.start).toDateString()} → ${new Date(
        localPrefs.dateRange.end,
      ).toDateString()}`
    : 'Select dates';

  return (
    <Card className="border-2 bg-card/50 backdrop-blur-sm p-6 space-y-6">
      <h2 className="text-lg font-bold">Collaborative Preferences</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <ImageSelector />
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {/* Budget Selection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <label className="block text-sm font-semibold mb-2">Budget</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'standard', label: 'Standard' },
                { value: 'premium', label: 'Premium' },
                { value: 'luxury', label: 'Luxury' },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBudgetSelect(option.value)}
                  disabled={isUpdating}
                  className="relative"
                >
                  <div
                    className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                      localPrefs.budget === option.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {option.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Date Range */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-semibold mb-2">Travel Dates</label>
            {showDatePicker ? (
              <DateRangePicker onDateRangeChange={handleDateRangeChange} />
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDatePicker(true)}
                className="w-full"
              >
                <div className="w-full px-4 py-3 rounded-lg border-2 border-border hover:border-primary/50 bg-card text-foreground font-medium transition-all text-left">
                  {dateRangeDisplay}
                </div>
              </motion.button>
            )}
          </motion.div>

          {/* Interests */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <label className="block text-sm font-semibold mb-3">Interests</label>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <motion.button
                  key={interest}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInterestToggle(interest)}
                  disabled={isUpdating}
                >
                  <Badge
                    variant={
                      (localPrefs.interests || []).includes(interest)
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer h-8"
                  >
                    {interest}
                  </Badge>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Ready Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-4 border-t border-border/30"
      >
        <Button
          onClick={() => setReady(!currentPlayer?.isReady)}
          size="lg"
          className="w-full"
          variant={currentPlayer?.isReady ? 'secondary' : 'default'}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Updating...
            </>
          ) : currentPlayer?.isReady ? (
            '✓ Ready - Click to unready'
          ) : (
            'Mark as Ready'
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {currentPlayer?.isReady
            ? 'You are ready for analysis'
            : 'Finalize your preferences and click ready'}
        </p>
      </motion.div>

      {/* Updating Indicator */}
      {isUpdating && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="animate-pulse">Syncing with other players...</div>
        </div>
      )}
    </Card>
  );
}
