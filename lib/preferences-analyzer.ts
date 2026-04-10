/**
 * Analyzes user preferences from uploaded images
 * Extracts common themes and travel style indicators
 */

import { ImageMetadata } from './image-generator';

export interface UserPreferences {
  moods: Map<string, number>;
  climates: Map<string, number>;
  environments: Map<string, number>;
  activityLevels: Map<string, number>;
  foodStyles: Map<string, number>;
  tags: Map<string, number>;
}

export interface PreferenceProfile {
  dominantMood: string;
  preferredClimate: string;
  preferredEnvironment: string;
  activityLevel: 'low' | 'medium' | 'high';
  foodPreferences: string[];
  allTags: string[];
}

/**
 * Analyze multiple images to extract user preferences
 */
export function analyzePreferences(imageMetadataList: ImageMetadata[]): UserPreferences {
  const preferences: UserPreferences = {
    moods: new Map(),
    climates: new Map(),
    environments: new Map(),
    activityLevels: new Map(),
    foodStyles: new Map(),
    tags: new Map(),
  };

  for (const metadata of imageMetadataList) {
    // Count moods
    incrementMap(preferences.moods, metadata.mood);

    // Count climates
    incrementMap(preferences.climates, metadata.climate);

    // Count environments
    incrementMap(preferences.environments, metadata.environment);

    // Count activity levels
    incrementMap(preferences.activityLevels, metadata.activity_level);

    // Count food styles
    incrementMap(preferences.foodStyles, metadata.food_style);

    // Count tags
    for (const tag of metadata.tags) {
      incrementMap(preferences.tags, tag);
    }
  }

  return preferences;
}

/**
 * Create a user profile from preferences
 */
export function createPreferenceProfile(preferences: UserPreferences): PreferenceProfile {
  return {
    dominantMood: getMostCommon(preferences.moods) || 'adventure',
    preferredClimate: getMostCommon(preferences.climates) || 'temperate',
    preferredEnvironment: getMostCommon(preferences.environments) || 'nature',
    activityLevel: (getMostCommon(preferences.activityLevels) as 'low' | 'medium' | 'high') || 'medium',
    foodPreferences: getTopN(preferences.foodStyles, 3),
    allTags: getTopN(preferences.tags, 10),
  };
}

/**
 * Helper: increment a map counter
 */
function incrementMap(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) || 0) + 1);
}

/**
 * Helper: get most common item from map
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
 * Helper: get top N items from map by frequency
 */
function getTopN(map: Map<string, number>, n: number): string[] {
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([key]) => key);
}

/**
 * Match preference aspect with a value
 * Returns a boolean indicating if there's a match
 */
export function matchesPreference(preference: string, value: string): boolean {
  // Normalize comparison
  const pref = preference.toLowerCase().replace(/[-_]/g, '');
  const val = value.toLowerCase().replace(/[-_]/g, '');
  
  // Exact match or contains match
  return pref === val || pref.includes(val) || val.includes(pref);
}

/**
 * Get all user tags in lowercase for easier matching
 */
export function getNormalizedTags(profile: PreferenceProfile): string[] {
  return profile.allTags.map((tag) => tag.toLowerCase());
}
