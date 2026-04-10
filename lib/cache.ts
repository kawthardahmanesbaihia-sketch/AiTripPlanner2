/**
 * In-memory caching utility with TTL support
 * Each cache entry has a time-to-live before it expires
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private ttlMs: number;

  constructor(ttlSeconds: number) {
    this.ttlMs = ttlSeconds * 1000;
  }

  set(key: string, value: T): void {
    const expiresAt = Date.now() + this.ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instances
export const imageCache = new InMemoryCache(3600); // 1 hour
export const eventCache = new InMemoryCache(7200); // 2 hours
export const destinationCache = new InMemoryCache(14400); // 4 hours

// Utility to generate cache keys
export function generateCacheKey(...parts: (string | number | boolean)[]): string {
  return parts.join(':');
}
