/**
 * Destination matching with weighted confidence scoring
 * Calculates compatibility between user preferences and countries
 * 
 * Scoring weights:
 * - Activity Level: 40%
 * - Climate: 30%
 * - Mood: 20%
 * - Food Style: 10%
 */

import { PreferenceProfile } from './preferences-analyzer';

export interface DestinationMatch {
  countryCode: string;
  countryName: string;
  confidenceScore: number; // 0-100
  scoreBreakdown: ScoreBreakdown;
  positives: string[];
  negatives: string[];
  climate: string;
  activities: string[];
  foodHighlights: string[];
  hotels: HotelSuggestion[];
}

export interface ScoreBreakdown {
  activityScore: number;
  climateScore: number;
  moodScore: number;
  foodScore: number;
}

export interface HotelSuggestion {
  name: string;
  style: 'budget' | 'mid-range' | 'luxury';
  activity_level: string;
}

// Weights for scoring (must total 100)
const WEIGHTS = {
  ACTIVITY: 0.4,
  CLIMATE: 0.3,
  MOOD: 0.2,
  FOOD: 0.1,
};

// Country profiles with activities, climate, food, and hotel options
const COUNTRY_PROFILES: Record<string, CountryProfile> = {
  US: {
    name: 'United States',
    climate: 'varied',
    activities: ['hiking', 'beach', 'cultural', 'adventure', 'nightlife'],
    activities_by_mood: {
      calm: ['national_parks', 'nature_retreats'],
      adventurous: ['rock_climbing', 'surfing', 'skydiving'],
      cultural: ['museums', 'galleries', 'historical_sites'],
      luxury: ['fine_dining', 'spas', 'resorts'],
    },
    food_styles: ['burgers', 'bbq', 'mexican', 'asian_fusion', 'farm_to_table'],
    food_match: ['casual', 'fine_dining'],
    hotels: [
      { name: 'Motel 6', style: 'budget', activity_level: 'adventure' },
      { name: 'Marriott', style: 'mid-range', activity_level: 'mixed' },
      { name: 'Four Seasons', style: 'luxury', activity_level: 'relaxation' },
    ],
  },
  JP: {
    name: 'Japan',
    climate: 'temperate',
    activities: ['cultural', 'hiking', 'food', 'technology', 'nightlife'],
    activities_by_mood: {
      calm: ['temples', 'gardens', 'tea_ceremonies'],
      adventurous: ['mountain_trekking', 'skiing'],
      cultural: ['shrine_visits', 'art_museums', 'traditions'],
      luxury: ['kaiseki_dining', 'onsen_resorts'],
    },
    food_styles: ['sushi', 'ramen', 'tempura', 'street_food', 'fine_dining'],
    food_match: ['seafood', 'traditional'],
    hotels: [
      { name: 'Business Hotel', style: 'budget', activity_level: 'exploration' },
      { name: 'Mitsui Garden', style: 'mid-range', activity_level: 'mixed' },
      { name: 'Hyatt Centric', style: 'luxury', activity_level: 'cultural' },
    ],
  },
  TH: {
    name: 'Thailand',
    climate: 'tropical',
    activities: ['beach', 'culture', 'food', 'diving', 'nightlife'],
    activities_by_mood: {
      calm: ['beach_relaxation', 'spa', 'meditation'],
      adventurous: ['rock_climbing', 'jungle_trekking', 'diving'],
      cultural: ['temple_tours', 'local_villages'],
      luxury: ['private_beach', 'spa_resorts'],
    },
    food_styles: ['pad_thai', 'street_food', 'seafood', 'thai_curry', 'tropical_fruits'],
    food_match: ['street_food', 'seafood'],
    hotels: [
      { name: 'Hostel Bangkok', style: 'budget', activity_level: 'nightlife' },
      { name: 'Centara Grand', style: 'mid-range', activity_level: 'mixed' },
      { name: 'Mandarin Oriental', style: 'luxury', activity_level: 'relaxation' },
    ],
  },
  FR: {
    name: 'France',
    climate: 'temperate',
    activities: ['food', 'cultural', 'wine', 'countryside', 'art'],
    activities_by_mood: {
      calm: ['countryside_walks', 'wine_tasting', 'museums'],
      adventurous: ['hiking', 'cycling'],
      cultural: ['art_galleries', 'historical_monuments', 'theater'],
      luxury: ['michelin_dining', 'spa', 'gardens'],
    },
    food_styles: ['french_cuisine', 'wine', 'cheese', 'patisserie', 'fine_dining'],
    food_match: ['fine_dining', 'traditional'],
    hotels: [
      { name: 'Ibis', style: 'budget', activity_level: 'sightseeing' },
      { name: 'Sofitel', style: 'mid-range', activity_level: 'mixed' },
      { name: 'Ritz', style: 'luxury', activity_level: 'fine_dining' },
    ],
  },
  AU: {
    name: 'Australia',
    climate: 'tropical',
    activities: ['beach', 'outdoor', 'diving', 'hiking', 'wildlife'],
    activities_by_mood: {
      calm: ['beach_relaxation', 'wildlife_watching'],
      adventurous: ['surfing', 'skydiving', 'rock_climbing'],
      cultural: ['aboriginal_tours', 'museums'],
      luxury: ['resort_stays', 'fine_dining'],
    },
    food_styles: ['fresh_seafood', 'bbq', 'cafe_culture', 'native_ingredients', 'wine'],
    food_match: ['seafood', 'casual'],
    hotels: [
      { name: 'Backpackers', style: 'budget', activity_level: 'adventure' },
      { name: 'Hilton', style: 'mid-range', activity_level: 'mixed' },
      { name: 'Park Hyatt', style: 'luxury', activity_level: 'relaxation' },
    ],
  },
  ES: {
    name: 'Spain',
    climate: 'mediterranean',
    activities: ['beach', 'cultural', 'food', 'art', 'nightlife'],
    activities_by_mood: {
      calm: ['beach_relaxation', 'wine_tasting', 'museums'],
      adventurous: ['hiking', 'water_sports'],
      cultural: ['flamenco', 'architecture', 'museums'],
      luxury: ['resort', 'fine_dining'],
    },
    food_styles: ['paella', 'tapas', 'sangria', 'seafood', 'mediterranean'],
    food_match: ['traditional', 'fine_dining'],
    hotels: [
      { name: 'Hostal', style: 'budget', activity_level: 'nightlife' },
      { name: 'AC Hotels', style: 'mid-range', activity_level: 'mixed' },
      { name: 'Mandarin Oriental', style: 'luxury', activity_level: 'cultural' },
    ],
  },
  IT: {
    name: 'Italy',
    climate: 'mediterranean',
    activities: ['cultural', 'food', 'art', 'beach', 'hiking'],
    activities_by_mood: {
      calm: ['countryside_walks', 'wine_tasting', 'museums'],
      adventurous: ['hiking', 'water_sports'],
      cultural: ['monuments', 'galleries', 'architecture'],
      luxury: ['gondola_rides', 'fine_dining'],
    },
    food_styles: ['pasta', 'pizza', 'italian_cuisine', 'wine', 'gelato'],
    food_match: ['fine_dining', 'traditional'],
    hotels: [
      { name: 'Ostello', style: 'budget', activity_level: 'sightseeing' },
      { name: 'NH Hotels', style: 'mid-range', activity_level: 'mixed' },
      { name: 'Four Seasons', style: 'luxury', activity_level: 'cultural' },
    ],
  },
  BR: {
    name: 'Brazil',
    climate: 'tropical',
    activities: ['beach', 'culture', 'nightlife', 'nature', 'sports'],
    activities_by_mood: {
      calm: ['beach_relaxation', 'nature_walks'],
      adventurous: ['surfing', 'hiking', 'water_sports'],
      cultural: ['music', 'dance', 'museums'],
      luxury: ['resort', 'fine_dining'],
    },
    food_styles: ['brazilian_bbq', 'seafood', 'tropical_fruits', 'street_food', 'acai'],
    food_match: ['casual', 'fine_dining'],
    hotels: [
      { name: 'Hostel', style: 'budget', activity_level: 'nightlife' },
      { name: 'Windsor', style: 'mid-range', activity_level: 'mixed' },
      { name: 'Copacabana Palace', style: 'luxury', activity_level: 'relaxation' },
    ],
  },
  MX: {
    name: 'Mexico',
    climate: 'tropical',
    activities: ['beach', 'culture', 'adventure', 'food', 'nightlife'],
    activities_by_mood: {
      calm: ['beach_relaxation', 'spa', 'meditation'],
      adventurous: ['cenote_diving', 'hiking', 'water_sports'],
      cultural: ['ruins', 'museums', 'local_villages'],
      luxury: ['resort', 'fine_dining'],
    },
    food_styles: ['tacos', 'ceviche', 'mole', 'street_food', 'tropical_fruits'],
    food_match: ['street_food', 'casual'],
    hotels: [
      { name: 'Budget Resort', style: 'budget', activity_level: 'adventure' },
      { name: 'Grand Palladium', style: 'mid-range', activity_level: 'mixed' },
      { name: 'Four Seasons', style: 'luxury', activity_level: 'relaxation' },
    ],
  },
  IN: {
    name: 'India',
    climate: 'tropical',
    activities: ['cultural', 'food', 'adventure', 'spiritual', 'nature'],
    activities_by_mood: {
      calm: ['meditation', 'yoga', 'temples'],
      adventurous: ['trekking', 'water_sports', 'wildlife'],
      cultural: ['historical_sites', 'museums', 'festivals'],
      luxury: ['palace_hotels', 'fine_dining'],
    },
    food_styles: ['curry', 'street_food', 'vegetarian', 'tandoori', 'indian_sweets'],
    food_match: ['street_food', 'traditional'],
    hotels: [
      { name: 'Budget Hotel', style: 'budget', activity_level: 'exploration' },
      { name: 'Taj Hotels', style: 'mid-range', activity_level: 'mixed' },
      { name: 'Oberoi', style: 'luxury', activity_level: 'cultural' },
    ],
  },
};

interface CountryProfile {
  name: string;
  climate: string;
  activities: string[];
  activities_by_mood: Record<string, string[]>;
  food_styles: string[];
  food_match: string[];
  hotels: HotelSuggestion[];
}

/**
 * Score a single aspect: activity, climate, mood, or food
 * Returns score 0-100 based on how many preferences match
 * Scores are normalized to 60-95 range for realistic travel matching
 */
function scoreAspect(
  userPreferences: string[],
  countryOptions: string[],
  aspectName: string
): number {
  if (userPreferences.length === 0 || countryOptions.length === 0) {
    return 75; // Baseline score (middle of range)
  }

  let matches = 0;
  const validPreferences = userPreferences.filter(p => p && p.length > 0);
  
  if (validPreferences.length === 0) {
    return 75; // Baseline score
  }

  for (const userPref of validPreferences) {
    for (const countryOpt of countryOptions) {
      if (
        userPref.toLowerCase().includes(countryOpt.toLowerCase()) ||
        countryOpt.toLowerCase().includes(userPref.toLowerCase())
      ) {
        matches++;
        break; // Count each user preference only once
      }
    }
  }

  // Calculate percentage: (matches / preferences) * 100
  // Then normalize to 60-95 range for realistic travel scores
  const matchPercentage = (matches / validPreferences.length) * 100;
  const normalizedScore = 60 + (matchPercentage * 0.35); // 60-95 range
  
  return Math.min(95, Math.round(normalizedScore));
}

/**
 * Match destinations based on user preferences
 * Returns array of country matches sorted by confidence score
 */
export function matchDestinations(profile: PreferenceProfile): DestinationMatch[] {
  const matches: DestinationMatch[] = [];

  for (const [countryCode, countryProfile] of Object.entries(COUNTRY_PROFILES)) {
    // Score each aspect
    const activityScore = scoreAspect(
      [profile.activityLevel, ...profile.allTags],
      countryProfile.activities,
      'activity'
    );

    const climateScore = scoreAspect(
      [profile.preferredClimate],
      [countryProfile.climate],
      'climate'
    );

    const moodScore = scoreAspect(
      [profile.dominantMood],
      Object.keys(countryProfile.activities_by_mood),
      'mood'
    );

    const foodScore = scoreAspect(
      profile.foodPreferences,
      countryProfile.food_styles,
      'food'
    );

    // Calculate weighted confidence score (ensure it stays 60-95%)
    const weightedScore = 
      activityScore * WEIGHTS.ACTIVITY +
      climateScore * WEIGHTS.CLIMATE +
      moodScore * WEIGHTS.MOOD +
      foodScore * WEIGHTS.FOOD;
    
    // Clamp to 60-95% range
    const confidenceScore = Math.round(Math.max(60, Math.min(95, weightedScore)));

    // Get appropriate activities for user's mood
    const moodActivities =
      countryProfile.activities_by_mood[profile.dominantMood] ||
      countryProfile.activities_by_mood['adventure'] ||
      [];

    // Create positives and negatives
    const positives: string[] = [];
    const negatives: string[] = [];

    if (activityScore >= 70) {
      positives.push(`Great activities for ${profile.activityLevel} activity level`);
    } else {
      negatives.push(`Limited ${profile.activityLevel} activity options`);
    }

    if (climateScore >= 70) {
      positives.push(`Ideal ${profile.preferredClimate} climate`);
    } else {
      negatives.push(`${countryProfile.climate} climate may not match preferences`);
    }

    if (foodScore >= 70) {
      positives.push('Excellent food scene matching preferences');
    } else {
      negatives.push('Limited matching food styles');
    }

    matches.push({
      countryCode,
      countryName: countryProfile.name,
      confidenceScore,
      scoreBreakdown: {
        activityScore,
        climateScore,
        moodScore,
        foodScore,
      },
      positives,
      negatives: negatives.slice(0, 2),
      climate: countryProfile.climate,
      activities: moodActivities.slice(0, 5),
      foodHighlights: countryProfile.food_styles.slice(0, 5),
      hotels: countryProfile.hotels,
    });
  }

  // Sort by confidence score descending
  return matches.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get top N destination matches with randomization
 * Results are shuffled to ensure variety on each request
 */
export function getTopDestinations(
  profile: PreferenceProfile,
  limit: number = 3
): DestinationMatch[] {
  const allMatches = matchDestinations(profile);
  
  // Shuffle all results to avoid same destinations every time
  const shuffled = shuffleArray(allMatches);
  
  // Return top matches by confidence score from shuffled list
  return shuffled
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, limit);
}
