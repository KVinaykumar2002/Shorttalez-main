// Tinglish Context Provider for Website-wide Translation Management
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, useTranslation } from '@/lib/translations';

interface TinglishContextType {
  isEnabled: boolean;
  toggleTinglish: () => void;
  currentLanguage: 'en' | 'tinglish';
  t: (key: string, page?: string) => string;
}

const TinglishContext = createContext<TinglishContextType | undefined>(undefined);

interface TinglishProviderProps {
  children: React.ReactNode;
  defaultEnabled?: boolean;
}

export function TinglishProvider({ children, defaultEnabled = true }: TinglishProviderProps) {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  
  // Check for URL parameter to enable/disable Tinglish
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    
    if (langParam === 'en') {
      setIsEnabled(false);
    } else if (langParam === 'tinglish') {
      setIsEnabled(true);
    }
    
    // Store preference in localStorage
    const stored = localStorage.getItem('tinglish-enabled');
    if (stored !== null && !langParam) {
      setIsEnabled(JSON.parse(stored));
    }
  }, []);
  
  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem('tinglish-enabled', JSON.stringify(isEnabled));
  }, [isEnabled]);
  
  const toggleTinglish = () => {
    setIsEnabled(!isEnabled);
  };
  
  const t = (key: string, page: string = 'common') => {
    if (!isEnabled) {
      return key; // Return original text if Tinglish is disabled
    }
    
    // Use the translation system
    const { t: translate } = useTranslation(page);
    return translate(key);
  };
  
  const value: TinglishContextType = {
    isEnabled,
    toggleTinglish,
    currentLanguage: isEnabled ? 'tinglish' : 'en',
    t
  };
  
  return (
    <TinglishContext.Provider value={value}>
      {children}
    </TinglishContext.Provider>
  );
}

export function useTinglish() {
  const context = useContext(TinglishContext);
  if (context === undefined) {
    throw new Error('useTinglish must be used within a TinglishProvider');
  }
  return context;
}

// Debug component to toggle language in development
export function TinglishToggle() {
  const { isEnabled, toggleTinglish, currentLanguage } = useTinglish();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggleTinglish}
        className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700 transition-colors"
        title="Toggle Tinglish Translation"
      >
        {currentLanguage.toUpperCase()}
      </button>
    </div>
  );
}

export default TinglishProvider;