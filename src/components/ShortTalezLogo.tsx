import React from 'react';
import headerLogo from '@/assets/short-talez-new-main-logo.png';

interface ShortTalezLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ShortTalezLogo: React.FC<ShortTalezLogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeConfig = {
    sm: 'h-10 md:h-12',
    md: 'h-12 md:h-14',
    lg: 'h-14 md:h-16'
  };

  return (
    <img 
      src={headerLogo} 
      alt="Short Talez" 
      className={`${sizeConfig[size]} w-auto object-contain ${className}`}
    />
  );
};