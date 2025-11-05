// Enhanced external script error handler
export class ExternalErrorHandler {
  private static knownExternalErrors = [
    'Cannot set property attributeName of #<MutationRecord> which has only a getter',
    'lovable.js',
    'cdn.gpteng.co',
    'MutationRecord',
    'attributeName'
  ];
  
  private static blockedErrors = new Set<string>();
  
  // Check if an error is from external scripts
  static isExternalError(error: ErrorEvent | string): boolean {
    const message = typeof error === 'string' ? error : error.message;
    const filename = typeof error === 'string' ? '' : error.filename || '';
    
    return this.knownExternalErrors.some(pattern => 
      message.includes(pattern) || filename.includes(pattern)
    );
  }
  
  // Block repeated external errors to reduce noise
  static shouldBlockError(message: string): boolean {
    const errorKey = message.substring(0, 100); // First 100 chars as key
    
    if (this.blockedErrors.has(errorKey)) {
      return true; // Already blocked
    }
    
    if (this.isExternalError(message)) {
      this.blockedErrors.add(errorKey);
      console.warn(`🚫 Blocking external error: ${message.substring(0, 50)}...`);
      return true;
    }
    
    return false;
  }
  
  // Clean up blocked errors periodically
  static cleanup(): void {
    this.blockedErrors.clear();
    console.log('🧹 External error handler cleaned up');
  }
  
  // Initialize periodic cleanup
  static init(): void {
    // Clean up every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
    
    // Override default error handler to catch external errors
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (this.shouldBlockError(String(message))) {
        return true; // Prevent default handling
      }
      
      return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
    };
    
    console.log('🛡️ External error handler initialized');
  }
}