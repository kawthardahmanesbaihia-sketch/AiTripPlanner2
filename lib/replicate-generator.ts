/**
 * Replicate API client for generating real travel images using Stable Diffusion
 * Uses process.env.REPLICATE_API_TOKEN to authenticate with Replicate API
 */

export interface GeneratedImage {
  url: string;
  created_at?: string;
}

/**
 * Generate a travel image using Replicate API (Stable Diffusion XL)
 * Makes real API calls to Replicate for AI-generated images
 */
export async function generateTravelImage(
  uniqueId: string,
  prompt: string
): Promise<GeneratedImage | null> {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      console.log("[v0] Replicate API token not configured");
      return null;
    }

    console.log("[v0] Calling Replicate API for prompt:", prompt);

    // Call Replicate API using their HTTP interface
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "stability-ai/sdxl",
        input: {
          prompt: prompt,
          negative_prompt: "blurry, low quality, distorted, artifacts",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          num_outputs: 1,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[v0] Replicate API error:", error);
      return null;
    }

    const prediction = await response.json();
    console.log("[v0] Replicate prediction created:", prediction.id);

    // Poll for completion (with timeout)
    let completed = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 * 1 second = 30 seconds max wait

    while (!completed && attempts < maxAttempts) {
      // Wait before polling
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const checkResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            "Authorization": `Token ${apiToken}`,
          },
        }
      );

      if (!checkResponse.ok) {
        console.error("[v0] Failed to check prediction status");
        return null;
      }

      const status = await checkResponse.json();

      if (status.status === "succeeded") {
        completed = true;
        const imageUrl = status.output?.[0];

        if (!imageUrl) {
          console.error("[v0] No image URL in Replicate response");
          return null;
        }

        console.log("[v0] Image generated successfully:", imageUrl);
        return {
          url: imageUrl,
          created_at: new Date().toISOString(),
        };
      } else if (status.status === "failed") {
        console.error("[v0] Replicate prediction failed:", status.error);
        return null;
      }

      attempts++;
    }

    console.error("[v0] Replicate image generation timed out");
    return null;
  } catch (error) {
    console.error("[v0] Error calling Replicate API:", error);
    return null;
  }
}
