import React, { useState, useEffect } from 'react';
import { Settings, Upload, Users, LogOut, Bell, Globe, Moon, Sun, UserPlus, LogIn, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/ProfileSettings';
import { MovieThemedLoadingScreen } from '@/components/MovieThemedLoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { UserFeed } from '@/components/UserFeed';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  language_preference: string;
}

interface UserSeries {
  id: string;
  title: string;
  thumbnail_url: string;
  episode_count: number;
  total_views: number;
  status: string;
}

interface LikedSeries {
  id: string;
  title: string;
  thumbnail_url: string;
  episode_count: number;
  total_views: number;
  genre: string;
  creators: {
    id: string;
    verified: boolean;
    profiles: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
  };
}

interface LikedEpisode {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  duration: number;
  episode_number: number;
  created_at: string;
  series: {
    id: string;
    title: string;
    creators: {
      id: string;
      verified: boolean;
      profiles: {
        username: string;
        display_name: string;
        avatar_url: string;
      } | null;
    };
  };
}

interface Creator {
  id: string;
  verified: boolean;
  follower_count: number;
}

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [userSeries, setUserSeries] = useState<UserSeries[]>([]);
  const [likedSeries, setLikedSeries] = useState<LikedSeries[]>([]);
  const [likedEpisodes, setLikedEpisodes] = useState<LikedEpisode[]>([]);
  const [followedCreators, setFollowedCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Check if user is a creator
      const { data: creatorData } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (creatorData) {
        setCreator(creatorData);

        // Fetch user's series
        const { data: seriesData } = await supabase
          .from('series')
          .select('id, title, thumbnail_url, episode_count, total_views, status')
          .eq('creator_id', creatorData.id);

        if (seriesData) {
          setUserSeries(seriesData);
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
        .eq('follower_id', user.id);

      if (subscriptionsData) {
        setFollowedCreators(subscriptionsData);
      }

      // Fetch liked episodes instead of series
      const { data: likedInteractions } = await supabase
        .from('interactions')
        .select('target_id')
        .eq('user_id', user.id)
        .eq('interaction_type', 'like')
        .eq('target_type', 'episode');

      if (likedInteractions && likedInteractions.length > 0) {
        const episodeIds = likedInteractions.map(interaction => interaction.target_id);
        
        const { data: likedEpisodesData } = await supabase
          .from('episodes')
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            views,
            likes,
            duration,
            episode_number,
            created_at,
            series:series_id (
              id,
              title,
              creators (
                id,
                verified,
                profiles (
                  username,
                  display_name,
                  avatar_url
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
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (language: string) => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ language_preference: language })
      .eq('id', user.id);

    setProfile(prev => prev ? { ...prev, language_preference: language } : null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (loading) {
    return <MovieThemedLoadingScreen message={t('messages.loading_your_profile', 'profile')} />;
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 pb-20">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
              <CardTitle className="text-3xl font-bold text-gradient-primary">
                {t('header.your_profile', 'profile')}
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              {t('header.sign_in_to_access', 'profile')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/auth" className="w-full">
              <Button className="w-full bg-gradient-primary hover:opacity-90 btn-glow text-primary-foreground font-semibold py-3">
                <LogIn className="w-5 h-5 mr-2" />
                {t('header.sign_in', 'profile')}
              </Button>
            </Link>
            <Link to="/auth" className="w-full">
              <Button variant="outline" className="w-full border-2 border-primary/30 hover:border-primary/50 py-3">
                <UserPlus className="w-5 h-5 mr-2" />
                {t('header.create_new_account', 'profile')}
              </Button>
            </Link>
            <div className="text-center">
              <Link to="/home">
                <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
                  {t('header.continue_browsing_as_guest', 'profile')}
                </Button>
              </Link>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>{t('header.join_thousands', 'profile')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-2 border-primary/20 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <Avatar className="w-28 h-28 border-4 border-primary/30 shadow-2xl ring-4 ring-primary/10">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    {profile?.display_name?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                {creator?.verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                    {profile?.display_name || 'User'}
                  </h1>
                  <p className="text-muted-foreground text-lg">@{profile?.username || 'username'}</p>
                </div>
                
                {profile?.bio && (
                  <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                    <p className="text-sm leading-relaxed">{profile.bio}</p>
                  </div>
                )}
                
                {/* Enhanced Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {creator && (
                    <>
                      <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                        <div className="font-bold text-2xl text-primary">{userSeries.length}</div>
                        <div className="text-sm text-muted-foreground font-medium">Series</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="font-bold text-2xl text-blue-600">{creator.follower_count}</div>
                        <div className="text-sm text-muted-foreground font-medium">Followers</div>
                      </div>
                    </>
                  )}
                  <div className="text-center p-3 bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-lg border border-green-500/20">
                    <div className="font-bold text-2xl text-green-600">{followedCreators.length}</div>
                    <div className="text-sm text-muted-foreground font-medium">Following</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-red-500/5 to-red-500/10 rounded-lg border border-red-500/20">
                    <div className="font-bold text-2xl text-red-600">{likedEpisodes.length}</div>
                    <div className="text-sm text-muted-foreground font-medium">Likes</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="posts" className="rounded-lg font-semibold">{t('tabs.posts', 'profile')}</TabsTrigger>
            <TabsTrigger value="series" className="rounded-lg font-semibold">{t('tabs.series', 'profile')}</TabsTrigger>
            <TabsTrigger value="likes" className="rounded-lg font-semibold">{t('tabs.likes', 'profile')}</TabsTrigger>
            <TabsTrigger value="following" className="rounded-lg font-semibold">{t('tabs.following', 'profile')}</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg font-semibold">{t('tabs.settings', 'profile')}</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4 mt-6">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-1 border border-primary/20">
              <UserFeed userId={user?.id} showCreatePost={true} />
            </div>
          </TabsContent>

          {/* Series Tab */}
          <TabsContent value="series" className="space-y-6 mt-6">
            {/* Creator Dashboard */}
            {creator && (
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-2 bg-gradient-primary rounded-lg">
                      <Upload className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span>Creator Dashboard</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button 
                      onClick={() => navigate('/upload')}
                      className="bg-gradient-primary hover:opacity-90 btn-glow font-semibold py-3"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Content
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="border-2 border-primary/30 hover:border-primary/50 font-semibold py-3"
                    >
                      Analytics
                    </Button>
                  </div>

                  {/* User's Series */}
                  {userSeries.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <div className="w-2 h-6 bg-gradient-primary rounded-full"></div>
                        Your Series
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {userSeries.map((series) => (
                          <Card 
                            key={series.id}
                            className="bg-gradient-to-r from-background to-muted/30 cursor-pointer hover:shadow-lg transition-all duration-300 hover-lift border-2 border-transparent hover:border-primary/20"
                            onClick={() => navigate(`/series/${series.id}`)}
                          >
                            <div className="flex gap-4 p-4">
                              <div className="w-32 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {series.thumbnail_url ? (
                                  <img 
                                    src={series.thumbnail_url} 
                                    alt={series.title}
                                    className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="text-muted-foreground text-xs text-center p-2">No thumbnail</div>
                                )}
                              </div>
                              <div className="flex-1 space-y-2">
                                <h4 className="font-semibold line-clamp-1 text-lg hover:text-primary transition-colors">{series.title}</h4>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span className="font-medium">{series.episode_count} episodes</span>
                                    <span>•</span>
                                    <span className="font-medium">{formatViews(series.total_views)} {t('counts.views', 'common')}</span>
                                  </div>
                                  <Badge 
                                    variant={series.status === 'published' ? 'default' : 'secondary'}
                                    className={series.status === 'published' ? 'bg-gradient-primary text-primary-foreground' : ''}
                                  >
                                    {series.status === 'published' ? t('messages.published', 'profile') : t('messages.draft', 'profile')}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!creator && (
              <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-2 border-primary/20">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Become a Creator</CardTitle>
                  <CardDescription className="text-base">
                    Start creating and sharing your own series with the community.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    onClick={() => navigate('/upload')} 
                    className="bg-gradient-primary hover:opacity-90 btn-glow font-semibold py-3 px-8 text-lg"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Likes Tab */}
          <TabsContent value="likes" className="space-y-4">
            {likedEpisodes.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">Your Liked Episodes</h3>
                <div className="grid grid-cols-1 gap-4">
                  {likedEpisodes.map((episode) => (
                    <Card 
                      key={episode.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover-lift"
                      onClick={() => {
                        if (!episode.series?.id) {
                          console.warn('Episode has no series associated:', episode.id);
                          return;
                        }
                        navigate(`/series/${episode.series.id}?episode=${episode.id}`);
                      }}
                    >
                      <div className="flex gap-4 p-4">
                        <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {episode.thumbnail_url ? (
                            <img 
                              src={episode.thumbnail_url} 
                              alt={episode.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                              No thumbnail
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium line-clamp-2 text-sm mb-2">{episode.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {episode.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>Episode {episode.episode_number} • {episode.series.title}</span>
                            <div className="flex items-center gap-3">
                              <span>{formatViews(episode.views)} views</span>
                              <span>❤️ {formatViews(episode.likes)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={episode.series.creators.profiles?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {episode.series.creators.profiles?.display_name?.[0] || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">
                              {episode.series.creators.profiles?.display_name}
                            </span>
                            {episode.series.creators.verified && (
                              <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">❤️</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No liked episodes yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Like episodes you enjoy to see them here.
                  </p>
                  <Button onClick={() => navigate('/home')}>
                    Discover Episodes
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-4">
            {followedCreators.length > 0 ? (
              <div className="space-y-3">
                {followedCreators.map((subscription) => (
                  <Card key={subscription.creator_id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={subscription.creators.profiles?.avatar_url} />
                          <AvatarFallback>
                            {subscription.creators.profiles?.display_name?.[0] || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {subscription.creators.profiles?.display_name}
                            </span>
                            {subscription.creators.verified && (
                              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{subscription.creators.profiles?.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.creators.follower_count} followers
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/creator/${subscription.creator_id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No followed creators yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Discover and follow creators to see their content in your feed.
                  </p>
                  <Button onClick={() => navigate('/home')}>
                    {t('following.discover_creators', 'profile')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <ProfileSettings />
            
            {/* Sign Out Section */}
            <Card>
              <CardContent className="p-6">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;