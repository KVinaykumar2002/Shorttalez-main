import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MovieThemedLoadingScreen } from '@/components/MovieThemedLoadingScreen';
import { SeriesCard } from '@/components/SeriesCard';

interface Creator {
  id: string;
  verified: boolean;
  follower_count: number;
  bio: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  genre: string;
  episode_count: number;
  total_views: number;
}

const CreatorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ['creator', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select(`
          id,
          verified,
          follower_count,
          bio,
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Creator;
    },
    enabled: !!id,
  });

  const { data: series, isLoading: seriesLoading } = useQuery({
    queryKey: ['creator-series', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('series')
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          genre,
          episode_count,
          total_views
        `)
        .eq('creator_id', id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Series[];
    },
    enabled: !!id,
  });

  if (creatorLoading || seriesLoading) {
    return <MovieThemedLoadingScreen message="Loading creator profile..." />;
  }

  if (!creator) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-pink-950 to-orange-950">
        <div className="text-center">
          <div className="text-2xl mb-4 text-white">Creator not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-pink-950 to-orange-950 p-6 relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-white hover:bg-white/10 z-50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Creator Header */}
      <div className="max-w-6xl mx-auto pt-12">
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/10">
          <div className="flex items-start space-x-6">
            <Avatar className="w-24 h-24 border-4 border-purple-400/30">
              <AvatarImage src={creator.profiles.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-bold">
                {creator.profiles.display_name?.[0] || creator.profiles.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {creator.profiles.display_name || creator.profiles.username}
                </h1>
                {creator.verified && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                )}
              </div>
              
              {/* Production Company */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-purple-200 text-sm font-medium">TALLTALEZ PRODUCTIONS</span>
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <svg 
                    className="w-2.5 h-2.5 text-white animate-bounce" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    style={{animationDelay: '0.5s'}}
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              </div>
              
              <p className="text-purple-300 text-lg mb-3">@{creator.profiles.username}</p>
              
              <div className="flex items-center space-x-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{creator.follower_count || 0}</div>
                  <div className="text-gray-400 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{series?.length || 0}</div>
                  <div className="text-gray-400 text-sm">Series</div>
                </div>
              </div>
              
              {creator.bio && (
                <p className="text-gray-300 mb-4">{creator.bio}</p>
              )}
              
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Follow
              </Button>
            </div>
          </div>
        </div>

        {/* Series Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              All Series
            </span>
            <Badge variant="secondary" className="ml-3 bg-white/10 text-white border-white/20">
              {series?.length || 0}
            </Badge>
          </h2>
          
          {series && series.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {series.map((seriesItem) => (
                <SeriesCard
                  key={seriesItem.id}
                  series={{
                    id: seriesItem.id,
                    title: seriesItem.title,
                    description: seriesItem.description,
                    thumbnail_url: seriesItem.thumbnail_url,
                    genre: seriesItem.genre,
                    language: 'en',
                    episode_count: seriesItem.episode_count,
                    total_views: seriesItem.total_views,
                    status: 'published',
                    created_at: new Date().toISOString(),
                    creators: {
                      id: creator.id,
                      user_id: id || '',
                      bio: creator.bio || '',
                      verified: creator.verified,
                      follower_count: creator.follower_count,
                      profiles: {
                        username: creator.profiles.username,
                        display_name: creator.profiles.display_name,
                        avatar_url: creator.profiles.avatar_url
                      }
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No series published yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorPage;