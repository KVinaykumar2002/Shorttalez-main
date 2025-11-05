// Performance optimization utilities
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontPreloads = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  ];
  
  fontPreloads.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = url;
    document.head.appendChild(link);
  });

  // Preload critical images
  const criticalImages = document.querySelectorAll('img[data-priority="high"]');
  criticalImages.forEach(img => {
    const imgElement = img as HTMLImageElement;
    if (imgElement.dataset.src) {
      imgElement.src = imgElement.dataset.src;
    }
  });
};

// Optimize images for better loading
export const optimizeImageLoading = () => {
  // Add intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Handle data-src attribute for lazy loading
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Add loading class for smooth transitions
          img.classList.add('loading');
          
          img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
          };
          
          img.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
            console.warn('Failed to load image:', img.src);
          };
          
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px 0px', // Increased margin for better UX
      threshold: 0.01
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
    
    // Re-observe on dynamic content changes
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            const images = element.querySelectorAll('img[data-src]');
            images.forEach(img => imageObserver.observe(img));
          }
        });
      });
    });
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
};

// Debounce function for search optimization
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  // Preload critical resources
  preloadCriticalResources();
  
  // Optimize images when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeImageLoading);
  } else {
    optimizeImageLoading();
  }
  
  // Add performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = perfData.loadEventEnd - perfData.fetchStart;
      console.info('Page load time:', loadTime.toFixed(1), 'ms');
      
      // Enhanced performance metrics
      const vitals = {
        fcp: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        lcp: 0,
        cls: 0,
        fid: 0
      };

      // Measure Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({entryTypes: ['largest-contentful-paint']});
      }
      
      // Log slow loads for optimization
      if (loadTime > 2000) {
        console.warn('Performance issue detected:', {
          loadTime: loadTime.toFixed(1) + 'ms',
          domComplete: (perfData.domComplete - perfData.fetchStart).toFixed(1) + 'ms',
          fcp: vitals.fcp.toFixed(1) + 'ms'
        });
      }
    });
  }
  
  // Add resource hints and advanced optimizations
  addResourceHints();
  enableAdvancedOptimizations();
};

// Add resource hints for better performance
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const domains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'youtube.com',
    'vimeo.com',
    'drive.google.com',
    'nxsogkmnimaihoxbpnpd.supabase.co',
    'iframe.videodelivery.net'
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical domains
  const preconnectDomains = [
    'https://nxsogkmnimaihoxbpnpd.supabase.co',
    'https://fonts.googleapis.com'
  ];
  
  preconnectDomains.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Advanced performance optimizations
export const enableAdvancedOptimizations = () => {
  // Enable service worker for aggressive caching
  if ('serviceWorker' in navigator && 'caches' in window) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }

  // Prefetch critical routes
  const criticalRoutes = ['/home', '/videos', '/feed'];
  criticalRoutes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });

  // Enable compression hints
  if ('CompressionStream' in window) {
    document.documentElement.style.setProperty('--compression-enabled', '1');
  }
};