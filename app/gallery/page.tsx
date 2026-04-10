'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/components/language-provider';
import { AnimatedBackgroundElements } from '@/components/animated-background-elements';
import { travelCategories, fetchAllCategoryImages } from '@/lib/pexels-service';
import { ImageGalleryCard } from '@/components/image-gallery-card';
import type { PexelsPhoto } from '@/lib/pexels-service';

interface CategoryPhotos {
  [key: string]: PexelsPhoto[];
}

export default function GalleryPage() {
  const [categoryPhotos, setCategoryPhotos] = useState<CategoryPhotos>({});
  const [ratings, setRatings] = useState<{ [photoId: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('nature');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();
  const { t, language } = useLanguage();

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      setIsLoading(true);
      const images = await fetchAllCategoryImages(20);
      setCategoryPhotos(images);
    } catch (error) {
      console.error('[v0] Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRatingChange(photoId: number, rating: number) {
    setRatings((prev) => ({
      ...prev,
      [photoId]: rating,
    }));
  }

  async function handleAnalyze() {
    // Convert photo IDs to category IDs with their average ratings
    const categoryRatings: { [key: string]: number } = {};

    for (const category of travelCategories) {
      const photos = categoryPhotos[category.id] || [];
      const photoRatings = photos
        .map((photo) => ratings[photo.id] || 0)
        .filter((r) => r > 0);

      if (photoRatings.length > 0) {
        const avgRating =
          photoRatings.reduce((a, b) => a + b, 0) / photoRatings.length;
        categoryRatings[category.id] = Math.round(avgRating);
      } else {
        categoryRatings[category.id] = 0;
      }
    }

    // Check if user has rated at least some images
    const hasRatings = Object.values(categoryRatings).some((r) => r > 0);
    if (!hasRatings) {
      alert('Please rate at least some images to get recommendations');
      return;
    }

    try {
      setIsAnalyzing(true);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageRatings: categoryRatings,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze preferences');
      }

      const data = await response.json();
      console.log('[v0] Analysis response:', data);

      // Navigate to results page
      router.push(`/results?seed=${data.requestSeed}`);
    } catch (error) {
      console.error('[v0] Error analyzing preferences:', error);
      alert('Failed to analyze your preferences. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <AnimatedBackgroundElements />
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading travel inspiration...</p>
        </div>
      </div>
    );
  }

  const currentPhotos = categoryPhotos[activeCategory] || [];
  const ratedCount = Object.values(ratings).filter((r) => r > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AnimatedBackgroundElements />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Rate Your Travel Style
          </h1>
          <p className="text-gray-600">
            Rate images from different travel categories to discover your perfect destination
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-medium">
            <span>{ratedCount} images rated</span>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {travelCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
        >
          {currentPhotos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ImageGalleryCard
                photo={photo}
                rating={ratings[photo.id] || 0}
                onRatingChange={(rating) =>
                  handleRatingChange(photo.id, rating)
                }
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 sticky bottom-4 justify-center"
        >
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || ratedCount === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full font-semibold flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Get Recommendations
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
