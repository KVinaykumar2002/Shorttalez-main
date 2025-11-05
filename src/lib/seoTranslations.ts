// SEO Meta Translations for Tinglish
import { useEffect } from 'react';
import { seoTranslations } from './translations';

interface SEOMetaProps {
  page: string;
  title?: string;
  description?: string;
}

// Hook to update document head with Tinglish meta tags
export function useSEOTranslation(page: string, customTitle?: string, customDescription?: string) {
  useEffect(() => {
    const seoData = seoTranslations[page as keyof typeof seoTranslations];
    
    if (seoData) {
      // Update title
      const title = customTitle || seoData.title;
      if (title) {
        document.title = title;
      }
      
      // Update meta description
      const description = customDescription || seoData.description;
      if (description) {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);
      }
      
      // Update Open Graph tags
      updateOpenGraphMeta('og:title', title);
      updateOpenGraphMeta('og:description', description);
      
      // Update Twitter Card tags
      updateOpenGraphMeta('twitter:title', title);
      updateOpenGraphMeta('twitter:description', description);
    }
  }, [page, customTitle, customDescription]);
}

// Helper function to update Open Graph and Twitter meta tags
function updateOpenGraphMeta(property: string, content: string) {
  if (!content) return;
  
  let meta = document.querySelector(`meta[property="${property}"]`) || 
             document.querySelector(`meta[name="${property}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    if (property.startsWith('og:')) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

// Component to inject SEO meta tags
export function SEOMeta({ page, title, description }: SEOMetaProps) {
  useSEOTranslation(page, title, description);
  return null; // This component doesn't render anything
}

// Utility function to get SEO data for a page
export function getSEOData(page: string) {
  return seoTranslations[page as keyof typeof seoTranslations] || {
    title: 'Short Talez — Telugu Short Films & Series',
    description: 'Short Talez lo Telugu short films & series chooskondi. MiniOTT platform for creators & viewers.'
  };
}

export default { useSEOTranslation, SEOMeta, getSEOData };