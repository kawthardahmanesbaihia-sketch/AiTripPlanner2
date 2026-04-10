/**
 * Converts image category ratings to user travel preferences
 */

import { travelCategories } from './pexels-service';

export interface ImageRatings {
  [categoryId: string]: number; // 0-5 rating for each category
}

// Mapping of travel categories to preference attributes
const categoryToPreferences = {
  nature: {
    moods: ['relaxed', 'peaceful', 'contemplative'],
    climates: ['temperate', 'cool'],
    environments: ['nature', 'mountains', 'forests'],
    activityLevels: ['medium'],
    foodStyles: ['local', 'organic'],
    tags: ['scenic', 'nature', 'hiking', 'landscape'],
  },
  beaches: {
    moods: ['relaxed', 'fun', 'casual'],
    climates: ['tropical', 'warm'],
    environments: ['beach', 'coast', 'ocean'],
    activityLevels: ['low', 'medium'],
    foodStyles: ['seafood', 'casual'],
    tags: ['beach', 'ocean', 'relaxation', 'swimming'],
  },
  cities: {
    moods: ['energetic', 'adventurous', 'cultural'],
    climates: ['temperate', 'urban'],
    environments: ['urban', 'city', 'architecture'],
    activityLevels: ['high'],
    foodStyles: ['diverse', 'trendy', 'international'],
    tags: ['city', 'culture', 'architecture', 'nightlife', 'shopping'],
  },
  food: {
    moods: ['adventurous', 'curious'],
    climates: ['varied'],
    environments: ['restaurants', 'markets'],
    activityLevels: ['low', 'medium'],
    foodStyles: ['diverse', 'authentic', 'culinary'],
    tags: ['food', 'cuisine', 'dining', 'culinary', 'authentic'],
  },
  culture: {
    moods: ['contemplative', 'curious', 'adventurous'],
    climates: ['varied'],
    environments: ['historical', 'cultural', 'temples'],
    activityLevels: ['medium'],
    foodStyles: ['local', 'authentic'],
    tags: ['culture', 'history', 'heritage', 'tradition', 'art'],
  },
  adventure: {
    moods: ['adventurous', 'energetic', 'thrill-seeking'],
    climates: ['varied', 'cool'],
    environments: ['mountains', 'nature', 'extreme'],
    activityLevels: ['high'],
    foodStyles: ['energizing', 'practical'],
    tags: ['adventure', 'hiking', 'sports', 'extreme', 'active'],
  },
  luxury: {
    moods: ['relaxed', 'indulgent', 'romantic'],
    climates: ['tropical', 'warm', 'pleasant'],
    environments: ['resort', 'spa', 'upscale'],
    activityLevels: ['low'],
    foodStyles: ['fine-dining', 'gourmet'],
    tags: ['luxury', 'comfort', 'spa', 'upscale', 'romance'],
  },
  wildlife: {
    moods: ['adventurous', 'curious', 'peaceful'],
    climates: ['varied', 'tropical'],
    environments: ['nature', 'safari', 'wild'],
    activityLevels: ['medium', 'high'],
    foodStyles: ['local'],
    tags: ['wildlife', 'safari', 'nature', 'animals', 'adventure'],
  },
};

/**
 * Convert image category ratings to weighted preference maps
 */
export function convertRatingsToPreferences(ratings: ImageRatings) {
  const preferences = {
    moods: new Map<string, number>(),
    climates: new Map<string, number>(),
    environments: new Map<string, number>(),
    activityLevels: new Map<string, number>(),
    foodStyles: new Map<string, number>(),
    tags: new Map<string, number>(),
  };

  // For each category with a non-zero rating, add its associated preferences
  for (const [categoryId, rating] of Object.entries(ratings)) {
    if (rating === 0) continue;

    const categoryPrefs =
      categoryToPreferences[categoryId as keyof typeof categoryToPreferences];
    if (!categoryPrefs) continue;

    // Weight each preference by the category rating (1-5 scale)
    const weight = rating;

    categoryPrefs.moods.forEach((mood) => {
      preferences.moods.set(mood, (preferences.moods.get(mood) || 0) + weight);
    });

    categoryPrefs.climates.forEach((climate) => {
      preferences.climates.set(
        climate,
        (preferences.climates.get(climate) || 0) + weight
      );
    });

    categoryPrefs.environments.forEach((env) => {
      preferences.environments.set(
        env,
        (preferences.environments.get(env) || 0) + weight
      );
    });

    categoryPrefs.activityLevels.forEach((level) => {
      preferences.activityLevels.set(
        level,
        (preferences.activityLevels.get(level) || 0) + weight
      );
    });

    categoryPrefs.foodStyles.forEach((food) => {
      preferences.foodStyles.set(
        food,
        (preferences.foodStyles.get(food) || 0) + weight
      );
    });

    categoryPrefs.tags.forEach((tag) => {
      preferences.tags.set(tag, (preferences.tags.get(tag) || 0) + weight);
    });
  }

  return preferences;
}

/**
 * Get the most common item from a map
 */
function getMostCommon(map: Map<string, number>): string | null {
  if (map.size === 0) return null;
  let max = 0;
  let mostCommon = '';
  for (const [key, value] of map.entries()) {
    if (value > max) {
      max = value;
      mostCommon = key;
    }
  }
  return mostCommon;
}

/**
 * Get top N items from a map by value
 */
function getTopN(map: Map<string, number>, n: number): string[] {
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([key]) => key);
}

/**
 * Create a PreferenceProfile from image ratings
 */
export function createPreferenceProfileFromRatings(ratings: ImageRatings) {
  const preferences = convertRatingsToPreferences(ratings);

  return {
    dominantMood: getMostCommon(preferences.moods) || 'adventure',
    preferredClimate: getMostCommon(preferences.climates) || 'temperate',
    preferredEnvironment: getMostCommon(preferences.environments) || 'nature',
    activityLevel:
      (getMostCommon(preferences.activityLevels) as 'low' | 'medium' | 'high') || 'medium',
    foodPreferences: getTopN(preferences.foodStyles, 3),
    allTags: getTopN(preferences.tags, 10),
  };
}
