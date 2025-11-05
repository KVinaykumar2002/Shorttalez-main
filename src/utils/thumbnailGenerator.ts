import { supabase } from "@/integrations/supabase/client";

export interface ThumbnailGenerationResult {
  episodeId: string;
  episodeTitle: string;
  success: boolean;
  thumbnailUrl?: string;
  message?: string;
  error?: string;
}

export interface BulkThumbnailResult {
  message: string;
  results: ThumbnailGenerationResult[];
}

/**
 * Generate thumbnail for a specific episode
 */
export async function generateEpisodeThumbnail(episodeId: string): Promise<ThumbnailGenerationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-episode-thumbnails', {
      body: { episodeId }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error generating episode thumbnail:', error);
    throw error;
  }
}

/**
 * Generate thumbnails for all approved episodes
 */
export async function generateAllEpisodeThumbnails(): Promise<BulkThumbnailResult> {
  try {
    console.log('🚀 Starting bulk thumbnail generation...');
    
    const { data, error } = await supabase.functions.invoke('generate-episode-thumbnails', {
      body: { allEpisodes: true }
    });

    if (error) {
      console.error('❌ Error from edge function:', error);
      throw new Error(error.message);
    }

    console.log('✅ Bulk thumbnail generation completed');
    return data;
  } catch (error) {
    console.error('❌ Error generating all episode thumbnails:', error);
    throw error;
  }
}

/**
 * Generate thumbnails for specific episodes by their IDs
 */
export async function generateThumbnailsForEpisodes(episodeIds: string[]): Promise<BulkThumbnailResult> {
  try {
    console.log(`🎯 Starting thumbnail generation for ${episodeIds.length} specific episodes...`);
    
    const { data, error } = await supabase.functions.invoke('generate-episode-thumbnails', {
      body: { episodeIds }
    });

    if (error) {
      console.error('❌ Error from edge function:', error);
      throw new Error(error.message);
    }

    console.log('✅ Specific episodes thumbnail generation completed');
    return data;
  } catch (error) {
    console.error('❌ Error generating thumbnails for specific episodes:', error);
    throw error;
  }
}

/**
 * Check if an episode already has a thumbnail
 */
export async function episodeHasThumbnail(episodeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('thumbnail_url')
      .eq('id', episodeId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return !!(data?.thumbnail_url);
  } catch (error) {
    console.error('Error checking episode thumbnail:', error);
    return false;
  }
}

/**
 * Generate a placeholder thumbnail URL for episodes without thumbnails
 */
export function generatePlaceholderThumbnail(episode: {
  id: string;
  title: string;
  episode_number?: number;
}): string {
  // Create a simple placeholder using a generic image service
  const encodedTitle = encodeURIComponent(episode.title.substring(0, 50));
  const episodeNum = episode.episode_number || 1;
  
  // Using a placeholder service that generates images with text
  return `https://via.placeholder.com/1280x720/2D1B69/FFFFFF?text=Episode+${episodeNum}%0A${encodedTitle}`;
}