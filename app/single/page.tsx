'use client';
import { ImageFeed } from "@/components/image-feed"
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

  // ✅ FIX هنا (المهم)
  const handleAnalyze = async () => {
    if (!preferences.budget || !preferences.dateRange) {
      alert("Please select budget and date");
      return;
    }

    try {
      setIsUpdating(true);

      const fakeResults = {
        countries: [
          {
            name: "Japan",
            matchPercentage: 95,
            reason: "Perfect mix of culture, food, and modern cities.",
            image: "",
            tags: ["culture", "food", "city"],
            climate: "Temperate",
            vibe: "Cultural",
          },
          {
            name: "Switzerland",
            matchPercentage: 90,
            reason: "Amazing mountains and peaceful nature.",
            image: "",
            tags: ["nature", "mountains"],
            climate: "Cold",
            vibe: "Relaxing",
          },
          {
            name: "UAE",
            matchPercentage: 88,
            reason: "Luxury lifestyle with modern attractions.",
            image: "",
            tags: ["luxury", "city"],
            climate: "Hot",
            vibe: "Luxury",
          },
        ],
        summary:
          "These destinations match your preferences based on your budget and travel dates.",
      };

      // ✅ نحفظ البيانات
      sessionStorage.setItem("analysisResults", JSON.stringify(fakeResults));

      // ✅ نروح للصفحة
      router.push("/results");

    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
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
                <ImageFeed onImagesSelected={(imgs) => {
                  setPreferences((prev: any) => ({
                    ...prev,
                    selectedImages: imgs
                  }))
                }} />
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">

                {/* Budget */}
                <motion.div>
                  <label className="block text-sm font-semibold mb-2">Budget</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'standard', label: 'Standard' },
                      { value: 'premium', label: 'Premium' },
                      { value: 'luxury', label: 'Luxury' },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => handleBudgetSelect(option.value)}
                        className="relative"
                      >
                        <div
                          className={`px-3 py-2 rounded-lg border-2 font-medium ${
                            preferences.budget === option.value
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border'
                          }`}
                        >
                          {option.label}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Date */}
                <motion.div>
                  <label className="block text-sm font-semibold mb-2">Travel Dates</label>
                  {showDatePicker ? (
                    <DateRangePicker onDateRangeChange={handleDateRangeChange} />
                  ) : (
                    <button onClick={() => setShowDatePicker(true)} className="w-full">
                      <div className="w-full px-4 py-3 rounded-lg border-2">
                        {dateRangeDisplay}
                      </div>
                    </button>
                  )}
                </motion.div>

                {/* Interests */}
                <motion.div>
                  <label className="block text-sm font-semibold mb-3">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className="cursor-pointer"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </motion.div>

                {/* Button */}
                <div className="pt-4">
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
                </div>

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