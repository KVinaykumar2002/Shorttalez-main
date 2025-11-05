// Utility to help debug and fix common app issues

declare global {
  interface Window {
    debugApp?: {
      debugRouting: () => void;
      debugDatabase: () => Promise<any>;
      clearLikeCache: () => void;
      testSearch: (query: string) => Promise<any>;
    };
  }
}

export const debugRouting = () => {
  console.log('Current route:', window.location.pathname);
  console.log('Current search:', window.location.search);
  console.log('Available routes in App.tsx should be properly configured');
};

export const debugDatabase = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    // Test series fetch
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('id, title, status')
      .eq('status', 'published')
      .limit(5);
    
    console.log('Series test:', { series, seriesError });

    // Test episodes fetch  
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('id, title, status, series_id')
      .eq('status', 'approved')
      .limit(5);
    
    console.log('Episodes test:', { episodes, episodesError });

    return { series, episodes, errors: { seriesError, episodesError } };
  } catch (error) {
    console.error('Database debug error:', error);
    return { error };
  }
};

export const clearLikeCache = () => {
  // Clear any cached like states
  localStorage.removeItem('likedEpisodes');
  localStorage.removeItem('likedPosts');
  console.log('Like cache cleared');
};

export const testSearch = async (query: string) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const { data, error } = await supabase
      .from('series')
      .select(`
        id,
        title,
        description,
        genre,
        status,
        creators (
          profiles (
            username,
            display_name
          )
        )
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,genre.ilike.%${query}%`);
    
    console.log('Search test results:', { data, error });
    return { data, error };
  } catch (error) {
    console.error('Search test error:', error);
    return { error };
  }
};

// Auto-run diagnostics in development
if (process.env.NODE_ENV === 'development') {
  window.debugApp = {
    debugRouting,
    debugDatabase,
    clearLikeCache,
    testSearch
  };
}