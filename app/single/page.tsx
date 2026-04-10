'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';
import { AnimatedBackgroundElements } from '@/components/animated-background-elements';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { ImageSelector } from '@/components/multiplayer/image-selector';
import { SingleModeProvider } from '@/contexts/single-mode-context';

function SingleModePageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<any>({
    budget: '',
    dateRange: null,
    interests: [],
    selectedImages: [],
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleBudgetSelect = (budget: string) => {
    setPreferences((prev: any) => ({ ...prev, budget }));
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setPreferences((prev: any) => ({
      ...prev,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    }));
    setShowDatePicker(false);
  };

  const handleInterestToggle = (interest: string) => {
    setPreferences((prev: any) => {
      const interests = prev.interests || [];
      return {
        ...prev,
        interests: interests.includes(interest)
          ? interests.filter((i: string) => i !== interest)
          : [...interests, interest],
      };
    });
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

  const dateRangeDisplay = preferences.dateRange
    ? `${new Date(preferences.dateRange.start).toDateString()} → ${new Date(
        preferences.dateRange.end,
      ).toDateString()}`
    : 'Select dates';

  const handleAnalyze = async () => {
    // TODO: Implement analysis for single mode
    console.log('Analyzing preferences:', preferences);
  };

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
            Plan Your Trip
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Set your preferences and let AI find the perfect destination for you.
          </p>
        </motion.div>

        {/* Preferences Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-2 bg-card/50 backdrop-blur-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Your Preferences</h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4">
                <ImageSelector mode="single" />
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
                            preferences.budget === option.value
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
                      <Badge
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        variant={
                          preferences.interests?.includes(interest)
                            ? 'default'
                            : 'outline'
                        }
                        className="cursor-pointer transition-all"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </motion.div>

                {/* Analyze Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4"
                >
                  <Button
                    onClick={handleAnalyze}
                    disabled={isUpdating || !preferences.budget || !preferences.dateRange}
                    size="lg"
                    className="w-full"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Find Destinations'
                    )}
                  </Button>
                </motion.div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function SingleModePage() {
  return (
    <SingleModeProvider>
      <SingleModePageContent />
    </SingleModeProvider>
  );
}
