/**
 * Image Utilities — client-side image resizing for thumbnail uploads
 *
 * Resizes images to max width using canvas, outputs compressed base64 JPEG.
 * Used by ThumbnailUpload component to keep localStorage size manageable.
 */

/**
 * Resize and compress an image file to a base64 data URL.
 * @param file - The image File from an <input type="file">
 * @param maxWidth - Maximum width in pixels (default 800)
 * @returns Promise<string> - base64 data URL (JPEG, 0.85 quality)
 */
export function resizeAndCompress(
  file: File,
  maxWidth = 800
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const scale = Math.min(1, maxWidth / img.width)
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Failed to get canvas 2d context"))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
      URL.revokeObjectURL(img.src)
      resolve(dataUrl)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error("Failed to load image"))
    }
    img.src = URL.createObjectURL(file)
  })
}
