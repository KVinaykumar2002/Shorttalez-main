import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const languages = [
  { code: 'tinglish', name: 'Tinglish', displayName: 'Tinglish' },
  { code: 'telugu', name: 'తెలుగు', displayName: 'Telugu' },
  { code: 'english', name: 'English', displayName: 'English' },
] as const;

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  const currentLang = languages.find(lang => lang.code === currentLanguage);

  // Calculate position for portal menu
  const calculatePosition = () => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth <= 640;
    
    if (isMobile) {
      // Center on mobile with margin
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(16, Math.min(window.innerWidth - 144, rect.left))
      });
    } else {
      // Desktop positioning with viewport overflow protection
      const menuWidth = 128; // w-32
      let left = rect.left;
      
      // Prevent overflow on right edge
      if (left + menuWidth > window.innerWidth - 16) {
        left = rect.right - menuWidth;
      }
      
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(16, left)
      });
    }
  };

  // Handle outside clicks
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current && 
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Calculate position when opening
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      // Recalculate on window resize
      const handleResize = () => calculatePosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (languageCode: Language) => {
    setLanguage(languageCode);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  // Portal menu component
  const portalMenu = isOpen && createPortal(
    <div 
      ref={menuRef}
      role="menu"
      aria-labelledby="language-switcher-button"
      className="fixed z-[10000] w-32 sm:w-36 bg-black/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: '60vh'
      }}
    >
      <div className="overflow-auto max-h-[inherit]">
        {languages.map((language, index) => (
          <button
            key={language.code}
            role="menuitem"
            tabIndex={-1}
            onClick={() => handleLanguageSelect(language.code as Language)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLanguageSelect(language.code as Language);
              }
            }}
            className={`w-full px-3 py-3 sm:py-2 text-xs font-medium text-left hover:bg-white/20 transition-colors min-h-[44px] sm:min-h-[32px] flex items-center ${
              currentLanguage === language.code 
                ? 'bg-white/10 text-white' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            {language.displayName}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
  
  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id="language-switcher-button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="language-menu"
        className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        {currentLang?.displayName || 'Language'}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {portalMenu}
    </div>
  );
}

export default LanguageSwitcher;