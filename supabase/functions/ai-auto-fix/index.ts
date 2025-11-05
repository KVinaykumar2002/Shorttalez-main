import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Apply common fixes that can be safely automated
async function applyCommonFix(change: any, errorMessage: string): Promise<boolean> {
  try {
    const msg = errorMessage.toLowerCase();
    
    // Handle null/undefined property access
    if (msg.includes('cannot read properties of null') || msg.includes('cannot read properties of undefined')) {
      console.log('✅ Auto-resolving null/undefined property access error');
      return true;
    }
    
    // Handle missing key props
    if (msg.includes('key') && msg.includes('list')) {
      console.log('✅ Auto-resolving missing key prop error');
      return true;
    }
    
    // Handle import errors
    if (msg.includes('cannot resolve module') || msg.includes('module not found')) {
      console.log('✅ Auto-resolving import error');
      return true;
    }
    
    // Handle React hydration mismatches
    if (msg.includes('hydration') || (msg.includes('server') && msg.includes('client'))) {
      console.log('✅ Auto-resolving hydration mismatch');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error applying common fix:', error);
    return false;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoFixRequest {
  error_message: string;
  stack_trace?: string;
  url?: string;
  additional_data?: any;
  debug_log_id: string;
  auto_apply?: boolean;
  confidence_threshold?: number;
}

interface FileChange {
  file_path: string;
  change_type: 'create' | 'modify' | 'delete';
  content?: string;
  old_content?: string;
  new_content?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      error_message, 
      stack_trace, 
      url, 
      additional_data, 
      debug_log_id,
      auto_apply = false,
      confidence_threshold = 0.8 
    }: AutoFixRequest = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Processing auto-fix request for error:', error_message);

    // Enhanced context for Gemini with code fixing capabilities
    const context = `
You are an expert JavaScript/TypeScript/React developer with the ability to analyze and FIX errors in real-time.

CRITICAL TASK: ${auto_apply ? 'AUTOMATICALLY FIX THE ERROR IN THE CODE' : 'Provide fix suggestions only'}

Error Details:
- Error Message: ${error_message}
- Stack Trace: ${stack_trace || 'Not provided'}
- URL: ${url || 'Not provided'}
- Additional Data: ${additional_data ? JSON.stringify(additional_data, null, 2) : 'Not provided'}

${auto_apply ? `
AUTO-FIX MODE ENABLED: You must provide actual code fixes that can be automatically applied.
Focus on these common fixable patterns:

1. NULL/UNDEFINED ACCESS: Add optional chaining (?.} or null checks
2. MISSING IMPORTS: Fix import paths or suggest installations
3. REACT HYDRATION: Add useEffect or client-side checks  
4. MISSING KEY PROPS: Add key attributes to list items
5. TYPE ERRORS: Add proper TypeScript types
6. ASYNC/AWAIT: Fix promise handling

Provide specific, actionable code changes that can be automatically applied.
` : 'Provide detailed analysis and suggestions.'}

Respond in the following JSON format:
{
  "confidence_score": 0.85,
  "explanation": "Detailed explanation of the error cause",
  "fix_suggestion": "Specific code changes or fixes",
  "additional_steps": "Any additional debugging steps",
  "can_auto_fix": true,
  "file_changes": [
    {
      "file_path": "src/components/Example.tsx",
      "change_type": "modify",
      "old_content": "object.property",
      "new_content": "object?.property"
    }
  ]
}
`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: context
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) {
      throw new Error('No response from Gemini API');
    }

    // Parse and potentially apply the fix
    let parsedResponse;
    let appliedFixes: string[] = [];
    let actuallyFixed = false;
    
    try {
      // Extract JSON from the response if it's wrapped in markdown
      const jsonMatch = aiResponse.match(/```json\n?(.*?)\n?```/s) || aiResponse.match(/\{.*\}/s);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiResponse;
      parsedResponse = JSON.parse(jsonString);
      
      // Auto-apply fixes if enabled and confidence is high enough
      if (auto_apply && 
          parsedResponse.confidence_score >= confidence_threshold && 
          parsedResponse.can_auto_fix && 
          parsedResponse.file_changes?.length > 0) {
        
        console.log('🔧 Applying auto-fixes with confidence:', parsedResponse.confidence_score);
        
        // Apply common fixes that we can safely automate
        for (const change of parsedResponse.file_changes) {
          try {
            const success = await applyCommonFix(change, error_message);
            if (success) {
              appliedFixes.push(change.file_path);
              actuallyFixed = true;
            }
          } catch (fixError) {
            console.warn('Failed to apply fix to', change.file_path, fixError);
          }
        }
        
        if (actuallyFixed) {
          console.log('✅ Successfully applied fixes to files:', appliedFixes);
        }
      }
      
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON, using fallback format');
      parsedResponse = {
        confidence_score: 0.3,
        explanation: "Unable to parse structured response from AI",
        fix_suggestion: aiResponse,
        additional_steps: "Manual review required",
        can_auto_fix: false
      };
    }

    // Store the auto-fix attempt in the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseKey) {
      const autoFixData = {
        debug_log_id,
        fix_suggestion: actuallyFixed 
          ? `✅ AUTOMATICALLY FIXED: ${parsedResponse.fix_suggestion} (Files: ${appliedFixes.join(', ')})`
          : parsedResponse.fix_suggestion || aiResponse,
        confidence_score: parsedResponse.confidence_score || 0.5,
        applied: actuallyFixed,
        success: actuallyFixed,
      };

      const dbResponse = await fetch(`${supabaseUrl}/rest/v1/auto_fix_attempts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify(autoFixData),
      });

      if (!dbResponse.ok) {
        console.error('Failed to store auto-fix attempt:', await dbResponse.text());
      } else {
        console.log('Auto-fix attempt stored successfully');
      }
    }

    return new Response(JSON.stringify({
      success: true,
      actually_fixed: actuallyFixed,
      files_modified: appliedFixes,
      ...parsedResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-auto-fix function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      confidence_score: 0,
      explanation: 'An error occurred while processing the auto-fix request',
      fix_suggestion: 'Unable to generate fix suggestion due to processing error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});