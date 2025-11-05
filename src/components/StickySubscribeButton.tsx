import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

export const StickySubscribeButton: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribeClick = () => {
    navigate('/subscription');
  };

  return (
    <div 
      className="fixed right-4 z-50"
      style={{
        top: 'calc(env(safe-area-inset-top) + 0.75rem)'
      }}
    >
      <Button
        onClick={handleSubscribeClick}
        className={`bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 text-white font-bold rounded-full shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-blue-400/50 hover:border-blue-300 hover:shadow-blue-400/30 ${
          isScrolled ? 'px-3 py-2 sm:px-4 sm:py-2.5' : 'px-4 py-2 sm:px-6 sm:py-2.5'
        }`}
      >
        <Crown className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-lg" />
        {!isScrolled && (
          <span className="ml-2 drop-shadow-md text-xs sm:text-sm">Subscribe</span>
        )}
      </Button>
    </div>
  );
};