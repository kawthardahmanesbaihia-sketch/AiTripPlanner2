/**
 * Seed-based randomization utilities
 * Ensures consistent randomization across requests while maintaining freshness
 */

export interface SeedConfig {
  seed: number;
}

/**
 * Generate a random seed based on current timestamp
 * Different on each call, ensuring variation
 */
export function generateSeed(): number {
  return Date.now() + Math.random() * 1000000;
}

/**
 * Seeded random number generator (0-1)
 * Uses simple linear congruential generator
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Shuffle array using seeded randomization
 * Different seed = different shuffle
 */
export function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select random items from array using seed
 */
export function selectRandomWithSeed<T>(array: T[], count: number, seed: number): T[] {
  const shuffled = shuffleArrayWithSeed(array, seed);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Get random item from array using seed
 */
export function getRandomItemWithSeed<T>(array: T[], seed: number): T | undefined {
  if (array.length === 0) return undefined;
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index];
}
