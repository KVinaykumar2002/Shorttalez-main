import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, User, Play, Settings } from 'lucide-react';
import { StickySubscribeButton } from '@/components/StickySubscribeButton';
import { ShortTalezLogo } from '@/components/ShortTalezLogo';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import { ContinueWatchingCarousel } from '@/components/ContinueWatchingCarousel';
import { OptimizedImage } from '@/components/OptimizedImage';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import StaticCarousel from '@/components/StaticCarousel';
import CarouselWithDots from '@/components/CarouselWithDots';
import { AutoScrollCarousel, SeriesCardWrapper } from '@/components/AutoScrollCarousel';
import { useWatchProgress } from '@/hooks/useWatchProgress';
import newBadge from '@/assets/new-badge.png';

// SEO Hook for setting meta tags
const useSEOTranslation = (page: string) => {
  const { t } = useLanguage();
  useEffect(() => {
    document.title = t('meta.title', 'homepage');
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('meta.description', 'homepage'));
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', t('meta.description', 'homepage'));
      document.head.appendChild(metaDescription);
    }
  }, [page, t]);
};

interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  genre: string;
  language: string;
  episode_count: number;
  total_views: number;
  status: string;
  created_at: string;
  updated_at: string;
  creator_id: string;
  source_platform?: string;
  is_premium?: boolean;
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

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [animationsActive, setAnimationsActive] = useState(true);

  // Auto-disable animations after 5 seconds
  useEffect(() => {
    const animationTimer = setTimeout(() => {
      setAnimationsActive(false);
    }, 5000);
    return () => clearTimeout(animationTimer);
  }, []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { continueWatching, removeFromContinueWatching } = useWatchProgress();

  // Update SEO meta tags for homepage
  useSEOTranslation('homepage');

  const fetchSeries = async ({ pageParam = 0 }) => {
    const limit = 20;
    const offset = pageParam * limit;
    try {
      let query = supabase
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
        .eq('status', 'published');
      query = query.order('total_views', { ascending: false });
      query = query.range(offset, offset + limit - 1);
      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%`
        );
      }
      const { data, error } = await query;
      if (error) {
        return [];
      }
      return data || [];
    } catch (error) {
      return [];
    }
  };

  const fetchTrendingSeries = async ({ pageParam = 0 }) => {
    const limit = 20;
    const offset = pageParam * limit;
    try {
      let query = supabase
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
        .eq('status', 'published')
        .order('total_views', { ascending: false });
      query = query.range(offset, offset + limit - 1);
      const { data, error } = await query;
      if (error) {
        return [];
      }
      return data || [];
    } catch (error) {
      return [];
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
    error: seriesError,
  } = useInfiniteQuery({
    queryKey: ['series', searchQuery],
    queryFn: fetchSeries,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  const {
    data: trendingSeriesData,
    status: trendingSeriesStatus,
  } = useInfiniteQuery({
    queryKey: ['series', 'trending'],
    queryFn: fetchTrendingSeries,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    if (urlSearchQuery && urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  const series = data?.pages.flat() || [];
  const trendingSeries = trendingSeriesData?.pages.flat() || [];

  const getSeriesButtonColor = (index?: number) => {
    return 'from-[hsl(354_70%_57%)] to-[hsl(345_75%_25%)]';
  };

  const shuffleArray = (array: Series[], seed?: number): Series[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const prioritySeries = series.filter(
    (s) =>
      s.title.includes('Miss Unlucky') ||
      s.title.includes('Auto Johny S 2') ||
      s.title.includes('2 Hours Romance')
  );

  const shuffledSeries1 = shuffleArray(series);
  const shuffledSeries2 = shuffleArray(series);
  const shuffledSeries3 = shuffleArray(series);
  const shuffledSeries4 = shuffleArray(series);
  const shuffledTrendingSeries = shuffleArray(trendingSeries);

  const getRecentSeries = (): Series[] => {
    const recent: Series[] = [...prioritySeries];
    const remaining = shuffledSeries1.filter(
      (s) => !prioritySeries.find((ps) => ps.id === s.id)
    );
    recent.push(...remaining.slice(0, 12));
    return recent.slice(0, 15);
  };

  const getDramaSeries = (): Series[] => {
    const dramaFiltered = shuffledSeries2.filter(
      (s) =>
        s.genre &&
        (s.genre.toLowerCase().includes('drama') ||
          s.genre.toLowerCase().includes('thriller') ||
          s.genre.toLowerCase().includes('action') ||
          s.title.toLowerCase().includes('auto') ||
          s.title.toLowerCase().includes('2 hours romance'))
    );

    if (dramaFiltered.length < 12) {
      const additionalSeries = shuffledSeries2.filter(
        (s) => !dramaFiltered.find((ds) => ds.id === s.id)
      );
      dramaFiltered.push(...additionalSeries.slice(0, 12 - dramaFiltered.length));
    }
    return dramaFiltered.slice(0, 12);
  };

  const getRomanceSeries = (): Series[] => {
    const romanceFiltered = shuffledSeries3.filter(
      (s) =>
        s.genre &&
        (s.genre.toLowerCase().includes('romance') ||
          s.genre.toLowerCase().includes('love') ||
          s.genre.toLowerCase().includes('drama') ||
          s.title.toLowerCase().includes('miss') ||
          s.title.toLowerCase().includes('prema'))
    );

    if (romanceFiltered.length < 10) {
      const additionalSeries = shuffledSeries3.filter(
        (s) => !romanceFiltered.find((rs) => rs.id === s.id)
      );
      romanceFiltered.push(...additionalSeries.slice(0, 10 - romanceFiltered.length));
    }
    return romanceFiltered.slice(0, 10);
  };

  const getLoveSeries = (): Series[] => {
    const loveFiltered = shuffledSeries4.filter(
      (s) =>
        (s.description &&
          (s.description.toLowerCase().includes('love') ||
            s.description.toLowerCase().includes('romance') ||
            s.description.toLowerCase().includes('heart') ||
            s.title.toLowerCase().includes('love') ||
            s.title.toLowerCase().includes('prema') ||
            s.title.toLowerCase().includes('miss'))) ||
        (s.genre &&
          (s.genre.toLowerCase().includes('romance') || s.genre.toLowerCase().includes('drama')))
    );

    if (loveFiltered.length < 8) {
      const additionalSeries = shuffledSeries4.filter(
        (s) => !loveFiltered.find((ls) => ls.id === s.id)
      );
      loveFiltered.push(...additionalSeries.slice(0, 8 - loveFiltered.length));
    }
    return loveFiltered.slice(0, 8);
  };

  const finalRecentSeries = getRecentSeries();
  const finalDramaSeries = getDramaSeries();
  const finalRomanceSeries = getRomanceSeries();
  const finalLoveSeries = getLoveSeries();
  const finalTrendingSeries = shuffledTrendingSeries.slice(0, 20);

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">
          {t('loading.discovering_stories', 'homepage')}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-primary mb-4">{t('messages.something_went_wrong', 'common')}</div>
          <Button onClick={() => refetch()}>{t('actions.try_again', 'common')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 overflow-y-auto overflow-x-hidden bg-background">
      {/* Clean Header - Sticky */}
      <header
        className="sticky top-0 z-40 overflow-hidden mb-8 bg-background"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)'
        }}
      >
        <div className="relative z-10 flex items-center justify-between p-3">
          {/* Left: Logo and Language */}
          <div className="flex items-center gap-3">
            <ShortTalezLogo size="sm" />
            <LanguageSwitcher />
          </div>

          {/* Right: User Profile & Other Elements */}
          <div className="flex items-center gap-3">
            {/* User Profile Display */}
          </div>
        </div>
      </header>

      {/* Sticky Subscribe Button with Scroll Behavior */}
      <StickySubscribeButton />

      {/* Content Sections */}
      <div className="px-4 py-6 space-y-8">
        {/* Trending Series Section */}
        <div className="space-y-6 mb-6">
          <h2 className="font-montserrat text-xl md:text-2xl font-semibold text-white px-4">
            <span className="text-white">{t('sections.trending_now', 'homepage')}</span> 🔥
          </h2>
          <div className="relative overflow-hidden pb-8">
            <CarouselWithDots
              className="px-4 relative z-10"
              autoScroll={true}
              autoScrollInterval={4000}
            >
              {finalTrendingSeries.map((item, index) => (
                <SeriesCardWrapper key={`trending-${item.id}`} onClick={() => navigate(`/series/${item.id}`)}>
                  <div className="w-40 aspect-[3/4] rounded-xl overflow-hidden relative transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl will-change-transform">
                    <OptimizedImage
                      src={item.thumbnail_url || '/src/assets/auto-johny-s2-thumbnail.png'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      seriesTitle={item.title}
                      sizes="(max-width: 768px) 40vw, 200px"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute top-0 right-0">
                      <div className="bg-red-600 text-white px-2 py-1 rounded-bl-lg text-xs font-bold shadow-lg">
                        {t('trending', 'ui')}
                      </div>
                    </div>
                    {item.is_premium && (
                      <div className="absolute bottom-12 right-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          PREMIUM
                        </div>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-background/20 backdrop-blur-sm rounded-full p-2 border border-border/30 shadow-2xl">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 break-words drop-shadow-lg tracking-wide">
                        {item.title.replace(/_/g, ' ') || 'Untitled'}
                      </h4>
                    </div>
                  </div>
                </SeriesCardWrapper>
              ))}
            </CarouselWithDots>
          </div>
        </div>

        {/* Continue Watching Section - Only for logged in users */}
        {user && continueWatching.length > 0 && (
          <ContinueWatchingCarousel episodes={continueWatching} onRemove={removeFromContinueWatching} />
        )}

        {/* Latest Series Section */}
        <div className="space-y-6 mb-6">
          <h2 className="font-montserrat text-xl md:text-2xl font-semibold text-white px-4 flex items-center gap-2">
            {t('sections.latest_series', 'homepage')} <img src={newBadge} alt="NEW" className="w-8 h-8 brightness-10 contrast-12 saturate-150" />
          </h2>
          <CarouselWithDots className="px-4 custom-dots" autoScroll={false}>
            {finalRecentSeries.map((item, index) => (
              <SeriesCardWrapper key={`latest-${item.id}`} onClick={() => navigate(`/series/${item.id}`)}>
                <div className="w-40 aspect-[3/4] rounded-xl overflow-hidden relative transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl will-change-transform">
                  <OptimizedImage
                    src={item.thumbnail_url || '/src/assets/auto-johny-s2-thumbnail.png'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    seriesTitle={item.title}
                    sizes="(max-width: 768px) 40vw, 200px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-0 right-0">
                    <div className="bg-red-600 text-white px-2 py-1 rounded-bl-lg text-xs font-bold shadow-lg">
                      {t('new', 'ui')}
                    </div>
                  </div>
                  {item.is_premium && (
                    <div className="absolute bottom-12 right-3">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        PREMIUM
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-background/20 backdrop-blur-sm rounded-full p-2 border border-border/30 shadow-2xl">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 break-words">
                      {item.title || 'Untitled'}
                    </h4>
                  </div>
                </div>
              </SeriesCardWrapper>
            ))}
          </CarouselWithDots>
        </div>

        {/* Romance Section - Hot & Spicy */}
        <div className="space-y-6 mb-12">
          <div className="px-4">
            <h2 className="font-cinzel text-xl md:text-2xl font-semibold flex items-center gap-3 text-white">
              <span>{t('sections.romance_subtitle', 'homepage')}</span>
              <span aria-hidden="true" className="text-red-600 drop-shadow-sm text-lg md:text-xl">
                💋
              </span>
            </h2>
          </div>

          <CarouselWithDots className="px-4 custom-dots" autoScroll={false}>
            {finalRomanceSeries.map((item, index) => (
              <SeriesCardWrapper key={`romance-${item.id}`} onClick={() => navigate(`/series/${item.id}`)}>
                <div className="w-40 aspect-[3/4] rounded-2xl overflow-hidden relative transform transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl">
                  <OptimizedImage
                    src={item.thumbnail_url || '/src/assets/im-not-virgin-new-thumbnail.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    seriesTitle={item.title}
                    sizes="(max-width: 768px) 40vw, 200px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-0 right-0">
                    <div className="bg-red-700 text-white px-2 py-1 rounded-bl-lg text-xs font-bold shadow-lg">
                      {t('hot', 'ui')}
                    </div>
                  </div>
                  {item.is_premium && (
                    <div className="absolute bottom-12 right-3">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        PREMIUM
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-background/20 backdrop-blur-sm rounded-full p-2 border border-border/30 shadow-2xl">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 break-words">
                      {item.title || 'Untitled'}
                    </h4>
                  </div>
                </div>
              </SeriesCardWrapper>
            ))}
          </CarouselWithDots>
        </div>

        {/* Drama Section */}
        <div className="space-y-6 mb-12">
          <h2 className="font-montserrat text-xl md:text-2xl font-semibold text-white px-4">
            {t('sections.drama_subtitle', 'homepage')} 🎭
          </h2>
          <CarouselWithDots className="px-4 custom-dots" autoScroll={false}>
            {finalDramaSeries.map((item, index) => (
              <SeriesCardWrapper key={item.id} onClick={() => navigate(`/series/${item.id}`)}>
                <div className="w-40 aspect-[3/4] rounded-2xl overflow-hidden relative transform transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl">
                  <OptimizedImage
                    src={item.thumbnail_url || '/src/assets/trio-series-thumbnail.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    seriesTitle={item.title}
                    sizes="(max-width: 768px) 40vw, 200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-0 right-0">
                    <div className="bg-red-800 text-white px-2 py-1 rounded-bl-lg text-xs font-bold shadow-lg">
                      {t('drama', 'ui')}
                    </div>
                  </div>
                  {item.is_premium && (
                    <div className="absolute bottom-12 right-3">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        PREMIUM
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-orange-500 backdrop-blur-sm rounded-full p-2 border border-border/30 shadow-2xl">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 break-words">
                      {item.title || 'Untitled'}
                    </h4>
                  </div>
                </div>
              </SeriesCardWrapper>
            ))}
          </CarouselWithDots>
        </div>

        {/* Love Series Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center space-x-3 px-4">
            <h2 className="font-cinzel text-xl md:text-2xl font-semibold text-white">
              {t('sections.love_subtitle', 'homepage')}
            </h2>
            <div className="text-pink-400 text-xl drop-shadow-sm">💕</div>
          </div>

          <CarouselWithDots className="px-4 custom-dots" autoScroll={false}>
            {finalLoveSeries.map((item, index) => (
              <SeriesCardWrapper key={`love-${item.id}`} onClick={() => navigate(`/series/${item.id}`)}>
                <div className="w-40 aspect-[3/4] rounded-2xl overflow-hidden relative transform transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl">
                  <OptimizedImage
                    src={item.thumbnail_url || '/src/assets/im-not-virgin-new-thumbnail.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    seriesTitle={item.title}
                    sizes="(max-width: 768px) 40vw, 200px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-0 right-0">
                    <div className="bg-pink-600 text-white px-2 py-1 rounded-bl-lg text-xs font-bold shadow-lg">
                      LOVE
                    </div>
                  </div>
                  {item.is_premium && (
                    <div className="absolute bottom-12 right-3">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        PREMIUM
                      </div>
                    </div>
                  )}

                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-gradient-to-br from-pink-200 to-pink-300 backdrop-blur-sm rounded-full p-2 border border-border/30 shadow-2xl">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 break-words">
                      {item.title || 'Untitled'}
                    </h4>
                  </div>
                </div>
              </SeriesCardWrapper>
            ))}
          </CarouselWithDots>
        </div>

        {/* Load More if needed */}
        {hasNextPage && (
          <div className="text-center pt-8">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-black text-white px-8 py-3 rounded-full"
            >
              {isFetchingNextPage ? t('status.loading', 'common') : t('actions.load_more', 'common')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;