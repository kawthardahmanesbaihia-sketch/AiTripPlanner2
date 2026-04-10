import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    google_imagen: {
      configured: !!process.env.GOOGLE_IMAGEN_API_KEY,
      key: process.env.GOOGLE_IMAGEN_API_KEY ? 'Set' : 'Missing',
    },
    eventbrite: {
      configured: !!process.env.EVENTBRITE_API_KEY,
      key: process.env.EVENTBRITE_API_KEY ? 'Set' : 'Missing',
    },
    openweather: {
      configured: !!process.env.OPENWEATHER_API_KEY,
      key: process.env.OPENWEATHER_API_KEY ? 'Set' : 'Missing',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    status: 'ok',
    apis: checks,
    allConfigured: checks.google_imagen.configured && checks.eventbrite.configured,
    weatherConfigured: checks.openweather.configured,
  });
}
