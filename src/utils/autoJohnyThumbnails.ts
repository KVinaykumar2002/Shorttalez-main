import { generateAllEpisodeThumbnails } from './thumbnailGenerator';

/**
 * Generate thumbnails for all Auto Johny episodes
 * This function can be called to automatically create thumbnails
 */
export async function generateAutoJohnyThumbnails() {
  try {
    console.log('Starting Auto Johny thumbnail generation...');
    
    const result = await generateAllEpisodeThumbnails();
    
    console.log('Auto Johny thumbnail generation completed:', result);
    
    return result;
  } catch (error) {
    console.error('Error generating Auto Johny thumbnails:', error);
    throw error;
  }
}

// Auto-run when this module is imported (for convenience)
if (typeof window !== 'undefined') {
  // Only run in browser environment
  (window as any).generateAutoJohnyThumbnails = generateAutoJohnyThumbnails;
}