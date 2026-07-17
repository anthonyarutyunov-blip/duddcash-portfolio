/**
 * Mobile image variants — /gallery/m/<name>.webp are 480px-wide WebP copies
 * of /gallery/<name>.jpg, generated at build time (~10x smaller). Phones
 * decode these instead of multi-hundred-KB full-size JPEGs, which was the
 * main source of scroll jank on iOS.
 *
 * Always pair with onError fallback to the original src in case a variant
 * is missing (e.g. an image added via the editor after the last generation).
 */
export function mobileGallerySrc(src: string): string {
  if (!src || !src.startsWith("/gallery/") || src.startsWith("/gallery/m/")) {
    return src
  }
  return src.replace("/gallery/", "/gallery/m/").replace(/\.jpe?g$/i, ".webp")
}
