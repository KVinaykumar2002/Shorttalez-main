import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Heart, Grid3X3, UserPlus, UserMinus, Share2, MessageCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieThemedLoadingScreen } from '@/components/MovieThemedLoadingScreen';
import { OptimizedSeriesCard } from '@/components/OptimizedSeriesCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PublicProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
}

interface Creator {
  id: string;
  verified: boolean;
  follower_count: number;
}

interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  episode_count: number;
  total_views: number;
  genre: string;
  language: string;
  status: string;
  created_at: string;
  creators: {
    id: string;
    user_id: string;
    bio: string;
    verified: boolean;
    follower_count: number;
    profiles?: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
  };
}

interface LikedEpisode {
  id: string;
  title: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  episode_number: number;
  series: {
    id: string;
    title: string;
    creators: {
      profiles: {
        username: string;
        display_name: string;
      };
    };
  };
}

interface FollowedCreator {
  creator_id: string;
  creators: {
    id: string;
    verified: boolean;
    follower_count: number;
    profiles: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
  };
}

const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [series, setSeries] = useState<Series[]>([]);
  const [likedEpisodes, setLikedEpisodes] = useState<LikedEpisode[]>([]);
  const [followedCreators, setFollowedCreators] = useState<FollowedCreator[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('series');

  useEffect(() => {
    if (username) {
      fetchProfileData();
    }
  }, [username, user]);

  const fetchProfileData = async () => {
    if (!username) return;

    try {
      setLoading(true);

      // Fetch user profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError || !profileData) {
        toast({
          title: "Profile not found",
          description: "The user profile you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/home');
        return;
      }

      setProfile(profileData);

      // Check if user is a creator
      const { data: creatorData } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', profileData.id)
        .maybeSingle();

      if (creatorData) {
        setCreator(creatorData);

        // Fetch creator's series with all required fields
        const { data: seriesData } = await supabase
          .from('series')
          .select(`
            *,
            creators (
              id,
              user_id,
              bio,
              verified,
              follower_count,
              profiles (
                username,
                display_name,
                avatar_url
              )
            )
          `)
          .eq('creator_id', creatorData.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (seriesData) {
          setSeries(seriesData);
        }
      }

      // Check if current user is following this creator
      if (user && creatorData) {
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('follower_id', user.id)
          .eq('creator_id', creatorData.id)
          .single();

        setIsFollowing(!!subscriptionData);
      }

      // Fetch liked episodes (only if viewing own profile or profile is public)
      if (user?.id === profileData.id) {
        const { data: likedInteractions } = await supabase
          .from('interactions')
          .select('target_id')
          .eq('user_id', profileData.id)
          .eq('interaction_type', 'like')
          .eq('target_type', 'episode');

        if (likedInteractions && likedInteractions.length > 0) {
          const episodeIds = likedInteractions.map(interaction => interaction.target_id);
          
          const { data: likedEpisodesData } = await supabase
            .from('episodes')
            .select(`
              id,
              title,
              thumbnail_url,
              views,
              likes,
              episode_number,
              series:series_id (
                id,
                title,
                creators (
                  profiles (
                    username,
                    display_name
                  )
                )
              )
            `)
            .in('id', episodeIds)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

          if (likedEpisodesData) {
            setLikedEpisodes(likedEpisodesData);
          }
        }

        // Fetch followed creators
        const { data: subscriptionsData } = await supabase
          .from('subscriptions')
          .select(`
            creator_id,
            creators (
              id,
              verified,
              follower_count,
              profiles (
                username,
                display_name,
                avatar_url
              )
            )
          `)
          .eq('follower_id', profileData.id);

        if (subscriptionsData) {
          setFollowedCreators(subscriptionsData);
        }
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Error loading profile",
        description: "There was an error loading the profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !creator) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow creators.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('subscriptions')
          .delete()
          .eq('follower_id', user.id)
          .eq('creator_id', creator.id);

        setIsFollowing(false);
        setCreator(prev => prev ? { ...prev, follower_count: prev.follower_count - 1 } : null);
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${profile?.display_name}`,
        });
      } else {
        // Follow
        await supabase
          .from('subscriptions')
          .insert({
            follower_id: user.id,
            creator_id: creator.id
          });

        setIsFollowing(true);
        setCreator(prev => prev ? { ...prev, follower_count: prev.follower_count + 1 } : null);
        toast({
          title: "Following",
          description: `You are now following ${profile?.display_name}`,
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (loading) {
    return <MovieThemedLoadingScreen message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/home')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="font-semibold">@{profile.username}</h1>
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-2 border-primary/10">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-xl">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  {profile.display_name?.[0] || profile.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-2xl font-bold">
                      {profile.display_name}
                    </h1>
                    {creator?.verified && (
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>

                {profile.bio && (
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex items-center space-x-6">
                  {creator && (
                    <>
                      <div className="text-center">
                        <div className="font-bold text-lg">{series.length}</div>
                        <div className="text-xs text-muted-foreground">Series</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">{creator.follower_count}</div>
                        <div className="text-xs text-muted-foreground">Followers</div>
                      </div>
                    </>
                  )}
                  <div className="text-center">
                    <div className="font-bold text-lg">{followedCreators.length}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{likedEpisodes.length}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="flex gap-2">
                    {creator && (
                      <Button
                        onClick={handleFollowToggle}
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        className={isFollowing ? "hover:bg-destructive hover:text-destructive-foreground" : "bg-gradient-primary"}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="w-4 h-4 mr-1" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </div>
                )}

                {isOwnProfile && (
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    size="sm"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/30">
            <TabsTrigger value="series" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Series
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex items-center gap-2" disabled={!isOwnProfile}>
              <Heart className="w-4 h-4" />
              Likes
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2" disabled={!isOwnProfile}>
              <Users className="w-4 h-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2" disabled={!creator}>
              <Users className="w-4 h-4" />
              Followers
            </TabsTrigger>
          </TabsList>

          {/* Series Tab */}
          <TabsContent value="series" className="space-y-4">
            {series.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {series.map((seriesItem) => (
                  <OptimizedSeriesCard
                    key={seriesItem.id}
                    series={seriesItem}
                    showHoverEffects={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Grid3X3 className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <div>
                  <h3 className="font-semibold mb-1">No series yet</h3>
                  <p className="text-sm text-muted-foreground">
                    {isOwnProfile ? "Start creating your first series!" : `${profile.display_name} hasn't created any series yet.`}
                  </p>
                </div>
                {isOwnProfile && (
                  <Button onClick={() => navigate('/upload')} className="bg-gradient-primary">
                    Create Series
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Likes Tab */}
          <TabsContent value="likes" className="space-y-4">
            {likedEpisodes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {likedEpisodes.map((episode) => (
                  <Card 
                    key={episode.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                    onClick={() => navigate(`/series/${episode.series.id}?episode=${episode.id}`)}
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {episode.thumbnail_url ? (
                          <img 
                            src={episode.thumbnail_url} 
                            alt={episode.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                            No thumbnail
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {episode.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {episode.series.creators.profiles.display_name} • {episode.series.title}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Episode {episode.episode_number}</span>
                          <span>{formatViews(episode.views)} views</span>
                          <span>{episode.likes} likes</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <div>
                  <h3 className="font-semibold mb-1">No liked episodes</h3>
                  <p className="text-sm text-muted-foreground">
                    Episodes you like will appear here.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-4">
            {followedCreators.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {followedCreators.map((followedCreator) => (
                  <Card 
                    key={followedCreator.creator_id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => navigate(`/user/${followedCreator.creators.profiles.username}`)}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={followedCreator.creators.profiles.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                          {followedCreator.creators.profiles.display_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{followedCreator.creators.profiles.display_name}</h4>
                          {followedCreator.creators.verified && (
                            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          @{followedCreator.creators.profiles.username} • {followedCreator.creators.follower_count} followers
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <div>
                  <h3 className="font-semibold mb-1">Not following anyone</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover and follow creators to see their content.
                  </p>
                </div>
                <Button onClick={() => navigate('/home')} variant="outline">
                  Discover Creators
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers" className="space-y-4">
            <div className="text-center py-12 space-y-3">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="font-semibold mb-1">Followers</h3>
                <p className="text-sm text-muted-foreground">
                  This feature will be available soon.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicProfilePage;