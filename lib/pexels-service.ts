const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
  page: number;
  per_page: number;
  next_page: string;
}

export const travelCategories = [
  { id: 'nature', label: 'Nature & Landscapes', query: 'mountain nature landscape scenic' },
  { id: 'beaches', label: 'Beaches & Coasts', query: 'beach ocean coastal paradise' },
  { id: 'cities', label: 'Cities & Urban', query: 'city urban architecture skyline' },
  { id: 'food', label: 'Food & Cuisine', query: 'food cuisine dining restaurant culinary' },
  { id: 'culture', label: 'Culture & History', query: 'culture history temple monument heritage' },
  { id: 'adventure', label: 'Adventure & Activities', query: 'adventure hiking skiing water sports extreme' },
  { id: 'luxury', label: 'Luxury & Comfort', query: 'luxury resort spa upscale elegant' },
  { id: 'wildlife', label: 'Wildlife & Nature', query: 'wildlife safari animals nature reserve' },
];

export async function fetchPexelsImages(
  query: string,
  perPage: number = 20,
  page: number = 1
): Promise<PexelsResponse> {
  if (!PEXELS_API_KEY) {
    throw new Error('PEXELS_API_KEY is not configured');
  }

  const params = new URLSearchParams({
    query,
    per_page: perPage.toString(),
    page: page.toString(),
  });

  const response = await fetch(`${PEXELS_BASE_URL}/search?${params}`, {
    headers: {
      Authorization: PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCategoryImages(
  categoryId: string,
  perPage: number = 20
): Promise<PexelsPhoto[]> {
  const category = travelCategories.find((cat) => cat.id === categoryId);
  if (!category) {
    throw new Error(`Unknown category: ${categoryId}`);
  }

  const response = await fetchPexelsImages(category.query, perPage);
  return response.photos;
}

export async function fetchAllCategoryImages(
  perPage: number = 15
): Promise<Record<string, PexelsPhoto[]>> {
  const results: Record<string, PexelsPhoto[]> = {};

  const promises = travelCategories.map((category) =>
    fetchCategoryImages(category.id, perPage).then((photos) => {
      results[category.id] = photos;
    })
  );

  await Promise.all(promises);
  return results;
}
