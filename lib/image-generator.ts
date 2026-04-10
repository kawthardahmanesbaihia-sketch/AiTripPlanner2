/**
 * Image Generation using Google Imagen API
 * Generates images with structured metadata for preference analysis
 */

export interface GeneratedImage {
  url: string;
  prompt: string;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  tags: string[];
  mood: string; // calm, adventurous, cultural, luxury, etc.
  climate: string; // tropical, temperate, cold, desert, etc.
  environment: string; // urban, nature, beach, mountain, etc.
  activity_level: 'low' | 'medium' | 'high';
  food_style: string; // fine_dining, street_food, vegetarian, seafood, etc.
}

// Fallback curated images with metadata
const FALLBACK_IMAGES: GeneratedImage[] = [
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    prompt: 'Mountain hiking adventure landscape',
    metadata: {
      tags: ['hiking', 'mountain', 'adventure', 'nature'],
      mood: 'adventurous',
      climate: 'cold',
      environment: 'mountain',
      activity_level: 'high',
      food_style: 'casual',
    },
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    prompt: 'Beach tropical paradise',
    metadata: {
      tags: ['beach', 'tropical', 'relax', 'water'],
      mood: 'calm',
      climate: 'tropical',
      environment: 'beach',
      activity_level: 'low',
      food_style: 'seafood',
    },
  },
  {
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
    prompt: 'Vibrant city nightlife',
    metadata: {
      tags: ['nightlife', 'city', 'culture', 'urban'],
      mood: 'adventurous',
      climate: 'temperate',
      environment: 'urban',
      activity_level: 'high',
      food_style: 'fine_dining',
    },
  },
  {
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    prompt: 'Scenic country landscape',
    metadata: {
      tags: ['nature', 'landscape', 'peaceful', 'countryside'],
      mood: 'calm',
      climate: 'temperate',
      environment: 'nature',
      activity_level: 'medium',
      food_style: 'traditional',
    },
  },
  {
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
    prompt: 'Luxury resort dining',
    metadata: {
      tags: ['luxury', 'dining', 'resort', 'vacation'],
      mood: 'calm',
      climate: 'tropical',
      environment: 'resort',
      activity_level: 'low',
      food_style: 'fine_dining',
    },
  },
];

/**
 * Generate images using Google Imagen API
 * Falls back to curated images if API is unavailable
 */
export async function generateImages(
  prompt: string,
  count: number = 3
): Promise<GeneratedImage[]> {
  try {
    const apiKey = process.env.GOOGLE_IMAGEN_API_KEY;
    
    if (!apiKey) {
      console.log('[Image Generator] Google Imagen API key not configured, using fallback images');
      return FALLBACK_IMAGES.slice(0, count);
    }

    console.log('[Image Generator] Calling Google Imagen API with prompt:', prompt);

    // Make request to Google Imagen API using the correct endpoint
    const enrichedPrompt = buildEnrichedPrompt(prompt);
    
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/files:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: enrichedPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Image Generator] API error response:', errorData);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[Image Generator] API response received:', { hasContent: !!data.candidates });

    // Parse the generated images from the response
    const generatedImages = parseImageResponse(data, prompt, count);
    
    if (generatedImages.length > 0) {
      return generatedImages;
    }
    
    // If parsing failed, return variations with fallback
    return generateImageVariations(prompt, count);
  } catch (error) {
    console.error('[Image Generator] Error calling API:', error);
    console.log('[Image Generator] Falling back to curated images');
    // Fallback to curated images on error
    return FALLBACK_IMAGES.slice(0, count);
  }
}

/**
 * Parse the Google Imagen API response and extract image URLs
 */
function parseImageResponse(
  response: any,
  prompt: string,
  count: number
): GeneratedImage[] {
  try {
    const candidates = response.candidates || [];
    
    if (candidates.length === 0) {
      console.warn('[Image Generator] No candidates in API response');
      return [];
    }

    const images: GeneratedImage[] = [];
    
    for (const candidate of candidates.slice(0, count)) {
      const content = candidate.content || {};
      const parts = content.parts || [];
      
      for (const part of parts) {
        // Check if response contains image data
        if (part.inline_data && part.inline_data.mime_type?.includes('image')) {
          // For inline image data, create a data URL
          const dataUrl = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
          images.push({
            url: dataUrl,
            prompt: prompt,
            metadata: extractMetadataFromPrompt(prompt),
          });
        } else if (part.text) {
          // Sometimes API returns image URLs in text
          const urlMatch = part.text.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            images.push({
              url: urlMatch[0],
              prompt: prompt,
              metadata: extractMetadataFromPrompt(prompt),
            });
          }
        }
      }
    }

    return images;
  } catch (error) {
    console.error('[Image Generator] Error parsing response:', error);
    return [];
  }
}

/**
 * Extract metadata directly from the prompt text
 */
function extractMetadataFromPrompt(prompt: string): ImageMetadata {
  const promptLower = prompt.toLowerCase();
  
  // Infer metadata from prompt keywords
  let mood = 'calm';
  let climate = 'temperate';
  let environment = 'nature';
  let activityLevel: 'low' | 'medium' | 'high' = 'medium';
  let foodStyle = 'casual';
  
  if (promptLower.includes('adventure') || promptLower.includes('extreme') || promptLower.includes('hiking')) {
    mood = 'adventurous';
    activityLevel = 'high';
  }
  if (promptLower.includes('relax') || promptLower.includes('calm') || promptLower.includes('peaceful')) {
    mood = 'calm';
    activityLevel = 'low';
  }
  if (promptLower.includes('culture') || promptLower.includes('traditional')) {
    mood = 'cultural';
  }
  
  if (promptLower.includes('tropical') || promptLower.includes('beach')) {
    climate = 'tropical';
    environment = 'beach';
  }
  if (promptLower.includes('mountain') || promptLower.includes('snow') || promptLower.includes('cold')) {
    climate = 'cold';
    environment = 'mountain';
  }
  if (promptLower.includes('desert')) {
    climate = 'desert';
  }
  
  if (promptLower.includes('city') || promptLower.includes('urban')) {
    environment = 'urban';
  }
  if (promptLower.includes('fine dining') || promptLower.includes('luxury')) {
    foodStyle = 'fine_dining';
  }
  if (promptLower.includes('street food') || promptLower.includes('local')) {
    foodStyle = 'street_food';
  }
  
  return {
    tags: prompt.split(' ').filter(w => w.length > 3),
    mood,
    climate,
    environment,
    activity_level: activityLevel,
    food_style: foodStyle,
  };
}

/**
 * Generate image variations with metadata
 * Creates variations from fallback images for the given theme
 */
function generateImageVariations(theme: string, count: number): GeneratedImage[] {
  // Filter fallback images that match the theme
  const themeKeywords = theme.toLowerCase().split(' ');
  
  const filtered = FALLBACK_IMAGES.filter((img) => {
    const metadata = JSON.stringify(img.metadata).toLowerCase();
    return themeKeywords.some((keyword) => metadata.includes(keyword));
  });

  // If matching images found, use them; otherwise use random fallbacks
  const selected = filtered.length > 0 ? filtered : FALLBACK_IMAGES;
  
  return selected
    .slice(0, count)
    .map((img) => ({
      ...img,
      prompt: `${theme}: ${img.prompt}`,
    }));
}

/**
 * Build an enriched prompt for Imagen API
 * Includes metadata instructions
 */
function buildEnrichedPrompt(basePrompt: string): string {
  return `
Generate a travel destination image for: ${basePrompt}

Include these metadata aspects in the image:
- Clear dominant mood/atmosphere
- Visible climate indicators
- Environment type (urban/nature/beach/mountain)
- Activity level indicators
- Food/dining elements if visible

Make the image inspiring and travel-worthy.
  `.trim();
}

/**
 * Extract metadata from image by analyzing visual characteristics
 * This is a simplified version - real implementation would use vision API
 */
export function extractImageMetadata(imageData: unknown): ImageMetadata {
  // Placeholder: return default metadata
  // In production, this would analyze the image and extract metadata
  return {
    tags: ['travel', 'destination'],
    mood: 'calm',
    climate: 'temperate',
    environment: 'nature',
    activity_level: 'medium',
    food_style: 'traditional',
  };
}
