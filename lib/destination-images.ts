/**
 * Fetch real destination images from Pexels instead of generating AI images
 */

import { fetchPexelsImages } from './pexels-service';

const COUNTRY_SEARCH_QUERIES: Record<string, string> = {
  'Japan': 'Japan travel tourism landmark',
  'Spain': 'Spain travel tourism architecture',
  'France': 'France Paris travel landmark',
  'Italy': 'Italy Rome travel architecture',
  'Germany': 'Germany travel culture',
  'Thailand': 'Thailand travel tourism beach',
  'Mexico': 'Mexico travel tourism architecture',
  'Brazil': 'Brazil travel tourism nature',
  'South Korea': 'South Korea travel tourism',
  'India': 'India travel tourism culture',
  'Australia': 'Australia travel tourism nature',
  'New Zealand': 'New Zealand travel tourism landscape',
  'Canada': 'Canada travel tourism nature',
  'United States': 'USA travel tourism landscape',
  'United Kingdom': 'UK travel tourism architecture',
  'Netherlands': 'Netherlands travel tourism',
  'Switzerland': 'Switzerland travel tourism mountain',
  'Austria': 'Austria travel tourism',
  'Greece': 'Greece travel tourism island',
  'Portugal': 'Portugal travel tourism',
  'Turkey': 'Turkey travel tourism',
  'Egypt': 'Egypt travel tourism pyramid',
  'Morocco': 'Morocco travel tourism',
  'South Africa': 'South Africa travel tourism',
  'Vietnam': 'Vietnam travel tourism',
  'Cambodia': 'Cambodia travel tourism',
  'Indonesia': 'Indonesia travel tourism Bali',
  'Malaysia': 'Malaysia travel tourism',
  'Philippines': 'Philippines travel tourism beach',
  'China': 'China travel tourism landscape',
  'Singapore': 'Singapore travel tourism',
  'Hong Kong': 'Hong Kong travel tourism',
  'Sri Lanka': 'Sri Lanka travel tourism',
  'Chile': 'Chile travel tourism landscape',
  'Argentina': 'Argentina travel tourism',
  'Peru': 'Peru travel tourism Machu Picchu',
  'Colombia': 'Colombia travel tourism',
  'Costa Rica': 'Costa Rica travel tourism nature',
  'Jamaica': 'Jamaica travel tourism beach',
  'Iceland': 'Iceland travel tourism landscape',
  'Norway': 'Norway travel tourism fjord',
  'Sweden': 'Sweden travel tourism',
  'Denmark': 'Denmark travel tourism',
};

/**
 * Get a representative image for a destination country
 */
export async function getDestinationImage(countryName: string): Promise<string | null> {
  try {
    const searchQuery = COUNTRY_SEARCH_QUERIES[countryName] || `${countryName} travel tourism destination`;
    
    const response = await fetchPexelsImages(searchQuery, 1);
    
    if (response.photos && response.photos.length > 0) {
      return response.photos[0].src.large;
    }
    
    // Fallback to generic travel image
    return null;
  } catch (error) {
    console.error(`[v0] Error fetching image for ${countryName}:`, error);
    return null;
  }
}

/**
 * Fetch images for multiple destinations in parallel
 */
export async function getDestinationImages(countryNames: string[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};
  
  const promises = countryNames.map(async (country) => {
    try {
      const imageUrl = await getDestinationImage(country);
      results[country] = imageUrl;
    } catch (error) {
      console.error(`[v0] Error fetching image for ${country}:`, error);
      results[country] = null;
    }
  });
  
  await Promise.all(promises);
  return results;
}
