import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const movieThemes = [
  "cinematic movie poster style avatar of a film director with clapperboard",
  "movie star glamour portrait in golden age Hollywood style",
  "film noir character silhouette with dramatic lighting",
  "superhero movie character in epic action pose",
  "animated movie character in Pixar style with warm lighting",
  "sci-fi movie character with futuristic elements",
  "fantasy epic movie character with magical elements",
  "classic western movie character with vintage cinematography",
  "romantic comedy movie poster character with bright colors",
  "thriller movie character with mysterious shadow lighting"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { userId, userEmail } = await req.json();
    console.log('Generating movie avatar for user:', userId);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Select random movie theme
    const randomTheme = movieThemes[Math.floor(Math.random() * movieThemes.length)];
    
    // Generate creative prompt for movie-themed avatar
    const prompt = `Create a description for a movie-themed profile avatar: ${randomTheme}. The avatar should be professional, friendly, and suitable for a movie streaming platform user. Focus on cinematic quality, vibrant colors, and engaging character design that represents someone who loves movies and entertainment. Make it gender-neutral and universally appealing.`;

    // Call Gemini API for text generation (description)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 150,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const avatarDescription = data.candidates?.[0]?.content?.parts?.[0]?.text || randomTheme;

    console.log('Generated avatar description:', avatarDescription);

    // Create a movie-themed avatar URL (using a placeholder service for now)
    // In a real implementation, you'd use the description to generate an actual image
    const avatarColors = ['FF6B6B', '4ECDC4', '45B7D1', 'F7B731', 'A55EEA', 'FF9F43', '6C5CE7', 'FD79A8'];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const initials = userEmail.substring(0, 2).toUpperCase();
    
    // Create a styled avatar URL with movie theme
    const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=${randomColor}&color=fff&size=200&bold=true&font-size=0.6&format=png`;

    // Update user profile with generated avatar
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        avatar_url: avatarUrl,
        bio: `Movie enthusiast with a passion for ${avatarDescription.split('.')[0].toLowerCase()}`,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    console.log('Successfully generated and saved movie avatar for user:', userId);

    return new Response(JSON.stringify({
      success: true,
      avatar_url: avatarUrl,
      description: avatarDescription,
      theme: randomTheme
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-movie-avatar function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});