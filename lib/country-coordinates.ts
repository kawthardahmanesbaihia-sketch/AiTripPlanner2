/**
 * Country coordinate mapping for geolocation-based event filtering
 * Stores center coordinates and useful metadata for each country
 */

export interface CountryCoordinates {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  latitude: number;
  longitude: number;
  radius: number; // Search radius in kilometers
}

export const COUNTRY_COORDINATES: Record<string, CountryCoordinates> = {
  US: {
    name: 'United States',
    code: 'US',
    latitude: 37.0902,
    longitude: -95.7129,
    radius: 200,
  },
  GB: {
    name: 'United Kingdom',
    code: 'GB',
    latitude: 55.3781,
    longitude: -3.436,
    radius: 150,
  },
  FR: {
    name: 'France',
    code: 'FR',
    latitude: 46.2276,
    longitude: 2.2137,
    radius: 150,
  },
  DE: {
    name: 'Germany',
    code: 'DE',
    latitude: 51.1657,
    longitude: 10.4515,
    radius: 150,
  },
  IT: {
    name: 'Italy',
    code: 'IT',
    latitude: 41.8719,
    longitude: 12.5674,
    radius: 150,
  },
  ES: {
    name: 'Spain',
    code: 'ES',
    latitude: 40.463667,
    longitude: -3.74922,
    radius: 150,
  },
  JP: {
    name: 'Japan',
    code: 'JP',
    latitude: 36.2048,
    longitude: 138.2529,
    radius: 200,
  },
  AU: {
    name: 'Australia',
    code: 'AU',
    latitude: -25.2744,
    longitude: 133.7751,
    radius: 250,
  },
  CA: {
    name: 'Canada',
    code: 'CA',
    latitude: 56.1304,
    longitude: -106.3468,
    radius: 250,
  },
  MX: {
    name: 'Mexico',
    code: 'MX',
    latitude: 23.6345,
    longitude: -102.5528,
    radius: 200,
  },
  BR: {
    name: 'Brazil',
    code: 'BR',
    latitude: -14.2350,
    longitude: -51.9253,
    radius: 250,
  },
  TH: {
    name: 'Thailand',
    code: 'TH',
    latitude: 15.870032,
    longitude: 100.992541,
    radius: 150,
  },
  SG: {
    name: 'Singapore',
    code: 'SG',
    latitude: 1.3521,
    longitude: 103.8198,
    radius: 100,
  },
  NZ: {
    name: 'New Zealand',
    code: 'NZ',
    latitude: -40.9006,
    longitude: 174.886,
    radius: 200,
  },
  KR: {
    name: 'South Korea',
    code: 'KR',
    latitude: 35.9078,
    longitude: 127.7669,
    radius: 150,
  },
  IN: {
    name: 'India',
    code: 'IN',
    latitude: 20.5937,
    longitude: 78.9629,
    radius: 250,
  },
};

/**
 * Get coordinates for a country by code
 */
export function getCountryCoordinates(countryCode: string): CountryCoordinates | null {
  return COUNTRY_COORDINATES[countryCode.toUpperCase()] || null;
}

/**
 * Get all available countries
 */
export function getAllCountries(): CountryCoordinates[] {
  return Object.values(COUNTRY_COORDINATES);
}

/**
 * Calculate distance between two lat/lng points in kilometers
 * Using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a point is within the search radius of a country
 */
export function isWithinCountryRadius(
  eventLat: number,
  eventLon: number,
  country: CountryCoordinates
): boolean {
  const distance = calculateDistance(
    eventLat,
    eventLon,
    country.latitude,
    country.longitude
  );
  return distance <= country.radius;
}
