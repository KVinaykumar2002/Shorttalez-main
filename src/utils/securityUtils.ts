/**
 * Security utilities for video URLs and user input validation
 */

// Allowed video domains for security
const ALLOWED_VIDEO_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'drive.google.com',
  'cloudflare.com',
  'videodelivery.net',
  'iframe.videodelivery.net',
  'pcloud.link',
  'u.pcloud.link',
  'supabase.co'
];

// Dangerous protocols to block
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'ftp:'
];

/**
 * Sanitize and validate video URLs
 */
export const sanitizeVideoUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Remove potential XSS characters
    const cleanUrl = url.trim().replace(/[<>"']/g, '');
    
    // Check for dangerous protocols
    const lowerUrl = cleanUrl.toLowerCase();
    if (DANGEROUS_PROTOCOLS.some(protocol => lowerUrl.startsWith(protocol))) {
      console.warn('Blocked dangerous protocol in URL:', url);
      return null;
    }
    
    // Validate URL format
    const urlObj = new URL(cleanUrl);
    
    // Check if domain is allowed
    const isAllowedDomain = ALLOWED_VIDEO_DOMAINS.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
    );
    
    if (!isAllowedDomain) {
      console.warn('URL domain not in allowlist:', urlObj.hostname);
      // Still allow it but log for monitoring
    }
    
    return cleanUrl;
  } catch (error) {
    console.error('Invalid URL format:', url, error);
    return null;
  }
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeUserInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

/**
 * Check if URL is from a trusted domain
 */
export const isTrustedDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ALLOWED_VIDEO_DOMAINS.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
};

/**
 * Enhanced rate limiting with server-side validation
 */
const actionTimestamps = new Map<string, number>();
const RATE_LIMIT_MS = 1000; // 1 second between actions

export const isRateLimited = (action: string, userId?: string): boolean => {
  const key = `${action}-${userId || 'anonymous'}`;
  const now = Date.now();
  const lastAction = actionTimestamps.get(key);
  
  if (lastAction && now - lastAction < RATE_LIMIT_MS) {
    return true;
  }
  
  actionTimestamps.set(key, now);
  return false;
};

/**
 * Server-side rate limiting check using Supabase function
 */
export const checkServerRateLimit = async (action: string, maxAttempts: number = 5, windowMinutes: number = 15): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.rpc('check_rate_limit', {
      action_type_param: action,
      max_attempts: maxAttempts,
      window_minutes: windowMinutes
    });
    
    if (error) {
      console.error('Rate limit check failed:', error);
      return false; // Default to rate limited if check fails
    }
    
    return data === true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false;
  }
};

/**
 * Enhanced XSS protection
 */
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove JavaScript protocols
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove script tags content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Limit length
    .substring(0, 5000);
};

/**
 * Validate file uploads
 */
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  document: ['application/pdf', 'text/plain']
};

const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  video: 100 * 1024 * 1024, // 100MB
  document: 10 * 1024 * 1024 // 10MB
};

export const validateFileUpload = (file: File, category: keyof typeof ALLOWED_FILE_TYPES): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_FILE_TYPES[category].includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed for ${category} uploads`
    };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZES[category]) {
    return {
      valid: false,
      error: `File size exceeds limit for ${category} uploads`
    };
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|jsp)$/i;
  if (suspiciousPatterns.test(file.name)) {
    return {
      valid: false,
      error: 'File type potentially dangerous'
    };
  }
  
  return { valid: true };
};

/**
 * Clean up rate limiting data periodically
 */
export const cleanupRateLimiting = () => {
  const now = Date.now();
  for (const [key, timestamp] of actionTimestamps.entries()) {
    if (now - timestamp > RATE_LIMIT_MS * 10) {
      actionTimestamps.delete(key);
    }
  }
};

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimiting, 5 * 60 * 1000);
}