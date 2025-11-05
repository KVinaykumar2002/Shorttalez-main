import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BatchMigrationRequest {
  limit?: number
  onlyGoogleDrive?: boolean
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

    const { limit = 10, onlyGoogleDrive = true }: BatchMigrationRequest = await req.json()

    console.log(`Starting batch migration (limit: ${limit}, Google Drive only: ${onlyGoogleDrive})`)

    // Get episodes to migrate
    let query = supabase
      .from('episodes')
      .select('id, title, video_url, migrated_to_cloudflare')
      .eq('migrated_to_cloudflare', false)
      .limit(limit)

    if (onlyGoogleDrive) {
      query = query.ilike('video_url', '%drive.google.com%')
    }

    const { data: episodes, error: fetchError } = await query

    if (fetchError) {
      throw new Error(`Failed to fetch episodes: ${fetchError.message}`)
    }

    if (!episodes || episodes.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No episodes found to migrate',
          migrated: 0,
          failed: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`Found ${episodes.length} episodes to migrate`)

    const results = []
    let migrated = 0
    let failed = 0

    // Process each episode
    for (const episode of episodes) {
      try {
        console.log(`Migrating episode ${episode.id}: ${episode.title}`)

        // Call the single migration function
        const migrationResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/migrate-to-cloudflare`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              episodeId: episode.id,
              videoUrl: episode.video_url,
              title: episode.title,
            }),
          }
        )

        const migrationResult = await migrationResponse.json()

        if (migrationResult.success) {
          migrated++
          results.push({
            episodeId: episode.id,
            title: episode.title,
            status: 'success',
            videoId: migrationResult.videoId
          })
          console.log(`✅ Successfully migrated episode ${episode.id}`)
        } else {
          failed++
          results.push({
            episodeId: episode.id,
            title: episode.title,
            status: 'failed',
            error: migrationResult.error
          })
          console.error(`❌ Failed to migrate episode ${episode.id}: ${migrationResult.error}`)
        }

        // Add delay between migrations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        failed++
        results.push({
          episodeId: episode.id,
          title: episode.title,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
        console.error(`❌ Error migrating episode ${episode.id}:`, error)
      }
    }

    console.log(`Batch migration complete: ${migrated} succeeded, ${failed} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Batch migration complete: ${migrated} succeeded, ${failed} failed`,
        migrated,
        failed,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Batch migration error:', error)
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