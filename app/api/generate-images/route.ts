import { fetchPexelsImages } from "@/lib/pexels"
import { type NextRequest, NextResponse } from "next/server";

const CATEGORY_PROMPTS: Record<string, string[]> = {
  nature: [
    "mountains landscape nature",
    "forest waterfall river",
    "snow mountains alpine",
    "tropical rainforest jungle",
    "lake reflection forest",
    "desert dunes sunset",
  ],
  city: [
    "city skyline night",
    "historic city street",
    "modern urban street art",
    "famous city landmark",
    "busy downtown market",
    "city waterfront skyline",
  ],
  activities: [
    "hiking mountain trail",
    "rock climbing cliff",
    "kayaking river",
    "paragliding mountains",
    "cycling countryside",
    "scuba diving coral reef",
  ],
  food: [
    "local cuisine dish",
    "street food market",
    "fine dining restaurant",
    "seafood table",
    "local market food",
    "cooking class food",
  ],
  beaches: [
    "tropical beach palm trees",
    "beach sunset ocean",
    "clear water beach",
    "crowded beach vacation",
    "hidden beach cove",
    "beach boardwalk",
  ],
  culture: [
    "ancient temple architecture",
    "cultural festival costumes",
    "museum art gallery",
    "traditional village",
    "ancient ruins site",
    "local craft market",
  ],
  hidden: [
    "hidden waterfall jungle",
    "secret cave nature",
    "local neighborhood street",
    "mountain viewpoint panorama",
    "hidden lagoon tropical",
    "remote ancient structure",
  ],
  nightlife: [
    "nightclub party lights",
    "concert stage crowd",
    "cocktail bar interior",
    "night carnival lights",
    "night market street",
    "casino luxury interior",
  ],
  luxury: [
    "luxury resort pool ocean",
    "luxury hotel suite",
    "private villa pool",
    "spa wellness resort",
    "private beach resort",
    "luxury yacht sea",
  ],
  adventure: [
    "rock climbing extreme",
    "skydiving parachute",
    "mountain biking trail",
    "whitewater rafting",
    "bungee jumping",
    "zipline forest",
  ],
};

export async function POST(request: NextRequest) {
  try {
    const { category, count = 5 } = await request.json();

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
    console.log("[v0] Generating images (Pexels):", { category, count: numImages });

    const selectedPrompts = prompts
      .sort(() => Math.random() - 0.5)
      .slice(0, numImages);

    // 🔥 PEXELS INTEGRATION
    const imagePromises = selectedPrompts.map(async (prompt) => {
      try {
        const results = await fetchPexelsImages(prompt);

        if (results && results.length > 0) {
          const randomImage =
            results[Math.floor(Math.random() * results.length)];

          return {
            url: randomImage.image,
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
      } catch (error) {
        console.error("[Pexels] Error:", error);
        return null;
      }
    });

    const results = await Promise.all(imagePromises);

    const images = results.filter((img) => img !== null);

    console.log("[v0] Generated images:", { category, count: images.length });

    return NextResponse.json({
      images,
      count: images.length,
      source: "pexels",
    });
  } catch (error) {
    console.error("[v0] Error in generate-images API:", error);
    return NextResponse.json(
      { error: "Failed to generate images", images: [] },
      { status: 500 }
    );
  }
}

// ===== Helpers =====

function getCategoryTags(category: string): string[] {
  const tagMap: Record<string, string[]> = {
    nature: ["outdoor", "landscape", "scenery"],
    city: ["urban", "architecture"],
    activities: ["adventure", "travel"],
    food: ["food", "dining"],
    beaches: ["beach", "sea"],
    culture: ["culture", "history"],
    hidden: ["hidden", "explore"],
    nightlife: ["night", "party"],
    luxury: ["luxury", "premium"],
    adventure: ["extreme", "thrill"],
  };
  return tagMap[category] || [];
}

function getCategoryMood(category: string): string {
  const moodMap: Record<string, string> = {
    nature: "peaceful",
    city: "energetic",
    activities: "adventurous",
    food: "enjoyable",
    beaches: "relaxed",
    culture: "curious",
    hidden: "explore",
    nightlife: "vibrant",
    luxury: "premium",
    adventure: "thrilling",
  };
  return moodMap[category] || "neutral";
}

function getCategoryClimate(category: string): string {
  return "temperate";
}

function getCategoryActivityLevel(category: string): string {
  return "medium";
}

function getCategoryFoodStyle(category: string): string {
  return "casual";
}