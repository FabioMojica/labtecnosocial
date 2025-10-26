export function getImageUrl(sourceImage, localImage = null) {
  const baseUrl = import.meta.env.VITE_API_URL || '';

  if (localImage) {
    return URL.createObjectURL(localImage);
  }

  if (!sourceImage) return null;

  return sourceImage.startsWith('http') ? sourceImage : baseUrl + sourceImage;
}
