import { type NextRequest, NextResponse } from "next/server";

interface PredictionInput {
  prompt: string;
  negative_prompt?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  num_outputs?: number;
}

/**
 * POST /api/generate-image
 * Generate a single AI image using Replicate API
 * 
 * Request body:
 * {
 *   prompt: string - Description of the image to generate
 * }
 * 
 * Response:
 * {
 *   url: string - URL of the generated image
 *   id: string - Replicate prediction ID
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt cannot be empty" },
        { status: 400 }
      );
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: "Image generation not configured" },
        { status: 503 }
      );
    }

    console.log("[v0] API: Starting image generation for prompt:", prompt.substring(0, 50) + "...");

    // Create prediction on Replicate
    const input: PredictionInput = {
      prompt: prompt,
      negative_prompt: "blurry, low quality, distorted, artifacts, nsfw",
      num_inference_steps: 30,
      guidance_scale: 7.5,
      num_outputs: 1,
    };

    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "stability-ai/sdxl",
        input,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error("[v0] Replicate API error:", error);
      return NextResponse.json(
        { error: "Failed to create image generation request" },
        { status: 500 }
      );
    }

    const prediction = await createResponse.json();
    const predictionId = prediction.id;

    console.log("[v0] Prediction created:", predictionId);

    // Poll for completion with 30-second timeout
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      // Wait 1 second before polling
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            "Authorization": `Token ${apiToken}`,
          },
        }
      );

      if (!statusResponse.ok) {
        console.error("[v0] Failed to check prediction status");
        return NextResponse.json(
          { error: "Failed to check image generation status" },
          { status: 500 }
        );
      }

      const status = await statusResponse.json();

      if (status.status === "succeeded") {
        const imageUrl = status.output?.[0];

        if (!imageUrl) {
          console.error("[v0] No image URL in response");
          return NextResponse.json(
            { error: "Image generation succeeded but no URL returned" },
            { status: 500 }
          );
        }

        console.log("[v0] Image generated successfully:", imageUrl);

        return NextResponse.json({
          url: imageUrl,
          id: predictionId,
        });
      } else if (status.status === "failed") {
        console.error("[v0] Generation failed:", status.error);
        return NextResponse.json(
          { error: `Generation failed: ${status.error}` },
          { status: 500 }
        );
      }

      attempts++;
    }

    console.error("[v0] Image generation timed out after 30 seconds");
    return NextResponse.json(
      { error: "Image generation timed out" },
      { status: 504 }
    );
  } catch (error) {
    console.error("[v0] Unexpected error in generate-image API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
