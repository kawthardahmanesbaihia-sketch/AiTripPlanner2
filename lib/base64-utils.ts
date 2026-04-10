/**
 * Unicode-safe Base64 encoding
 * Handles Arabic, emojis, and special characters correctly
 */
export function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/**
 * Unicode-safe Base64 decoding
 * Handles Arabic, emojis, and special characters correctly
 */
export function decodeBase64(base64: string): string {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
