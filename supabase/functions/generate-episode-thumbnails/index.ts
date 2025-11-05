import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Episode {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🎬 Starting thumbnail generation process...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const requestBody = await req.json()
    console.log('📝 Request body:', JSON.stringify(requestBody))
    
    const { episodeId, allEpisodes, episodeIds } = requestBody

    if (episodeId) {
      // Generate thumbnail for a specific episode
      console.log(`🎯 Generating thumbnail for specific episode: ${episodeId}`)
      
      const { data: episode, error: fetchError } = await supabase
        .from('episodes')
        .select('id, title, video_url, thumbnail_url')
        .eq('id', episodeId)
        .single()

      if (fetchError || !episode) {
        console.error('❌ Episode not found:', fetchError)
        throw new Error(`Episode not found: ${fetchError?.message}`)
      }

      const result = await generateThumbnailForEpisode(supabase, episode)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else if (episodeIds && Array.isArray(episodeIds)) {
      // Generate thumbnails for specific episodes
      console.log(`🎯 Generating thumbnails for ${episodeIds.length} specific episodes`)
      
      const { data: episodes, error: fetchError } = await supabase
        .from('episodes')
        .select('id, title, video_url, thumbnail_url')
        .in('id', episodeIds)

      if (fetchError) {
        console.error('❌ Failed to fetch episodes:', fetchError)
        throw new Error(`Failed to fetch episodes: ${fetchError.message}`)
      }

      const results = []
      for (const episode of episodes || []) {
        try {
          const result = await generateThumbnailForEpisode(supabase, episode)
          results.push(result)
        } catch (error) {
          console.error(`❌ Failed to generate thumbnail for episode ${episode.id}:`, error)
          results.push({
            episodeId: episode.id,
            episodeTitle: episode.title,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          })
        }
      }

      return new Response(JSON.stringify({ 
        message: `Processed ${episodeIds.length} episodes`,
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else if (allEpisodes) {
      // Generate thumbnails for all episodes
      console.log('🌟 Generating thumbnails for all approved episodes')
      
      const { data: episodes, error: fetchError } = await supabase
        .from('episodes')
        .select('id, title, video_url, thumbnail_url')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Failed to fetch episodes:', fetchError)
        throw new Error(`Failed to fetch episodes: ${fetchError.message}`)
      }

      console.log(`📊 Found ${episodes?.length || 0} episodes to process`)
      const results = []

      for (const episode of episodes || []) {
        try {
          console.log(`🎬 Processing episode: ${episode.title}`)
          const result = await generateThumbnailForEpisode(supabase, episode)
          results.push(result)
          console.log(`✅ Completed episode: ${episode.title}`)
        } catch (error) {
          console.error(`❌ Failed to generate thumbnail for episode ${episode.id}:`, error)
          results.push({
            episodeId: episode.id,
            episodeTitle: episode.title,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          })
        }
      }

      return new Response(JSON.stringify({ 
        message: 'Bulk thumbnail generation completed',
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      throw new Error('Either episodeId, episodeIds array, or allEpisodes flag must be provided')
    }

  } catch (error) {
    console.error('❌ Error in generate-episode-thumbnails:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

async function generateThumbnailForEpisode(supabase: any, episode: Episode) {
  console.log(`🎬 Processing episode: ${episode.title} (${episode.id})`)

  try {
    // Extract Vimeo video ID from URL
    const vimeoId = extractVimeoId(episode.video_url)
    if (!vimeoId) {
      console.error(`❌ Invalid Vimeo URL: ${episode.video_url}`)
      throw new Error(`Invalid Vimeo URL: ${episode.video_url}`)
    }

    console.log(`🎥 Extracted Vimeo ID: ${vimeoId}`)

    // Get Vimeo video thumbnail using oEmbed API with retry logic
    const vimeoOembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=1280&height=720`
    
    console.log(`📡 Fetching Vimeo oEmbed data for video ${vimeoId}`)
    
    let oembedResponse
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        oembedResponse = await fetch(vimeoOembedUrl, {
          headers: {
            'User-Agent': 'ShortTalez-ThumbnailGenerator/1.0'
          }
        })
        
        if (oembedResponse.ok) break
        
        console.warn(`⚠️ Attempt ${retryCount + 1} failed with status: ${oembedResponse.status}`)
        retryCount++
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        }
      } catch (fetchError) {
        console.warn(`⚠️ Fetch attempt ${retryCount + 1} failed:`, fetchError)
        retryCount++
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        } else {
          throw fetchError
        }
      }
    }
    
    if (!oembedResponse || !oembedResponse.ok) {
      throw new Error(`Failed to fetch Vimeo data after ${maxRetries} attempts: ${oembedResponse?.status}`)
    }

    const oembedData = await oembedResponse.json()
    let thumbnailUrl = oembedData.thumbnail_url

    if (!thumbnailUrl) {
      console.log(`🔄 Using fallback thumbnail URL for video ${vimeoId}`)
      thumbnailUrl = `https://i.vimeocdn.com/video/${vimeoId}_1280x720.jpg`
    }

    console.log(`🖼️ Found thumbnail URL: ${thumbnailUrl}`)

    // Download the thumbnail image with retry logic
    let imageResponse
    retryCount = 0
    
    while (retryCount < maxRetries) {
      try {
        imageResponse = await fetch(thumbnailUrl, {
          headers: {
            'User-Agent': 'ShortTalez-ThumbnailGenerator/1.0'
          }
        })
        
        if (imageResponse.ok) break
        
        console.warn(`⚠️ Image download attempt ${retryCount + 1} failed with status: ${imageResponse.status}`)
        retryCount++
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        }
      } catch (fetchError) {
        console.warn(`⚠️ Image download attempt ${retryCount + 1} failed:`, fetchError)
        retryCount++
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        } else {
          throw fetchError
        }
      }
    }
    
    if (!imageResponse || !imageResponse.ok) {
      throw new Error(`Failed to download thumbnail after ${maxRetries} attempts: ${imageResponse?.status}`)
    }

    console.log(`⬇️ Successfully downloaded thumbnail image`)

    const imageBuffer = await imageResponse.arrayBuffer()
    const imageUint8Array = new Uint8Array(imageBuffer)

    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `episode_${episode.id}_${timestamp}.jpg`
    const filePath = `thumbnails/${filename}`

    console.log(`☁️ Uploading thumbnail to storage: ${filePath}`)

    // Upload to Supabase Storage with retry logic
    let uploadResult
    retryCount = 0
    
    while (retryCount < maxRetries) {
      try {
        uploadResult = await supabase.storage
          .from('episode-thumbnails')
          .upload(filePath, imageUint8Array, {
            contentType: 'image/jpeg',
            upsert: true
          })
        
        if (!uploadResult.error) break
        
        console.warn(`⚠️ Upload attempt ${retryCount + 1} failed:`, uploadResult.error)
        retryCount++
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        }
      } catch (uploadError) {
        console.warn(`⚠️ Upload attempt ${retryCount + 1} failed:`, uploadError)
        retryCount++
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        } else {
          throw uploadError
        }
      }
    }

    if (uploadResult?.error) {
      throw new Error(`Failed to upload thumbnail after ${maxRetries} attempts: ${uploadResult.error.message}`)
    }

    console.log(`✅ Successfully uploaded thumbnail to storage`)

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('episode-thumbnails')
      .getPublicUrl(filePath)

    console.log(`🔗 Generated public URL: ${publicUrl}`)

    // Update the episode with the new thumbnail URL
    const { error: updateError } = await supabase
      .from('episodes')
      .update({ 
        thumbnail_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', episode.id)

    if (updateError) {
      console.error(`❌ Failed to update episode in database:`, updateError)
      throw new Error(`Failed to update episode: ${updateError.message}`)
    }

    console.log(`🎉 Successfully generated thumbnail for episode: ${episode.title}`)

    return {
      episodeId: episode.id,
      episodeTitle: episode.title,
      success: true,
      thumbnailUrl: publicUrl,
      message: 'Thumbnail generated successfully'
    }

  } catch (error) {
    console.error(`❌ Error processing episode ${episode.id}:`, error)
    throw error
  }
}

function extractVimeoId(url: string): string | null {
  const regex = /(?:vimeo\.com\/)(?:.*\/)?([0-9]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}