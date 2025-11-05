import React, { createContext, useContext, useState, useEffect } from 'react';

// Import all translation files statically
import tinglishCommon from '@/translations/tinglish/common.json';
import tinglishNavigation from '@/translations/tinglish/navigation.json';
import tinglishHomepage from '@/translations/tinglish/homepage.json';
import tinglishAuth from '@/translations/tinglish/auth.json';
import tinglishVideos from '@/translations/tinglish/videos.json';
import tinglishComments from '@/translations/tinglish/comments.json';
import tinglishProfile from '@/translations/tinglish/profile.json';
import tinglishFeed from '@/translations/tinglish/feed.json';
import tinglishUI from '@/translations/tinglish/ui.json';

import englishCommon from '@/translations/en/common.json';
import englishNavigation from '@/translations/en/navigation.json';
import englishHomepage from '@/translations/en/homepage.json';
import englishAuth from '@/translations/en/auth.json';
import englishVideos from '@/translations/en/videos.json';
import englishComments from '@/translations/en/comments.json';
import englishProfile from '@/translations/en/profile.json';
import englishFeed from '@/translations/en/feed.json';
import englishUI from '@/translations/en/ui.json';

import teluguCommon from '@/translations/te/common.json';
import teluguNavigation from '@/translations/te/navigation.json';
import teluguHomepage from '@/translations/te/homepage.json';
import teluguAuth from '@/translations/te/auth.json';
import teluguVideos from '@/translations/te/videos.json';
import teluguComments from '@/translations/te/comments.json';
import teluguProfile from '@/translations/te/profile.json';
import teluguFeed from '@/translations/te/feed.json';
import teluguUI from '@/translations/te/ui.json';

export type Language = 'english' | 'tinglish' | 'telugu';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, page?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

// Translation store organized by language and page
const translations = {
  tinglish: {
    common: tinglishCommon,
    navigation: tinglishNavigation,
    homepage: tinglishHomepage,
    auth: tinglishAuth,
    videos: tinglishVideos,
    comments: tinglishComments,
    profile: tinglishProfile,
    feed: tinglishFeed,
    ui: tinglishUI,
  },
  english: {
    common: englishCommon,
    navigation: englishNavigation,
    homepage: englishHomepage,
    auth: englishAuth,
    videos: englishVideos,
    comments: englishComments,
    profile: englishProfile,
    feed: englishFeed,
    ui: englishUI,
  },
  telugu: {
    common: teluguCommon,
    navigation: teluguNavigation,
    homepage: teluguHomepage,
    auth: teluguAuth,
    videos: teluguVideos,
    comments: teluguComments,
    profile: teluguProfile,
    feed: teluguFeed,
    ui: teluguUI,
  },
};

export function LanguageProvider({ children, defaultLanguage = 'tinglish' }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('tinglish');
  
  // Load language preference from localStorage or URL, default to Tinglish for new users
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') as Language;
    
    if (langParam && ['english', 'tinglish', 'telugu'].includes(langParam)) {
      setCurrentLanguage(langParam);
    } else {
      const stored = localStorage.getItem('short-talez-language') as Language;
      if (stored && ['english', 'tinglish', 'telugu'].includes(stored)) {
        setCurrentLanguage(stored);
      } else {
        // Default to Tinglish for new users
        setCurrentLanguage('tinglish');
        localStorage.setItem('short-talez-language', 'tinglish');
      }
    }
  }, []);
  
  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('short-talez-language', currentLanguage);
  }, [currentLanguage]);
  
  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };
  
  const t = (key: string, page: string = 'common') => {
    try {
      const langTranslations = translations[currentLanguage as keyof typeof translations] as any;
      const tinglishTranslations = translations.tinglish as any;
      const englishTranslations = translations.english as any;
      const pageTranslations = langTranslations?.[page] as any;
      const pageFallback = tinglishTranslations?.[page] as any;
      const englishFallback = englishTranslations?.[page] as any;

      const resolve = (obj: any, path: string) => {
        if (!obj) return undefined;
        return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
      };

      // Try current language first
      let translation = resolve(pageTranslations, key);
      
      // If not found and current language is not English, try English as fallback
      if (translation === undefined && currentLanguage !== 'english') {
        translation = resolve(englishFallback, key);
      }
      
      // If still not found, try Tinglish as final fallback
      if (translation === undefined) {
        translation = resolve(pageFallback, key);
      }
      
      return translation ?? key;
    } catch (error) {
      return key;
    }
  };
  
  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageProvider;