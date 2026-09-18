// Canvas Pre-Processing & Image Compression Utility

export interface CompressionResult {
  base64Data: string;
  sizeKb: number;
  width: number;
  height: number;
}

/**
 * Compresses and normalizes an image / video frame using an offscreen HTML5 Canvas
 * Targets max 800x600 resolution and < 300 KB file size for ultra-low latency inference
 */
export async function compressAndEnhanceImage(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  maxDimension = 800,
  quality = 0.82
): Promise<CompressionResult> {
  let naturalWidth = 0;
  let naturalHeight = 0;

  if (source instanceof HTMLVideoElement) {
    naturalWidth = source.videoWidth || 640;
    naturalHeight = source.videoHeight || 480;
  } else if (source instanceof HTMLImageElement) {
    naturalWidth = source.naturalWidth || source.width;
    naturalHeight = source.naturalHeight || source.height;
  } else {
    naturalWidth = source.width;
    naturalHeight = source.height;
  }

  // Calculate scaled dimensions while preserving aspect ratio
  let targetWidth = naturalWidth;
  let targetHeight = naturalHeight;

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
      targetWidth = maxDimension;
    } else {
      targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
      targetHeight = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw source onto canvas
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

  // Auto-enhance contrast and brightness slightly for emergency lighting conditions
  try {
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;
    const contrast = 1.08; // +8% contrast
    const brightness = 6;  // +6 brightness

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness));
    }
    ctx.putImageData(imageData, 0, 0);
  } catch {
    // If CORS or tainted canvas occurs on external images, fall back safely
  }

  let finalQuality = quality;
  let base64Data = canvas.toDataURL('image/jpeg', finalQuality);
  let sizeKb = Math.round((base64Data.length * (3 / 4)) / 1024);

  // If size exceeds 300KB, reduce quality progressively
  while (sizeKb > 300 && finalQuality > 0.4) {
    finalQuality -= 0.15;
    base64Data = canvas.toDataURL('image/jpeg', finalQuality);
    sizeKb = Math.round((base64Data.length * (3 / 4)) / 1024);
  }

  return {
    base64Data,
    sizeKb,
    width: targetWidth,
    height: targetHeight,
  };
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
