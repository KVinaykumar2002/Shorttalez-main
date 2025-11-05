import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    light: {
      primary: string;
      primaryForeground: string;
      primaryVariant: string;
      secondary: string;
      secondaryForeground: string;
      secondaryVariant: string;
      accent: string;
      accentForeground: string;
      accentVariant: string;
      gradientPrimary: string;
      gradientSecondary: string;
      gradientHero: string;
      shadowElegant: string;
      shadowGlow: string;
      shadowCard: string;
    };
    dark: {
      primary: string;
      primaryForeground: string;
      primaryVariant: string;
      secondary: string;
      secondaryForeground: string;
      secondaryVariant: string;
      accent: string;
      accentForeground: string;
      accentVariant: string;
      gradientPrimary: string;
      gradientSecondary: string;
      gradientHero: string;
      shadowElegant: string;
      shadowGlow: string;
      shadowCard: string;
    };
  };
}

export const themes: Theme[] = [
  {
    id: 'main',
    name: 'Main Theme',
    description: 'Indian-inspired vibrant colors',
    colors: {
      light: {
        primary: '25 95% 55%', // Marigold
        primaryForeground: '0 0% 98%',
        primaryVariant: '16 100% 50%', // Vermilion
        secondary: '180 65% 45%', // Teal
        secondaryForeground: '0 0% 98%',
        secondaryVariant: '300 65% 55%', // Magenta
        accent: '235 65% 55%', // Indigo
        accentForeground: '0 0% 98%',
        accentVariant: '45 90% 60%', // Gold
        gradientPrimary: 'linear-gradient(135deg, hsl(25 95% 55%), hsl(16 100% 50%), hsl(235 65% 55%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(180 65% 45%), hsl(300 65% 55%), hsl(45 90% 60%))',
        gradientHero: 'linear-gradient(135deg, hsl(25 95% 55% / 0.1), hsl(16 100% 50% / 0.1), hsl(235 65% 55% / 0.1))',
        shadowElegant: '0 10px 30px -10px hsl(25 95% 55% / 0.3)',
        shadowGlow: '0 0 40px hsl(25 95% 55% / 0.4)',
        shadowCard: '0 4px 20px hsl(25 95% 55% / 0.1)',
      },
      dark: {
        primary: '25 95% 55%',
        primaryForeground: '0 0% 3.9%',
        primaryVariant: '16 100% 50%',
        secondary: '180 65% 45%',
        secondaryForeground: '0 0% 98%',
        secondaryVariant: '300 65% 55%',
        accent: '235 65% 55%',
        accentForeground: '0 0% 98%',
        accentVariant: '45 90% 60%',
        gradientPrimary: 'linear-gradient(135deg, hsl(25 95% 55%), hsl(16 100% 50%), hsl(235 65% 55%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(180 65% 45%), hsl(300 65% 55%), hsl(45 90% 60%))',
        gradientHero: 'linear-gradient(135deg, hsl(25 95% 55% / 0.2), hsl(16 100% 50% / 0.2), hsl(235 65% 55% / 0.2))',
        shadowElegant: '0 10px 30px -10px hsl(25 95% 55% / 0.4)',
        shadowGlow: '0 0 40px hsl(25 95% 55% / 0.5)',
        shadowCard: '0 4px 20px hsl(25 95% 55% / 0.2)',
      }
    }
  },
  {
    id: 'golden',
    name: 'Golden Theme',
    description: 'Luxurious golden and warm tones',
    colors: {
      light: {
        primary: '45 100% 51%', // Pure Rich Gold
        primaryForeground: '0 0% 5%',
        primaryVariant: '35 100% 45%', // Deep Amber Gold
        secondary: '25 85% 35%', // Rich Bronze
        secondaryForeground: '0 0% 98%',
        secondaryVariant: '30 95% 55%', // Bright Copper
        accent: '50 75% 65%', // Champagne Gold
        accentForeground: '0 0% 5%',
        accentVariant: '20 90% 25%', // Dark Chocolate Bronze
        gradientPrimary: 'linear-gradient(135deg, hsl(45 100% 51%), hsl(35 100% 45%), hsl(25 85% 35%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(50 75% 65%), hsl(30 95% 55%), hsl(20 90% 25%))',
        gradientHero: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15), hsl(35 100% 45% / 0.15), hsl(25 85% 35% / 0.15))',
        shadowElegant: '0 15px 40px -15px hsl(45 100% 51% / 0.4)',
        shadowGlow: '0 0 50px hsl(45 100% 51% / 0.5)',
        shadowCard: '0 8px 30px hsl(45 100% 51% / 0.2)',
      },
      dark: {
        primary: '45 100% 60%',
        primaryForeground: '20 15% 4%',
        primaryVariant: '35 100% 55%',
        secondary: '25 85% 45%',
        secondaryForeground: '0 0% 98%',
        secondaryVariant: '30 95% 65%',
        accent: '50 75% 75%',
        accentForeground: '20 15% 4%',
        accentVariant: '20 90% 35%',
        gradientPrimary: 'linear-gradient(135deg, hsl(45 100% 60%), hsl(35 100% 55%), hsl(25 85% 45%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(50 75% 75%), hsl(30 95% 65%), hsl(20 90% 35%))',
        gradientHero: 'linear-gradient(135deg, hsl(45 100% 60% / 0.2), hsl(35 100% 55% / 0.2), hsl(25 85% 45% / 0.2))',
        shadowElegant: '0 15px 40px -15px hsl(45 100% 60% / 0.5)',
        shadowGlow: '0 0 50px hsl(45 100% 60% / 0.6)',
        shadowCard: '0 8px 30px hsl(45 100% 60% / 0.3)',
      }
    }
  },
  {
    id: 'simple',
    name: 'Simple Theme',
    description: 'Eye-friendly and comfortable viewing',
    colors: {
      light: {
        primary: '210 50% 45%', // Soft blue - easy on eyes
        primaryForeground: '0 0% 98%',
        primaryVariant: '200 45% 40%', // Deeper blue
        secondary: '150 25% 50%', // Muted teal
        secondaryForeground: '0 0% 98%',
        secondaryVariant: '160 30% 45%', // Soft green
        accent: '220 20% 60%', // Gentle gray-blue
        accentForeground: '0 0% 15%',
        accentVariant: '195 35% 55%', // Light blue
        gradientPrimary: 'linear-gradient(135deg, hsl(210 50% 45%), hsl(200 45% 40%), hsl(220 20% 60%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(150 25% 50%), hsl(160 30% 45%), hsl(195 35% 55%))',
        gradientHero: 'linear-gradient(135deg, hsl(210 50% 45% / 0.08), hsl(200 45% 40% / 0.08), hsl(220 20% 60% / 0.08))',
        shadowElegant: '0 8px 25px -8px hsl(210 50% 45% / 0.15)',
        shadowGlow: '0 0 30px hsl(210 50% 45% / 0.2)',
        shadowCard: '0 2px 15px hsl(210 50% 45% / 0.08)',
      },
      dark: {
        primary: '210 45% 55%', // Softer blue for dark mode
        primaryForeground: '210 15% 8%',
        primaryVariant: '200 40% 50%',
        secondary: '150 20% 55%', // Muted green
        secondaryForeground: '210 15% 8%',
        secondaryVariant: '160 25% 50%',
        accent: '220 15% 65%', // Light gray-blue
        accentForeground: '210 15% 8%',
        accentVariant: '195 30% 60%',
        gradientPrimary: 'linear-gradient(135deg, hsl(210 45% 55%), hsl(200 40% 50%), hsl(220 15% 65%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(150 20% 55%), hsl(160 25% 50%), hsl(195 30% 60%))',
        gradientHero: 'linear-gradient(135deg, hsl(210 45% 55% / 0.12), hsl(200 40% 50% / 0.12), hsl(220 15% 65% / 0.12))',
        shadowElegant: '0 8px 25px -8px hsl(210 45% 55% / 0.2)',
        shadowGlow: '0 0 30px hsl(210 45% 55% / 0.25)',
        shadowCard: '0 2px 15px hsl(210 45% 55% / 0.12)',
      }
    }
  },
  {
    id: 'richblue',
    name: 'Rich Blue',
    description: 'Luxurious deep blues with premium styling',
    colors: {
      light: {
        primary: '210 100% 45%', // Rich Royal Blue
        primaryForeground: '0 0% 98%',
        primaryVariant: '220 90% 35%', // Deep Navy Blue
        secondary: '200 85% 55%', // Steel Blue
        secondaryForeground: '0 0% 98%',
        secondaryVariant: '190 70% 50%', // Cerulean Blue
        accent: '230 80% 65%', // Electric Blue
        accentForeground: '220 15% 8%',
        accentVariant: '240 60% 40%', // Midnight Blue
        gradientPrimary: 'linear-gradient(135deg, hsl(210 100% 45%), hsl(220 90% 35%), hsl(230 80% 65%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(200 85% 55%), hsl(190 70% 50%), hsl(240 60% 40%))',
        gradientHero: 'linear-gradient(135deg, hsl(210 100% 45% / 0.2), hsl(220 90% 35% / 0.2), hsl(230 80% 65% / 0.2))',
        shadowElegant: '0 20px 50px -15px hsl(210 100% 45% / 0.4)',
        shadowGlow: '0 0 60px hsl(210 100% 45% / 0.6)',
        shadowCard: '0 10px 35px hsl(210 100% 45% / 0.25)',
      },
      dark: {
        primary: '210 95% 55%', // Bright Royal Blue
        primaryForeground: '220 15% 4%',
        primaryVariant: '220 85% 45%', // Rich Navy
        secondary: '200 80% 65%', // Light Steel Blue
        secondaryForeground: '220 15% 4%',
        secondaryVariant: '190 65% 60%', // Bright Cerulean
        accent: '230 75% 75%', // Bright Electric Blue
        accentForeground: '220 15% 4%',
        accentVariant: '240 55% 50%', // Rich Midnight
        gradientPrimary: 'linear-gradient(135deg, hsl(210 95% 55%), hsl(220 85% 45%), hsl(230 75% 75%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(200 80% 65%), hsl(190 65% 60%), hsl(240 55% 50%))',
        gradientHero: 'linear-gradient(135deg, hsl(210 95% 55% / 0.3), hsl(220 85% 45% / 0.3), hsl(230 75% 75% / 0.3))',
        shadowElegant: '0 20px 50px -15px hsl(210 95% 55% / 0.6)',
        shadowGlow: '0 0 60px hsl(210 95% 55% / 0.8)',
        shadowCard: '0 10px 35px hsl(210 95% 55% / 0.4)',
      }
    }
  },
  {
    id: 'rich',
    name: 'Rich Navy',
    description: 'Premium navy blue with elegant black and white accents',
    colors: {
      light: {
        primary: '220 70% 35%', // Rich Navy Blue - easier on eyes
        primaryForeground: '0 0% 100%', // Pure White
        primaryVariant: '230 80% 25%', // Deep Navy Blue
        secondary: '0 0% 15%', // Rich Black
        secondaryForeground: '0 0% 100%', // Pure White
        secondaryVariant: '0 0% 95%', // Off White
        accent: '0 0% 100%', // Pure White
        accentForeground: '220 70% 35%', // Rich Navy Blue
        accentVariant: '220 30% 85%', // Light Navy Gray
        gradientPrimary: 'linear-gradient(135deg, hsl(220 70% 35%), hsl(230 80% 25%), hsl(0 0% 15%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(0 0% 100%), hsl(220 30% 85%), hsl(220 70% 35%))',
        gradientHero: 'linear-gradient(135deg, hsl(220 70% 35% / 0.08), hsl(0 0% 15% / 0.06), hsl(0 0% 100% / 0.04))',
        shadowElegant: '0 25px 60px -20px hsl(220 70% 35% / 0.25)',
        shadowGlow: '0 0 80px hsl(220 70% 35% / 0.3)',
        shadowCard: '0 12px 40px hsl(220 70% 35% / 0.08)',
      },
      dark: {
        primary: '220 65% 55%', // Lighter Navy for dark mode
        primaryForeground: '0 0% 5%', // Near Black
        primaryVariant: '230 70% 45%', // Medium Navy
        secondary: '0 0% 95%', // Off White
        secondaryForeground: '0 0% 5%', // Near Black
        secondaryVariant: '0 0% 10%', // Dark Gray
        accent: '0 0% 5%', // Near Black
        accentForeground: '0 0% 95%', // Off White
        accentVariant: '220 25% 75%', // Light Navy
        gradientPrimary: 'linear-gradient(135deg, hsl(220 65% 55%), hsl(230 70% 45%), hsl(0 0% 95%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(0 0% 5%), hsl(0 0% 95%), hsl(220 25% 75%))',
        gradientHero: 'linear-gradient(135deg, hsl(220 65% 55% / 0.12), hsl(0 0% 95% / 0.08), hsl(0 0% 5% / 0.06))',
        shadowElegant: '0 25px 60px -20px hsl(220 65% 55% / 0.4)',
        shadowGlow: '0 0 80px hsl(220 65% 55% / 0.5)',
        shadowCard: '0 12px 40px hsl(220 65% 55% / 0.15)',
      }
    }
  },
  {
    id: 'black',
    name: 'Black Theme',
    description: 'Pure black background with dark blue accents',
    colors: {
      light: {
        primary: '220 90% 25%', // Dark Blue for buttons
        primaryForeground: '0 0% 100%', // White text
        primaryVariant: '220 80% 20%', // Darker blue
        secondary: '0 0% 0%', // Pure Black background
        secondaryForeground: '0 0% 100%', // White text
        secondaryVariant: '0 0% 5%', // Very dark gray
        accent: '0 0% 100%', // White
        accentForeground: '0 0% 0%', // Black text
        accentVariant: '220 30% 15%', // Dark blue gray
        gradientPrimary: 'linear-gradient(135deg, hsl(220 90% 25%), hsl(220 80% 20%), hsl(0 0% 0%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(0 0% 0%), hsl(220 30% 15%), hsl(0 0% 5%))',
        gradientHero: 'linear-gradient(135deg, hsl(0 0% 0% / 0.9), hsl(220 30% 15% / 0.1), hsl(220 90% 25% / 0.05))',
        shadowElegant: '0 15px 40px -15px hsl(220 90% 25% / 0.3)',
        shadowGlow: '0 0 30px hsl(220 90% 25% / 0.4)',
        shadowCard: '0 8px 25px hsl(220 90% 25% / 0.15)',
      },
      dark: {
        primary: '220 85% 35%', // Slightly lighter blue for dark mode
        primaryForeground: '0 0% 100%', // White text
        primaryVariant: '220 75% 30%', // Medium dark blue
        secondary: '0 0% 0%', // Pure Black background
        secondaryForeground: '0 0% 100%', // White text
        secondaryVariant: '0 0% 8%', // Very dark gray
        accent: '0 0% 100%', // White
        accentForeground: '0 0% 0%', // Black text
        accentVariant: '220 25% 20%', // Dark blue gray
        gradientPrimary: 'linear-gradient(135deg, hsl(220 85% 35%), hsl(220 75% 30%), hsl(0 0% 0%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(0 0% 0%), hsl(220 25% 20%), hsl(0 0% 8%))',
        gradientHero: 'linear-gradient(135deg, hsl(0 0% 0% / 0.9), hsl(220 25% 20% / 0.1), hsl(220 85% 35% / 0.05))',
        shadowElegant: '0 15px 40px -15px hsl(220 85% 35% / 0.4)',
        shadowGlow: '0 0 30px hsl(220 85% 35% / 0.5)',
        shadowCard: '0 8px 25px hsl(220 85% 35% / 0.2)',
      }
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Deep ocean blue background with elegant accents',
    colors: {
      light: {
        primary: '220 90% 25%', // Dark Blue for buttons
        primaryForeground: '0 0% 100%', // White text
        primaryVariant: '220 80% 20%', // Darker blue
        secondary: '209 100% 10%', // Ocean Blue #001a33
        secondaryForeground: '0 0% 100%', // White text
        secondaryVariant: '209 100% 15%', // Slightly lighter ocean blue
        accent: '0 0% 100%', // White
        accentForeground: '209 100% 10%', // Ocean blue text
        accentVariant: '220 30% 20%', // Dark blue gray
        gradientPrimary: 'linear-gradient(135deg, hsl(220 90% 25%), hsl(220 80% 20%), hsl(209 100% 10%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(209 100% 10%), hsl(220 30% 20%), hsl(209 100% 15%))',
        gradientHero: 'linear-gradient(135deg, hsl(209 100% 10% / 0.9), hsl(220 30% 20% / 0.1), hsl(220 90% 25% / 0.05))',
        shadowElegant: '0 15px 40px -15px hsl(220 90% 25% / 0.3)',
        shadowGlow: '0 0 30px hsl(220 90% 25% / 0.4)',
        shadowCard: '0 8px 25px hsl(220 90% 25% / 0.15)',
      },
      dark: {
        primary: '220 85% 35%', // Slightly lighter blue for dark mode
        primaryForeground: '0 0% 100%', // White text
        primaryVariant: '220 75% 30%', // Medium dark blue
        secondary: '209 100% 10%', // Ocean Blue #001a33
        secondaryForeground: '0 0% 100%', // White text
        secondaryVariant: '209 100% 18%', // Slightly lighter ocean blue
        accent: '0 0% 100%', // White
        accentForeground: '209 100% 10%', // Ocean blue text
        accentVariant: '220 25% 25%', // Dark blue gray
        gradientPrimary: 'linear-gradient(135deg, hsl(220 85% 35%), hsl(220 75% 30%), hsl(209 100% 10%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(209 100% 10%), hsl(220 25% 25%), hsl(209 100% 18%))',
        gradientHero: 'linear-gradient(135deg, hsl(209 100% 10% / 0.9), hsl(220 25% 25% / 0.1), hsl(220 85% 35% / 0.05))',
        shadowElegant: '0 15px 40px -15px hsl(220 85% 35% / 0.4)',
        shadowGlow: '0 0 30px hsl(220 85% 35% / 0.5)',
        shadowCard: '0 8px 25px hsl(220 85% 35% / 0.2)',
      }
    }
  },
  {
    id: 'ocean-red',
    name: 'Ocean Blue Red',
    description: 'Deep ocean blue background with vibrant red variations for all elements',
    colors: {
      light: {
        primary: '348 83% 47%', // Crimson Red #DC143C
        primaryForeground: '0 0% 100%', // White text
        primaryVariant: '356 80% 34%', // Deep Red #9B111E
        secondary: '209 100% 10%', // Ocean Blue #001a33
        secondaryForeground: '0 0% 100%', // White text
        secondaryVariant: '209 100% 15%', // Slightly lighter ocean blue
        accent: '9 100% 50%', // Bright Red #FF2400
        accentForeground: '0 0% 100%', // White text
        accentVariant: '345 75% 25%', // Dark Burgundy #800020
        gradientPrimary: 'linear-gradient(135deg, hsl(348 83% 47%), hsl(356 80% 34%), hsl(9 100% 50%), hsl(354 70% 57%), hsl(345 75% 25%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(209 100% 10%), hsl(209 100% 15%), hsl(209 100% 20%))',
        gradientHero: 'linear-gradient(135deg, hsl(209 100% 10% / 0.9), hsl(348 83% 47% / 0.1), hsl(9 100% 50% / 0.05))',
        shadowElegant: '0 15px 40px -15px hsl(348 83% 47% / 0.3)',
        shadowGlow: '0 0 30px hsl(348 83% 47% / 0.4)',
        shadowCard: '0 8px 25px hsl(348 83% 47% / 0.15)',
      },
      dark: {
        primary: '354 70% 57%', // Rose Red #E63946
        primaryForeground: '0 0% 100%', // White text
        primaryVariant: '348 83% 47%', // Crimson Red #DC143C
        secondary: '209 100% 10%', // Ocean Blue #001a33
        secondaryForeground: '0 0% 100%', // White text
        secondaryVariant: '209 100% 18%', // Slightly lighter ocean blue
        accent: '9 100% 50%', // Bright Red #FF2400
        accentForeground: '0 0% 100%', // White text
        accentVariant: '345 75% 25%', // Dark Burgundy #800020
        gradientPrimary: 'linear-gradient(135deg, hsl(354 70% 57%), hsl(348 83% 47%), hsl(9 100% 50%), hsl(356 80% 34%), hsl(345 75% 25%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(209 100% 10%), hsl(209 100% 15%), hsl(209 100% 20%))',
        gradientHero: 'linear-gradient(135deg, hsl(209 100% 10% / 0.9), hsl(354 70% 57% / 0.1), hsl(9 100% 50% / 0.05))',
        shadowElegant: '0 15px 40px -15px hsl(354 70% 57% / 0.4)',
        shadowGlow: '0 0 30px hsl(354 70% 57% / 0.5)',
        shadowCard: '0 8px 25px hsl(354 70% 57% / 0.2)',
      }
    }
  },
  {
    id: 'particles-blue-cinematic',
    name: 'Particles Blue Cinematic',
    description: 'Cinematic blue particles background with dark atmosphere',
    colors: {
      light: {
        primary: '217 91% 60%', // Bright Blue
        primaryForeground: '0 0% 100%',
        primaryVariant: '230 100% 50%', // Electric Blue
        secondary: '240 4% 16%', // Dark Grey
        secondaryForeground: '0 0% 90%',
        secondaryVariant: '240 6% 10%', // Almost Black
        accent: '200 100% 70%', // Light Blue
        accentForeground: '240 10% 3.9%',
        accentVariant: '210 100% 56%', // Sky Blue
        gradientPrimary: 'linear-gradient(135deg, hsl(217 91% 60%), hsl(230 100% 50%), hsl(200 100% 70%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(240 4% 16%), hsl(240 6% 10%), hsl(240 10% 3.9%))',
        gradientHero: 'linear-gradient(135deg, hsl(240 10% 3.9% / 0.9), hsl(217 91% 60% / 0.1), hsl(230 100% 50% / 0.05))',
        shadowElegant: '0 15px 40px -15px hsl(217 91% 60% / 0.3)',
        shadowGlow: '0 0 30px hsl(217 91% 60% / 0.4)',
        shadowCard: '0 8px 25px hsl(217 91% 60% / 0.15)',
      },
      dark: {
        primary: '217 91% 60%', // Bright Blue
        primaryForeground: '0 0% 100%',
        primaryVariant: '230 100% 50%', // Electric Blue
        secondary: '240 4% 16%', // Dark Grey
        secondaryForeground: '0 0% 90%',
        secondaryVariant: '240 6% 10%', // Almost Black
        accent: '200 100% 70%', // Light Blue
        accentForeground: '240 10% 3.9%',
        accentVariant: '210 100% 56%', // Sky Blue
        gradientPrimary: 'linear-gradient(135deg, hsl(217 91% 60%), hsl(230 100% 50%), hsl(200 100% 70%))',
        gradientSecondary: 'linear-gradient(135deg, hsl(240 4% 16%), hsl(240 6% 10%), hsl(240 10% 3.9%))',
        gradientHero: 'linear-gradient(135deg, hsl(240 10% 3.9% / 0.9), hsl(217 91% 60% / 0.1), hsl(230 100% 50% / 0.05))',
        shadowElegant: '0 15px 40px -15px hsl(217 91% 60% / 0.4)',
        shadowGlow: '0 0 30px hsl(217 91% 60% / 0.5)',
        shadowCard: '0 8px 25px hsl(217 91% 60% / 0.2)',
      }
    }
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  setGlobalTheme: (themeId: string) => Promise<void>;
  themes: Theme[];
  isAdmin: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.find(t => t.id === 'golden') || themes[0]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase.rpc('has_current_role', { _role: 'admin' });
        setIsAdmin(data || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Load global theme from database for all users
  useEffect(() => {
    const loadGlobalTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('global_settings')
          .select('setting_value')
          .eq('setting_key', 'global_theme')
          .maybeSingle();

        if (error) {
          console.error('Error loading global theme:', error);
          return;
        }

        if (data?.setting_value) {
          try {
            const themeData = typeof data.setting_value === 'string' 
              ? JSON.parse(data.setting_value)
              : data.setting_value as any;
            
            if (themeData?.theme_id) {
              const globalTheme = themes.find(t => t.id === themeData.theme_id);
              if (globalTheme) {
                setCurrentTheme(globalTheme);
              }
            }
          } catch (parseError) {
            console.error('Error parsing theme data:', parseError);
          }
        }
      } catch (error) {
        console.error('Error fetching global theme:', error);
      }
    };

    loadGlobalTheme();
  }, []);

  // Listen for global theme changes
  useEffect(() => {
    const channel = supabase
      .channel('global-settings-changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'global_settings',
          filter: 'setting_key=eq.global_theme'
        }, 
        (payload) => {
          try {
            const themeData = typeof payload.new.setting_value === 'string' 
              ? JSON.parse(payload.new.setting_value)
              : payload.new.setting_value as any;
            
            const newThemeId = themeData?.theme_id;
            if (newThemeId) {
              const newTheme = themes.find(t => t.id === newThemeId);
              if (newTheme) {
                setCurrentTheme(newTheme);
              }
            }
          } catch (parseError) {
            console.error('Error parsing theme update:', parseError);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const isDark = document.documentElement.classList.contains('dark');
    const colors = isDark ? currentTheme.colors.dark : currentTheme.colors.light;

    // Apply particles blue cinematic background
    if (currentTheme.id === 'particles-blue-cinematic') {
      document.body.classList.add('particles-blue-cinematic');
    } else {
      document.body.classList.remove('particles-blue-cinematic');
    }

    // Update CSS custom properties
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--primary-variant', colors.primaryVariant);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
    root.style.setProperty('--secondary-variant', colors.secondaryVariant);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-foreground', colors.accentForeground);
    root.style.setProperty('--accent-variant', colors.accentVariant);
    root.style.setProperty('--gradient-primary', colors.gradientPrimary);
    root.style.setProperty('--gradient-secondary', colors.gradientSecondary);
    root.style.setProperty('--gradient-hero', colors.gradientHero);
    root.style.setProperty('--shadow-elegant', colors.shadowElegant);
    root.style.setProperty('--shadow-glow', colors.shadowGlow);
    root.style.setProperty('--shadow-card', colors.shadowCard);

    // Also update ring color to match primary
    root.style.setProperty('--ring', colors.primary);

    // Listen for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          const newColors = isDarkNow ? currentTheme.colors.dark : currentTheme.colors.light;
          
          // Update all colors again when dark mode changes
          root.style.setProperty('--primary', newColors.primary);
          root.style.setProperty('--primary-foreground', newColors.primaryForeground);
          root.style.setProperty('--primary-variant', newColors.primaryVariant);
          root.style.setProperty('--secondary', newColors.secondary);
          root.style.setProperty('--secondary-foreground', newColors.secondaryForeground);
          root.style.setProperty('--secondary-variant', newColors.secondaryVariant);
          root.style.setProperty('--accent', newColors.accent);
          root.style.setProperty('--accent-foreground', newColors.accentForeground);
          root.style.setProperty('--accent-variant', newColors.accentVariant);
          root.style.setProperty('--gradient-primary', newColors.gradientPrimary);
          root.style.setProperty('--gradient-secondary', newColors.gradientSecondary);
          root.style.setProperty('--gradient-hero', newColors.gradientHero);
          root.style.setProperty('--shadow-elegant', newColors.shadowElegant);
          root.style.setProperty('--shadow-glow', newColors.shadowGlow);
          root.style.setProperty('--shadow-card', newColors.shadowCard);
          root.style.setProperty('--ring', newColors.primary);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  const setGlobalTheme = async (themeId: string) => {
    if (!isAdmin) {
      throw new Error('Only admins can change the global theme');
    }

    try {
      const { data, error } = await supabase.rpc('update_global_theme', { 
        theme_id: themeId 
      });

      if (error) {
        throw new Error(`Failed to update global theme: ${error.message}`);
      }

      const result = data as any;
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to update global theme');
      }

      // Local theme will be updated via the realtime subscription
      return Promise.resolve();
    } catch (error) {
      console.error('Error setting global theme:', error);
      throw error;
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    setGlobalTheme,
    themes,
    isAdmin,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};