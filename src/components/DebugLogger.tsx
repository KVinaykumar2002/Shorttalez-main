import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDebugLogger } from '@/hooks/useDebugLogger';
import { securityManager } from '@/utils/securityEnhancements';

// This component initializes the debug logging system globally
const DebugLogger: React.FC = () => {
  const { user } = useAuth();
  const { logInfo } = useDebugLogger();

  useEffect(() => {
    // Only log if user is authenticated to avoid RLS violations
    if (user) {
      const initializeSecurely = async () => {
        try {
          // Run security check first
          const securityCheck = await securityManager.runSecurityCheck();
          
          if (!securityCheck.passed) {
            console.warn('Security issues detected:', securityCheck.issues);
            await securityManager.logSecurityEvent(
              'security_check_failed',
              'warning',
              'Security issues detected during initialization',
              { issues: securityCheck.issues }
            );
          }

          logInfo('Debug logging system initialized', {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            url: window.location.href,
            security_check: securityCheck.passed
          });
        } catch (error) {
          console.warn('Debug logging failed:', error);
          await securityManager.logSecurityEvent(
            'debug_init_failed',
            'error',
            'Debug system initialization failed'
          );
        }
      };
      
      initializeSecurely();
    }
  }, [logInfo, user]);

  // This component doesn't render anything visible
  return null;
};

export default DebugLogger;