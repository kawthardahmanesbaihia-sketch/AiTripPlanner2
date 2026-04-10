import { type NextRequest, NextResponse } from "next/server";

const CATEGORY_PROMPTS: Record<string, string[]> = {
  nature: [
    "Stunning nature landscape with mountains and valleys, scenic beauty, golden hour lighting, photorealistic travel photography, 4K",
    "Pristine forest waterfall and river, surrounded by lush greenery, mist in the air, serene natural landscape, realistic photography",
    "Mountain peaks with snow-covered summits, alpine meadows, dramatic sky, breathtaking outdoor scenery, professional photography",
    "Tropical rainforest canopy, exotic vegetation, wildlife habitat, sunlight through trees, vibrant nature, travel photography",
    "Peaceful lake reflection with forest, mirror-like water surface, misty morning, calm natural landscape, atmospheric photography",
    "Desert sand dunes with sunset, golden light, dramatic shadows, vast landscape, beautiful outdoor scenery, realistic",
  ],
  city: [
    "Modern city skyline at night with illuminated buildings, bustling urban life, street lights, metropolitan landscape, 4K photography",
    "Historic city architecture with cobblestone streets, old buildings, cultural heritage, European-style cityscape, travel photography",
    "Contemporary urban neighborhood with street art, modern design, vibrant atmosphere, city exploration, realistic photography",
    "Iconic city landmark during golden hour, sunset lighting, tourist destination, famous architecture, professional photography",
    "Busy downtown market street with people, local culture, shops and cafes, urban energy, authentic city life, travel photography",
    "City waterfront with boats and bridges, riverside architecture, urban development, scenic city view, photorealistic",
  ],
  activities: [
    "Tourist hiking mountain trail with scenic views, adventure activity, outdoor recreation, happy travelers, realistic 4K photography",
    "Rock climbing climber on cliff face, extreme sports, adventure experience, action photography, professional",
    "Kayaking on river in beautiful landscape, water sports, adventure recreation, nature activity, travel photography",
    "Paragliding over mountains and valleys, aerial view, extreme adventure, thrilling experience, breathtaking landscape",
    "Cycling through countryside with beautiful scenery, outdoor recreation, adventure lifestyle, realistic photography",
    "Scuba diving in coral reef with colorful fish, underwater adventure, marine life, water sports experience, realistic",
  ],
  food: [
    "Authentic local cuisine dish beautifully plated, gourmet food photography, restaurant dining, culinary arts, professional photography",
    "Street food market with various dishes and vendors, local food culture, authentic cuisine, bustling food scene, travel photography",
    "Fine dining restaurant interior with elegant plating, upscale dining experience, gourmet presentation, luxury restaurant, professional",
    "Fresh seafood on a table with wine, coastal cuisine, restaurant ambiance, food and beverage photography, realistic",
    "Traditional local market with fresh produce and ingredients, farmer's market atmosphere, authentic food culture, travel photography",
    "Cooking class preparing traditional dishes, culinary experience, local food traditions, chef demonstrations, realistic photography",
  ],
  beaches: [
    "Tropical beach with turquoise water and white sand, palm trees, paradise scenery, sunny day, idyllic vacation, realistic 4K",
    "Sunset over ocean beach with orange and pink sky, golden hour, seascape, peaceful beach atmosphere, professional photography",
    "Beach with crystal clear water, coral visible, snorkeling destination, tropical paradise, underwater visibility, travel photography",
    "Crowded beach with tourists enjoying activities, lively beach atmosphere, vacation fun, sunny weather, realistic photography",
    "Secluded beach cove surrounded by cliffs and rocks, hidden gem destination, pristine beach, dramatic landscape, travel photography",
    "Beach boardwalk with attractions and restaurants, coastal town, beach culture, lively atmosphere, seaside vacation, realistic",
  ],
  culture: [
    "Ancient temple architecture with intricate carvings, cultural heritage site, historical landmark, exotic destination, travel photography",
    "Traditional cultural festival with people in costumes, celebration, local traditions, vibrant atmosphere, realistic photography",
    "Museum interior with artwork and sculptures, cultural institution, art exhibition, historical artifacts, professional photography",
    "Traditional village with historic buildings and local people, cultural heritage, authenticity, travel photography, realistic",
    "Ancient ruins and archaeological site, historical significance, heritage tourism, dramatic landscape, travel photography",
    "Local market with traditional crafts and goods, cultural artifacts, artisan work, authentic experience, realistic photography",
  ],
  hidden: [
    "Secret waterfall hidden in jungle, off-the-beaten-path location, undiscovered destination, natural wonder, travel photography",
    "Hidden cave with natural formations, geological wonder, exploration adventure, scenic location, realistic photography",
    "Local neighborhood with authentic charm, undiscovered area, neighborhood exploration, street life, travel photography, realistic",
    "Mountain viewpoint with panoramic vista, secluded location, scenic overlook, breathtaking view, professional photography",
    "Hidden lagoon surrounded by tropical vegetation, secret paradise, pristine location, turquoise water, travel photography",
    "Ancient structure in remote location, historical discovery, exploration adventure, mysterious site, realistic photography",
  ],
  nightlife: [
    "Vibrant nightclub with DJ and dancing crowd, nightlife atmosphere, entertainment, dynamic energy, party scene, realistic photography",
    "Live music concert with stage lights and performers, music venue, entertainment experience, energetic atmosphere, professional photography",
    "Bar and cocktail lounge with stylish interior design, drinks and socializing, urban nightlife, upscale venue, realistic photography",
    "Street carnival at night with lights and attractions, festival atmosphere, entertainment, vibrant nightlife, travel photography",
    "Night market with food stalls and entertainment, evening atmosphere, local culture, buzzing energy, realistic photography",
    "Casino interior with gaming tables and lights, luxury entertainment, upscale venue, nightlife destination, professional photography",
  ],
  luxury: [
    "Five-star resort with infinity pool overlooking ocean, luxury accommodation, premium amenities, vacation paradise, realistic 4K",
    "Luxury hotel suite with high-end furnishings and elegant design, upscale interior, hospitality, professional photography",
    "Private villa with tropical garden and pool, exclusive accommodation, luxury property, resort destination, travel photography",
    "Spa and wellness facility with relaxation amenities, luxury wellness, premium experience, serene environment, realistic photography",
    "Private beach resort with white sand and crystal water, exclusive destination, luxury vacation, paradise setting, professional",
    "Yacht on azure sea with luxury interior, exclusive travel, premium experience, coastal scenery, realistic photography",
  ],
  adventure: [
    "Extreme rock climbing with climber on steep cliff face, thrilling adventure, action sports, professional photography, realistic",
    "Skydiving jumper with parachute, extreme adventure, adrenaline rush, scenic views from sky, action photography, professional",
    "Mountain biking on challenging trail, extreme sports, adrenaline activity, outdoor adventure, action photography, realistic",
    "Whitewater rafting in rapids, exciting adventure activity, water sports, group adventure, thrilling experience, professional",
    "Bungee jumping from high platform, extreme adventure, adrenaline rush, thrilling moment, action photography, realistic",
    "Zip-lining through forest canopy, adventure activity, thrilling experience, outdoor recreation, realistic photography, professional",
  ],
};

/**
 * POST /api/generate-images
 * Generate multiple images for a category with prompt variations
 * 
 * Request body:
 * {
 *   category: string - One of the category IDs
 *   count: number - Number of images to generate (default 3-6)
 * }
 * 
 * Response:
 * {
 *   images: Array<{url: string, tags: string[], mood: string, ...}>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { category, count = 5 } = await request.json();

    // Validate input
    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const prompts = CATEGORY_PROMPTS[category.toLowerCase()];
    if (!prompts) {
      return NextResponse.json(
        { error: `Unknown category: ${category}` },
        { status: 400 }
      );
    }

    const numImages = Math.max(3, Math.min(count, prompts.length));
    console.log("[v0] Generating images:", { category, count: numImages });

    // Select random prompts for this batch
    const selectedPrompts = prompts
      .sort(() => Math.random() - 0.5)
      .slice(0, numImages);

    // Generate images in parallel
    const imagePromises = selectedPrompts.map((prompt) =>
      generateImageWithRetry(prompt)
    );

    const results = await Promise.allSettled(imagePromises);

    const images = results
      .map((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          return {
            url: result.value.url,
            tags: getCategoryTags(category),
            mood: getCategoryMood(category),
            climate: getCategoryClimate(category),
            environment: category,
            activity_level: getCategoryActivityLevel(category),
            food_style: getCategoryFoodStyle(category),
            category: category,
          };
        }
        return null;
      })
      .filter((img) => img !== null);

    console.log("[v0] Generated images:", { category, count: images.length });

    return NextResponse.json({
      images,
      count: images.length,
      source: "replicate",
    });
  } catch (error) {
    console.error("[v0] Error in generate-images API:", error);
    return NextResponse.json(
      { error: "Failed to generate images", images: [] },
      { status: 500 }
    );
  }
}

/**
 * Call /api/generate-image with retry logic
 */
async function generateImageWithRetry(
  prompt: string,
  maxRetries: number = 2
): Promise<{ url: string } | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/generate-image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          console.log("[v0] Image generated successfully:", data.url.substring(0, 50));
          return data;
        }
      } else if (response.status === 503) {
        return null;
      }
    } catch (error) {
      console.warn(`[v0] Attempt ${attempt + 1} failed:`, error);
    }

    // Wait before retry
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.error("[v0] Failed to generate image after retries");
  return null;
}

/**
 * Get metadata helpers for each category
 */
function getCategoryTags(category: string): string[] {
  const tagMap: Record<string, string[]> = {
    nature: ["outdoor", "landscape", "scenery", "nature", "adventure"],
    city: ["urban", "architecture", "culture", "landmark", "exploration"],
    activities: ["adventure", "recreation", "active", "experience", "travel"],
    food: ["culinary", "dining", "local", "cuisine", "experience"],
    beaches: ["beach", "coastal", "water", "relaxation", "vacation"],
    culture: ["cultural", "heritage", "historic", "tradition", "authentic"],
    hidden: ["discovery", "hidden", "local", "unique", "adventure"],
    nightlife: ["entertainment", "night", "social", "urban", "vibrant"],
    luxury: ["luxury", "premium", "exclusive", "upscale", "comfort"],
    adventure: ["extreme", "thrill", "outdoor", "action", "experience"],
  };
  return tagMap[category] || [];
}

function getCategoryMood(category: string): string {
  const moodMap: Record<string, string> = {
    nature: "peaceful",
    city: "energetic",
    activities: "adventurous",
    food: "indulgent",
    beaches: "relaxed",
    culture: "curious",
    hidden: "exploratory",
    nightlife: "vibrant",
    luxury: "refined",
    adventure: "thrilling",
  };
  return moodMap[category] || "neutral";
}

function getCategoryClimate(category: string): string {
  return "temperate";
}

function getCategoryActivityLevel(category: string): string {
  const levelMap: Record<string, string> = {
    nature: "high",
    city: "medium",
    activities: "very high",
    food: "low",
    beaches: "low",
    culture: "medium",
    hidden: "high",
    nightlife: "high",
    luxury: "low",
    adventure: "very high",
  };
  return levelMap[category] || "medium";
}

function getCategoryFoodStyle(category: string): string {
  const styleMap: Record<string, string> = {
    food: "gourmet",
    luxury: "fine dining",
    nightlife: "casual",
  };
  return styleMap[category] || "casual";
}
