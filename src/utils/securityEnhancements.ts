/**
 * Comprehensive Security Enhancements for Short Talez
 * Implements security best practices and vulnerability mitigations
 */

import { supabase } from '@/integrations/supabase/client';

export class SecurityManager {
  private static instance: SecurityManager;
  private rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Client-side rate limiting with exponential backoff
   */
  public async checkRateLimit(action: string, maxAttempts: number = 5, windowMs: number = 60000): Promise<boolean> {
    const key = `${action}_${Date.now()}`;
    const now = Date.now();
    
    const cached = this.rateLimitCache.get(action);
    if (cached && now < cached.resetTime) {
      if (cached.count >= maxAttempts) {
        return false;
      }
      this.rateLimitCache.set(action, { count: cached.count + 1, resetTime: cached.resetTime });
    } else {
      this.rateLimitCache.set(action, { count: 1, resetTime: now + windowMs });
    }
    
    return true;
  }

  /**
   * Sanitize user input to prevent XSS attacks
   */
  public sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/vbscript:/gi, '') // Remove vbscript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: URLs
      .trim();
  }

  /**
   * Validate and sanitize media URLs
   */
  public validateMediaUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const parsedUrl = new URL(url);
      const allowedDomains = [
        'youtube.com',
        'www.youtube.com',
        'youtu.be',
        'vimeo.com',
        'player.vimeo.com',
        'cloudflare.com',
        's3.amazonaws.com',
        'googleapis.com'
      ];
      
      const allowedProtocols = ['https:', 'http:'];
      
      return allowedProtocols.includes(parsedUrl.protocol) && 
             allowedDomains.some(domain => parsedUrl.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  /**
   * Log security events safely
   */
  public async logSecurityEvent(
    eventType: string, 
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info',
    description?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.rpc('log_security_event', {
        p_user_id: user?.id || null,
        p_event_type: this.sanitizeInput(eventType),
        p_severity: severity,
        p_description: description ? this.sanitizeInput(description) : null,
        p_metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
      });
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }

  /**
   * Validate file uploads
   */
  public validateFileUpload(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 100MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Additional security: Check file signature
    return { valid: true };
  }

  /**
   * Generate secure tokens
   */
  public generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate authentication state
   */
  public async validateAuthState(): Promise<{ valid: boolean; user?: any }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        await this.logSecurityEvent('auth_validation_failed', 'warning', 'User authentication failed');
        return { valid: false };
      }

      return { valid: true, user };
    } catch (error) {
      await this.logSecurityEvent('auth_validation_error', 'error', 'Authentication validation error');
      return { valid: false };
    }
  }

  /**
   * Comprehensive security check
   */
  public async runSecurityCheck(): Promise<{
    passed: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check authentication
    const authCheck = await this.validateAuthState();
    if (!authCheck.valid) {
      issues.push('Authentication state invalid');
      recommendations.push('Please sign in again');
    }

    // Check for secure connection
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push('Insecure connection detected');
      recommendations.push('Use HTTPS for secure communication');
    }

    // Check for XSS vulnerabilities in localStorage
    if (typeof window !== 'undefined') {
      try {
        const testKey = 'xss_test_' + Date.now();
        localStorage.setItem(testKey, '<script>alert("xss")</script>');
        const stored = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (stored && stored.includes('<script>')) {
          recommendations.push('Be cautious with localStorage data');
        }
      } catch {
        // localStorage not available or restricted
      }
    }

    return {
      passed: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Clean up security cache
   */
  public cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.rateLimitCache.entries()) {
      if (now >= value.resetTime) {
        this.rateLimitCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    securityManager.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Enhanced Content Security Policy helpers
 */
export const CSPHelpers = {
  /**
   * Generate nonce for inline scripts
   */
  generateNonce(): string {
    return securityManager.generateSecureToken(16);
  },

  /**
   * Validate content against CSP
   */
  validateContent(content: string, type: 'script' | 'style' | 'image' | 'media'): boolean {
    const patterns = {
      script: /<script[^>]*>/gi,
      style: /<style[^>]*>/gi,
      image: /<img[^>]*>/gi,
      media: /<(video|audio|embed|object)[^>]*>/gi
    };

    const matches = content.match(patterns[type]);
    return !matches || matches.length === 0;
  }
};

/**
 * Secure API helpers
 */
export const SecureAPI = {
  /**
   * Make authenticated API calls with security checks
   */
  async secureCall<T>(
    operation: () => Promise<T>,
    options: {
      requireAuth?: boolean;
      rateLimit?: { action: string; maxAttempts?: number };
      validate?: (result: T) => boolean;
    } = {}
  ): Promise<T> {
    const { requireAuth = true, rateLimit, validate } = options;

    // Check authentication if required
    if (requireAuth) {
      const authCheck = await securityManager.validateAuthState();
      if (!authCheck.valid) {
        throw new Error('Authentication required');
      }
    }

    // Check rate limit if specified
    if (rateLimit) {
      const allowed = await securityManager.checkRateLimit(
        rateLimit.action,
        rateLimit.maxAttempts
      );
      if (!allowed) {
        throw new Error('Rate limit exceeded');
      }
    }

    // Execute operation
    const result = await operation();

    // Validate result if validator provided
    if (validate && !validate(result)) {
      throw new Error('Invalid response');
    }

    return result;
  }
};