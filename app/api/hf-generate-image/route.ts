import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing prompt' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      console.error('[v0] HF_API_KEY not configured');
      return NextResponse.json(
        { error: 'Image generation service not configured' },
        { status: 500 }
      );
    }

    // Call Hugging Face API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[v0] HF API error:', response.status, errorData);
      
      if (response.status === 503) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: response.status }
      );
    }

    // Convert response to base64
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageDataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image: imageDataUrl });
  } catch (error) {
    console.error('[v0] Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
