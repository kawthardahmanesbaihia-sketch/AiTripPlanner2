import { type NextRequest, NextResponse } from 'next/server';
import { getTopDestinations } from '@/lib/destination-matcher';
import { generateSeed, shuffleArrayWithSeed } from '@/lib/seed-randomizer';
import type { SharedPreferences } from '@/lib/firebase-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Create a preference profile from collaborative shared preferences
 */
function createProfileFromSharedPreferences(prefs: SharedPreferences) {
  return {
    dominantMood: 'adventurous',
    preferredClimate: prefs.budget === 'luxury' ? 'tropical' : 'temperate',
    preferredEnvironment: 'mixed',
    activityLevel: prefs.budget === 'low' ? 'low' : 'high',
    foodPreferences: ['international', 'local'],
    allTags: Array.isArray(prefs.interests) ? prefs.interests : [],
  };
}

/**
 * Generate summary based on collaborative preferences
 */
function generateMultiplayerSummary(
  destinations: any[],
  playerCount: number,
  interests: string[],
): string {
  const topDest = destinations[0];
  const interestList =
    interests.length > 0
      ? `including ${interests.slice(0, 3).join(', ')},`
      : '';

  return `Based on ${playerCount} ${playerCount === 1 ? 'player' : 'players'} collaborative preferences ${interestList} ${topDest.countryName} is perfectly matched for your group. This destination offers diverse experiences for all group members. Plan for several days to fully explore what ${topDest.countryName} has to offer everyone in your party.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences, playerCount = 1 } = body;

    if (!preferences) {
      return NextResponse.json(
        { error: 'No preferences provided' },
        { status: 400 },
      );
    }

    console.log('[v0] Multiplayer analyze request', {
      playerCount,
      hasDestination: !!preferences.destination,
      hasBudget: !!preferences.budget,
      interestCount: Array.isArray(preferences.interests)
        ? preferences.interests.length
        : 0,
    });

    // Create preference profile from shared preferences
    const profile = createProfileFromSharedPreferences(preferences);

    // Get top destination matches
    let topDestinations = getTopDestinations(profile, 10);

    // Shuffle results using fresh seed
    const requestSeed = generateSeed();
    topDestinations = shuffleArrayWithSeed(topDestinations, requestSeed);

    // Take only top 3
    topDestinations = topDestinations.slice(0, 3);

    // Validate and enhance destinations
    const validatedDestinations = topDestinations.map((dest, index) => ({
      ...dest,
      confidenceScore: Math.max(
        60,
        Math.min(95, dest.confidenceScore + index * 2),
      ),
    }));

    // Format response
    const response = {
      requestSeed,
      userProfile: {
        dominantMood: profile.dominantMood,
        preferredClimate: profile.preferredClimate,
        preferredEnvironment: profile.preferredEnvironment,
        activityLevel: profile.activityLevel,
        foodPreferences: profile.foodPreferences,
        collaborative: true,
        playerCount,
      },
      countries: validatedDestinations.map((dest) => ({
        name: dest.countryName,
        code: dest.countryCode,
        matchPercentage: dest.confidenceScore,
        confidenceBreakdown: {
          activity: dest.scoreBreakdown.activityScore,
          climate: dest.scoreBreakdown.climateScore,
          mood: dest.scoreBreakdown.moodScore,
          food: dest.scoreBreakdown.foodScore,
        },
        positives: dest.positives,
        negatives: dest.negatives,
        climate: dest.climate,
        activities: dest.activities,
        foodHighlights: dest.foodHighlights,
        hotels: dest.hotels.map((h) => ({
          name: h.name,
          style: h.style,
          activity_level: h.activity_level,
        })),
      })),
      summary: generateMultiplayerSummary(
        validatedDestinations,
        playerCount,
        Array.isArray(preferences.interests) ? preferences.interests : [],
      ),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('[v0] Error in multiplayer analyze API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze collaborative preferences' },
      { status: 500 },
    );
  }
}
