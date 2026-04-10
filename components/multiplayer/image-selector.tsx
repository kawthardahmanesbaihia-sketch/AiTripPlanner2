'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mountain,
  Building2,
  Activity,
  UtensilsCrossed,
  Waves,
  Landmark,
  Map,
  Sparkles,
  Zap,
  Crown,
  Loader2,
  Check,
} from 'lucide-react';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { useSingleMode } from '@/contexts/single-mode-context';

interface ImageItem {
  url: string
  source: 'ai'
  selected?: boolean
  tags?: string[]
  mood?: string
  climate?: string
  environment?: string
  activity_level?: string
  food_style?: string
  category?: string
}

interface AIImageCategory {
  id: string
  name: string
  icon: typeof Mountain
  color: string
}

interface ImageSelectorProps {
  mode?: 'multiplayer' | 'single';
}

export function ImageSelector({ mode = 'multiplayer' }: ImageSelectorProps) {
  const multiplayerContext = useMultiplayer();
  const singleModeContext = useSingleMode();
  
  const { preferences, updatePreferences } = 
    mode === 'single' && singleModeContext 
      ? singleModeContext 
      : multiplayerContext;
  const [categoryImages, setCategoryImages] = useState<Record<string, ImageItem[]>>({});
  const [loadingCategories, setLoadingCategories] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories: AIImageCategory[] = [
    { id: 'nature', name: 'Nature', icon: Mountain, color: 'from-green-400 to-emerald-600' },
    { id: 'city', name: 'City Style', icon: Building2, color: 'from-blue-400 to-blue-600' },
    { id: 'activities', name: 'Activities', icon: Activity, color: 'from-orange-400 to-red-600' },
    { id: 'food', name: 'Food', icon: UtensilsCrossed, color: 'from-pink-400 to-rose-600' },
    { id: 'beaches', name: 'Beaches', icon: Waves, color: 'from-cyan-400 to-blue-500' },
    { id: 'culture', name: 'Culture', icon: Landmark, color: 'from-amber-400 to-amber-600' },
    { id: 'hidden', name: 'Hidden Places', icon: Map, color: 'from-purple-400 to-purple-600' },
    { id: 'nightlife', name: 'Nightlife', icon: Sparkles, color: 'from-violet-400 to-purple-600' },
    { id: 'luxury', name: 'Luxury', icon: Crown, color: 'from-yellow-400 to-yellow-600' },
    { id: 'adventure', name: 'Adventure', icon: Zap, color: 'from-red-400 to-red-600' },
  ];

  const generateCategoryImages = async (categoryId: string) => {
    if (categoryImages[categoryId]?.length > 0) {
      return;
    }

    setLoadingCategories((prev) => ({ ...prev, [categoryId]: true }));

    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: categoryId,
          count: 4,
          sessionId: `${Date.now()}-${Math.random()}`,
          randomSeed: Math.random(),
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.images || !Array.isArray(data.images)) {
        console.error('[v0] Invalid API response - no images array:', data);
        setLoadingCategories((prev) => ({ ...prev, [categoryId]: false }));
        return;
      }

      const newImages: ImageItem[] = data.images.map(
        (img: {
          url: string;
          tags?: string[];
          mood?: string;
          climate?: string;
          environment?: string;
          activity_level?: string;
          food_style?: string;
          category?: string;
        }) => ({
          url: img.url,
          source: 'ai' as const,
          selected: false,
          tags: img.tags || [],
          mood: img.mood || 'neutral',
          climate: img.climate || 'temperate',
          environment: img.environment || 'urban',
          activity_level: img.activity_level || 'medium',
          food_style: img.food_style || 'casual',
          category: img.category || categoryId,
        }),
      );

      setCategoryImages((prev) => ({ ...prev, [categoryId]: newImages }));
    } catch (error) {
      console.error('[v0] Error generating category images:', error);
    } finally {
      setLoadingCategories((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  const toggleImageSelection = (categoryId: string, imageIndex: number) => {
    setCategoryImages((prev) => {
      const category = prev[categoryId] || [];
      const updated = [...category];
      updated[imageIndex] = {
        ...updated[imageIndex],
        selected: !updated[imageIndex].selected,
      };
      return { ...prev, [categoryId]: updated };
    });
  };

  // Sync selected images to preferences whenever they change
  useEffect(() => {
    const selectedImages = Object.entries(categoryImages)
      .flatMap(([_, images]) => images.filter((img) => img.selected))
      .map((img) => img.url);

    if (selectedImages.length > 0) {
      updatePreferences({ selectedImages });
    }
  }, [categoryImages, updatePreferences]);

  return (
    <Card className="border-2 bg-card/50 backdrop-blur-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-2">Select Images You Like</h2>
        <p className="text-sm text-muted-foreground">
          Browse and select images that match your travel style. Your selections sync with other players in real-time.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;
          const hasImages = (categoryImages[category.id] || []).length > 0;
          const isLoading = loadingCategories[category.id];

          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory(category.id);
                generateCategoryImages(category.id);
              }}
              className={`relative group transition-all ${
                activeCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div
                className={`p-4 rounded-lg bg-gradient-to-br ${category.color} text-white text-center cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col items-center justify-center gap-2`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-semibold">{category.name}</span>
                {hasImages && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {(categoryImages[category.id] || []).length}
                  </Badge>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Image Selection Grid */}
      {activeCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {categories.find((c) => c.id === activeCategory)?.name}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActiveCategory(null)}
            >
              Close
            </Button>
          </div>

          {loadingCategories[activeCategory] ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Loading images...
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              {(categoryImages[activeCategory] || []).map((image, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleImageSelection(activeCategory, idx)}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                    image.selected
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${activeCategory} ${idx}`}
                    className="h-32 w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Selection Badge */}
                  {image.selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-primary/30 flex items-center justify-center"
                    >
                      <Check className="h-6 w-6 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Selected:{' '}
            {(categoryImages[activeCategory] || []).filter((img) => img.selected)
              .length}{' '}
            image
            {(categoryImages[activeCategory] || []).filter((img) => img.selected)
              .length !== 1
              ? 's'
              : ''}
          </p>
        </motion.div>
      )}

      {/* Summary */}
      <div className="pt-4 border-t border-border/30">
        <p className="text-sm font-semibold mb-2">
          Total Selected:{' '}
          {Object.values(categoryImages)
            .flatMap((images) => images.filter((img) => img.selected))
            .length}{' '}
          Images
        </p>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{
              width: `${
                ((Object.values(categoryImages)
                  .flatMap((images) => images.filter((img) => img.selected))
                  .length || 0) /
                  (Object.values(categoryImages).flat().length || 1)) *
                100
              }%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </Card>
  );
}
