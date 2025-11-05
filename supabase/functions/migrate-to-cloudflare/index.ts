import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MigrationRequest {
  episodeId: string
  videoUrl: string
  title: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { episodeId, videoUrl, title }: MigrationRequest = await req.json()

    console.log(`Starting migration for episode ${episodeId}: ${title}`)

    const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
    const apiToken = Deno.env.get('CLOUDFLARE_API_TOKEN')

    if (!accountId || !apiToken) {
      throw new Error('Cloudflare credentials not configured')
    }

    // Step 1: Upload video to Cloudflare Stream via URL
    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/copy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: videoUrl,
          meta: {
            name: title,
            episode_id: episodeId,
          },
          allowedOrigins: ['*'], // Allow embedding on any domain
          requireSignedURLs: false, // Make publicly accessible
        }),
      }
    )

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Cloudflare upload failed:', errorText)
      throw new Error(`Cloudflare upload failed: ${uploadResponse.status}`)
    }

    const uploadResult = await uploadResponse.json()
    console.log('Cloudflare upload result:', uploadResult)

    if (!uploadResult.success) {
      throw new Error(`Cloudflare API error: ${uploadResult.errors?.map((e: any) => e.message).join(', ')}`)
    }

    const videoId = uploadResult.result.uid
    const streamUrl = `https://iframe.videodelivery.net/${videoId}`
    const thumbnailUrl = `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`

    // Step 2: Update episode in database
    const { error: updateError } = await supabase
      .from('episodes')
      .update({
        video_url: streamUrl,
        thumbnail_url: thumbnailUrl,
        cloudflare_video_id: videoId,
        migrated_to_cloudflare: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', episodeId)

    if (updateError) {
      console.error('Database update failed:', updateError)
      throw new Error(`Database update failed: ${updateError.message}`)
    }

    console.log(`Successfully migrated episode ${episodeId} to Cloudflare Stream`)

    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        streamUrl,
        thumbnailUrl,
        message: 'Episode migrated successfully to Cloudflare Stream'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Migration error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})