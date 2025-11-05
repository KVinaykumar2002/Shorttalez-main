// Translation System for Short Talez
// Multi-language support: Tinglish (default), English, Telugu

import { useLanguage } from '@/contexts/LanguageContext';

// Static imports for EN and TE JSON translations
import enCommon from '@/translations/en/common.json';
import enNavigation from '@/translations/en/navigation.json';
import enHomepage from '@/translations/en/homepage.json';
import enAuth from '@/translations/en/auth.json';
import enVideos from '@/translations/en/videos.json';
import enComments from '@/translations/en/comments.json';
import enProfile from '@/translations/en/profile.json';
import enFeed from '@/translations/en/feed.json';

import teCommon from '@/translations/te/common.json';
import teNavigation from '@/translations/te/navigation.json';
import teHomepage from '@/translations/te/homepage.json';
import teAuth from '@/translations/te/auth.json';
import teVideos from '@/translations/te/videos.json';
import teComments from '@/translations/te/comments.json';
import teProfile from '@/translations/te/profile.json';
import teFeed from '@/translations/te/feed.json';

// Tinglish legacy types
export interface TranslationMap {
  [key: string]: any;
}

export interface PageTranslations {
  [key: string]: TranslationMap;
}

// Core translation data
export const translations: PageTranslations = {
  common: {
    // Navigation & Global
    'Short Talez': 'Short Talez',
    'Home': 'Home',
    'Videos': 'Videos',
    'Feed': 'Feed',
    'Profile': 'Profile', 
    'Login cheskondi': 'Login cheskondi',
    'Signup cheskondi': 'Signup cheskondi',
    'Join cheskondi': 'Join cheskondi',
    'Login avvandi': 'Login avvandi',
    'Logout cheskondi': 'Logout cheskondi',
    
    // Actions
    'Watch Now': 'Ippudu choosandi',
    'Upload': 'Upload cheyandi',
    'Subscribe': 'Subscribe avandi',
    'Like': 'Like cheyyandi',
    'Share': 'Share cheyyandi', 
    'Comment': 'Comment cheyyandi',
    'Follow': 'Follow avandi',
    'Search': 'Search cheskondi',
    'Try Again': 'Malli try cheyyandi',
    'Refresh': 'Refresh cheskondi',
    'Load More': 'Inka load cheyyandi',
    
    // Status messages
    'Loading...': 'Loading avthundi...',
    'No results found': 'Kontha results levu — vere search cheyyandi',
    'Something went wrong': 'Ento problem ayyindi',
    'Success': 'Success ayyindi',
    'Error': 'Error ayyindi',
    
    // Time & Counts
    'views': 'views',
    'likes': 'likes',
    'comments': 'comments',
    'episodes': 'episodes',
    'series': 'series',
    'ago': 'mundu',
    'now': 'ippudu',
    
    // Forms
    'Email': 'Email',
    'Password': 'Password',
    'Username': 'Username',
    'Display Name': 'Display Name',
    'Submit': 'Submit cheyyandi',
    'Cancel': 'Cancel cheyyandi',
    'Save': 'Save cheyyandi',
    'Delete': 'Delete cheyyandi',
    'Edit': 'Edit cheyyandi',
  },
  
  homepage: {
    // Hero section
    'Captivating Short Series': 'Captivating Short Series — Short Talez lo',
    'Discovering amazing stories...': 'Amazing stories discover chesthunnam...',
    'Short films & Stories': 'Short films & Stories',
    'MiniOTT for Everyone': 'MiniOTT for Everyone — Andhari kosam',
    'Watch Telugu Short Series': 'Telugu Short Series chooskondi',
    'Join millions creating and watching': 'Millions mandi tho create chesi chooskondi',
    
    // Search
    'Series, creators kosam search cheskondi...': 'Series, creators kosam search cheskondi...',
    'Search cheskondi': 'Search cheskondi',
    
    // Series sections
    'Trending Now': 'Ippudu Trending',
    'Editor\'s Picks': 'Editor\'s Picks — Maadi Choice',
    'Recently Added': 'Recently Added — Kotha Kotha',
    'Most Watched': 'Most Watched — Ekkuva Choosaaru',
    'Popular Series': 'Popular Series — Hit Ayyinavi',
    'New Releases': 'New Releases — Fresh Content',
    'Latest Series': 'Latest Series — Kotha Series lu',
    'Drama Series': 'Drama Series — Drama kavali ante',
    'Love Series': 'Love Series — Prema Stories',
    
    // Stats & Info
    'Total Views': 'Total Views',
    'Active Users': 'Active Users',
    'Series Available': 'Series Available',
    'Hours of Content': 'Hours Content',
    
    // Empty states
    'No series found': 'Series levu bro',
    'Start exploring': 'Explore start cheyyandi',
    'Check out trending': 'Trending choodu',
    'Upload your story': 'Mee story upload cheyyandi',
  },
  
  auth: {
    // Page title
    'Short Talez — Authentication': 'Short Talez — Login/Signup Page',
    
    // Headers
    'Welcome to Short Talez': 'Short Talez ki Welcome',
    'Create your account': 'Mee account create cheskondi',
    'Sign in to continue': 'Continue avvadaniki sign in cheyyandi',
    
    // Tabs
    'Login cheskondi': 'Login cheskondi',
    'Signup cheskondi': 'Signup cheskondi', 
    
    // Form labels
    'mee@email.com': 'mee@email.com',
    '••••••••': '••••••••',
    'mee username': 'mee username',
    'Mee Peru': 'Mee Peru',
    
    // Buttons & Actions
    'Account create cheskondi': 'Account create cheskondi',
    'Login avvandi': 'Login avvandi',
    'Account create chestunnam...': 'Account create chestunnam...',
    'Login avthunnam...': 'Login avthunnam...',
    
    // Messages
    'Continue chesthunnapudu, maadi Terms of Service and Privacy Policy ki agree avuthunnaru': 'Continue chesthunnapudu, maadi Terms of Service and Privacy Policy ki agree avuthunnaru',
    'Preparing your authentication...': 'Mee authentication prepare chesthunnam...',
  },
  
  navigation: {
    // Bottom Navigation
    'Home': 'Home',
    'Videos': 'Video lu',
    'Feed': 'Naa Feed', 
    'Profile': 'Naa Profile',
    'Login cheskondi': 'Login Avvu',
    
    // Navbar dropdown
    'Settings': 'Settings',
    'Analytics': 'Analytics',
    'Logout cheskondi': 'Logout cheskondi',
  },
  
  videos: {
    // Page content
    'All Videos': 'Anni Videos',
    'Trending Videos': 'Trending Videos',
    'Latest Uploads': 'Latest Uploads — Kotha Uploads',
    'Most Liked': 'Most Liked — Ekkuva Likes',
    'Watch Later': 'Watch Later — Tharuvatha Choodu',
    'Your Favorites': 'Mee Favorites',
    
    // Filters
    'Filter by Genre': 'Genre prakaram filter cheyyandi',
    'Sort by': 'Sort cheyyandi',
    'Duration': 'Duration',
    'Upload Date': 'Upload Date',
    'View Count': 'View Count',
  },
  
  feed: {
    // Social feed
    'Your Feed': 'Mee Feed',
    'Following': 'Following — Follow chesinavaallu',
    'For You': 'For You — Meekosam',
    'Trending': 'Trending',
    
    // Posts
    'What\'s on your mind?': 'Mee mind lo enti?',
    'Share your thoughts...': 'Mee thoughts share cheyyandi...',
    'Post cheyyandi': 'Post cheyyandi',
    'Comment cheyyandi': 'Comment cheyyandi',
    
    // Interactions
    'liked your post': 'mee post ni like chesaaru',
    'commented on your post': 'mee post meeda comment chesaaru', 
    'started following you': 'meeku follow ayyaaru',
    'shared your video': 'mee video share chesaaru',
  },
  
  comments: {
    // Comment section
    'Comments': 'Comments',
    'Add a comment...': 'Comment add cheyyandi...',
    'Reply cheyyandi': 'Reply cheyyandi',
    'View replies': 'Replies choodu',
    'Hide replies': 'Replies hide cheyyandi',
    'Load more comments': 'Inka comments load cheyyandi',
    'No comments yet': 'Comments levu inka',
    'Be the first to comment': 'First comment meeru cheyyandi',
    
    // Comment actions
    'Like this comment': 'Ee comment like cheyyandi',
    'Reply to comment': 'Comment ki reply cheyyandi',
    'Delete comment': 'Comment delete cheyyandi',
    'Edit comment': 'Comment edit cheyyandi',
    'Report comment': 'Comment report cheyyandi',
    
    // Comment status
    'Comment posted successfully': 'Comment successfully post ayyindi',
    'Reply posted': 'Reply post ayyindi',
    'Comment updated': 'Comment update ayyindi',
    'Comment deleted': 'Comment delete ayyindi',
  },
  
  loading: {
    // Loading messages
    'Discovering amazing stories...': 'Amazing stories discover chesthunnam...',
    'Loading your content...': 'Mee content load chesthunnam...',
    'Preparing your experience...': 'Mee experience prepare chesthunnam...',
    'Getting things ready...': 'Anni ready chesthunnam...',
    'Almost there...': 'Almost ayyipoyindi...',
    'Setting up your profile...': 'Mee profile setup chesthunnam...',
    'Fetching latest videos...': 'Latest videos fetch chesthunnam...',
  }
};

// Helper function to get translation - now uses LanguageContext
export function t(key: string, page: string = 'common'): string {
  // This is a fallback for non-React contexts
  const langKey = localStorage.getItem('short-talez-language') || 'tinglish';
  
  // First try the specific page
  if (translations[page] && translations[page][key]) {
    return translations[page][key];
  }
  
  // Fall back to common translations
  if (translations.common[key]) {
    return translations.common[key];
  }
  
  // Return original key if no translation found
  return key;
}

// Hook for using translations in React components - now uses LanguageContext
export function useTranslation(page: string = 'common') {
  const { t: contextT, currentLanguage } = useLanguage();
  
  return {
    t: (key: string) => contextT(key, page),
    translations: translations[page] || translations.common,
    currentLanguage
  };
}

// Batch translate function for multiple keys
export function translateKeys(keys: string[], page: string = 'common'): TranslationMap {
  const result: TranslationMap = {};
  keys.forEach(key => {
    result[key] = t(key, page);
  });
  return result;
}

// SEO Meta translations
export const seoTranslations = {
  homepage: {
    title: 'Short Talez — Short Series & Stories | Telugu Short Films',
    description: 'Short Talez lo short films & series chooskondi. Create, watch, share — MiniOTT for everyone. Telugu short stories, web series ikkada chooskondi.'
  },
  auth: {
    title: 'Login/Signup — Short Talez | Telugu Short Films Platform',
    description: 'Short Talez ki join avandi. Login cheskondi leda signup cheskondi short films, series choosadaniki. Telugu content creators & viewers ki perfect platform.'
  },
  videos: {
    title: 'All Videos — Short Talez | Telugu Short Films & Series',
    description: 'Anni videos ikkada chooskondi. Latest uploads, trending content, most liked videos — Short Talez lo Telugu short films & series.'
  },
  feed: {
    title: 'Your Feed — Short Talez | Personal Content Feed',
    description: 'Mee personal feed chooskondi. Following creators, trending posts, personalized content — Short Talez lo mee kosam curated content.'
  }
};

export default translations;