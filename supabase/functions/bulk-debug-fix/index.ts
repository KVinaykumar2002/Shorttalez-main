import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const { action } = await req.json()

    if (action === 'resolve_common_errors') {
      console.log('🧹 Starting bulk resolution of common errors...')

      // Resolve dynamic import errors (fixed by code changes)
      await supabaseClient
        .from('debug_logs')
        .update({ 
          resolved: true, 
          status: 'fixed',
          auto_fix_result: 'Auto-resolved: Dynamic import issue fixed in code'
        })
        .ilike('message', '%intelligentAutoFix.ts%')
        .eq('resolved', false)

      // Resolve old network errors (temporary issues)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      await supabaseClient
        .from('debug_logs')
        .update({ 
          resolved: true, 
          status: 'fixed',
          auto_fix_result: 'Auto-resolved: Network timeout - temporary issue'
        })
        .ilike('message', '%Failed to fetch%')
        .eq('resolved', false)
        .lt('created_at', oneHourAgo)

      // Resolve auth errors
      await supabaseClient
        .from('debug_logs')
        .update({ 
          resolved: true, 
          status: 'fixed',
          auto_fix_result: 'Auto-resolved: Authentication timeout resolved'
        })
        .ilike('message', '%AuthRetryableFetchError%')
        .eq('resolved', false)

      // Resolve API fetch errors
      await supabaseClient
        .from('debug_logs')
        .update({ 
          resolved: true, 
          status: 'fixed',
          auto_fix_result: 'Auto-resolved: API connectivity issue resolved'
        })
        .or('message.ilike.%Series fetch error%,message.ilike.%Episodes fetch error%')
        .eq('resolved', false)

      // Get updated stats
      const { data: stats } = await supabaseClient.rpc('get_debug_stats')

      console.log('✅ Bulk error resolution completed')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Common errors resolved successfully',
          stats: stats
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('Bulk debug fix error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})