/**
 * Image loading utilities with caching and retry logic
 */

interface CachedImage {
  url: string;
  timestamp: number;
}

// Simple in-memory cache (24 hour TTL)
const imageCache = new Map<string, CachedImage>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedImageUrl(key: string): string | null {
  const cached = imageCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.url;
  }
  imageCache.delete(key);
  return null;
}

export function setCachedImageUrl(key: string, url: string): void {
  imageCache.set(key, {
    url,
    timestamp: Date.now(),
  });
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Don't reject, just resolve silently
    img.src = src;
  });
}

export async function batchPreloadImages(urls: string[]): Promise<void> {
  await Promise.allSettled(urls.map(preloadImage));
}

export function getImageWithFallback(primaryUrl: string | undefined, fallbackUrl: string): string {
  return primaryUrl && primaryUrl.trim() ? primaryUrl : fallbackUrl;
}
