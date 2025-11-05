import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { IntelligentAutoFix } from '@/utils/intelligentAutoFix';

interface DebugLogEntry {
  message: string;
  level: 'info' | 'warn' | 'error' | 'critical';
  url?: string;
  stack_trace?: string;
  additional_data?: any;
  user_agent?: string;
  session_id?: string;
}

export const useDebugLogger = () => {
  // Generate a session ID for this browser session
  const sessionId = useCallback(() => {
    let id = sessionStorage.getItem('debug_session_id');
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('debug_session_id', id);
    }
    return id;
  }, []);

  // Auto-fix function for critical errors
  const triggerAutoFix = useCallback(async (logId: string, errorData: DebugLogEntry) => {
    try {
      console.log('🔧 Triggering auto-fix for critical error:', logId);
      
      await supabase.functions.invoke('ai-auto-fix', {
        body: {
          error_message: errorData.message,
          stack_trace: errorData.stack_trace,
          url: errorData.url || window.location.href,
          additional_data: errorData.additional_data,
          debug_log_id: logId
        }
      });
      
      console.log('✅ Auto-fix initiated successfully');
    } catch (error) {
      console.warn('❌ Auto-fix failed:', error);
    }
  }, []);

  // Log function that sends to Supabase
  const log = useCallback(async (entry: DebugLogEntry) => {
    try {
      // Check if user is authenticated before attempting to log to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // For unauthenticated users, only log to console
        console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.additional_data);
        return;
      }

      // Auto-resolve info logs immediately
      const shouldResolve = entry.level === 'info';
      
      const logData = {
        message: entry.message,
        level: entry.level,
        url: entry.url || window.location.href,
        stack_trace: entry.stack_trace,
        additional_data: entry.additional_data,
        user_agent: navigator.userAgent,
        session_id: sessionId(),
        resolved: shouldResolve,
        status: shouldResolve ? 'fixed' as const : 'new' as const
      };

      // Insert log and get the ID
      const { data, error } = await supabase
        .from('debug_logs')
        .insert(logData)
        .select('id')
        .maybeSingle();

      if (error) {
        console.warn('Failed to log to debug system:', error);
        return;
      }

      // Auto-trigger intelligent fix for errors and critical errors
      if ((entry.level === 'error' || entry.level === 'critical') && data?.id) {
        // Use enhanced intelligent auto-fix system with static import
        setTimeout(async () => {
          try {
            const result = await IntelligentAutoFix.applyAutomaticFix(
              data.id, 
              entry.message, 
              entry.stack_trace,
              entry.url
            );
            
            if (result.success && result.applied) {
              console.log('✅ Intelligent auto-fix successfully applied:', result.files_modified);
            }
          } catch (error) {
            console.warn('Auto-fix failed:', error);
          }
        }, 500);
        
        // Show user notification for critical errors (XSS-safe version)
        if (entry.level === 'critical') {
          const notification = document.createElement('div');
          notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 16px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 400px;';
          
          const title = document.createElement('div');
          title.style.cssText = 'font-weight: bold; margin-bottom: 8px;';
          title.textContent = '⚠️ Critical Error Detected';
          
          const message = document.createElement('div');
          message.style.cssText = 'font-size: 14px; margin-bottom: 12px;';
          message.textContent = entry.message; // Safe - textContent prevents XSS
          
          const status = document.createElement('div');
          status.style.cssText = 'font-size: 12px; opacity: 0.9;';
          status.textContent = '🔧 Intelligent auto-fix system activated...';
          
          notification.appendChild(title);
          notification.appendChild(message);
          notification.appendChild(status);
          document.body.appendChild(notification);
          
          // Remove notification after 8 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 8000);
        }
      }
    } catch (error) {
      console.warn('Debug logging failed:', error);
    }
  }, [sessionId, triggerAutoFix]);

  // Convenience methods
  const logInfo = useCallback((message: string, additionalData?: any) => {
    log({ message, level: 'info', additional_data: additionalData });
  }, [log]);

  const logWarning = useCallback((message: string, additionalData?: any) => {
    log({ message, level: 'warn', additional_data: additionalData });
  }, [log]);

  const logError = useCallback((message: string, error?: Error, additionalData?: any) => {
    log({
      message,
      level: 'error',
      stack_trace: error?.stack,
      additional_data: {
        error_name: error?.name,
        error_message: error?.message,
        ...additionalData
      }
    });
  }, [log]);

  const logCritical = useCallback((message: string, error?: Error, additionalData?: any) => {
    log({
      message,
      level: 'critical',
      stack_trace: error?.stack,
      additional_data: {
        error_name: error?.name,
        error_message: error?.message,
        ...additionalData
      }
    });
  }, [log]);

  // Setup global error handlers
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Filter out external script errors that we can't fix
      const isExternalError = event.filename?.includes('lovable.js') || 
                             event.filename?.includes('cdn.gpteng.co') ||
                             event.message?.includes('MutationRecord') ||
                             event.message?.includes('attributeName');
      
      if (isExternalError) {
        console.warn('External script error filtered out:', event.message);
        return;
      }
      
      logError(
        `Uncaught JavaScript Error: ${event.message}`,
        new Error(event.message),
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          source: 'global_error_handler'
        }
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logCritical(
        'Unhandled Promise Rejection',
        event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      );
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Override console methods to also log to our system
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      // Filter out RLS policy errors and external script errors
      const errorStr = args.join(' ');
      const isRLSError = errorStr.includes('row-level security policy');
      const isExternalError = errorStr.includes('lovable.js') || errorStr.includes('MutationRecord');
      const isRouterWarning = errorStr.includes('React Router') || errorStr.includes('startTransition');
      
      if (isRLSError || isExternalError || isRouterWarning) {
        return; // Don't log these to debug system
      }
      
      logError(`Console Error: ${errorStr}`, undefined, { 
        console_args: args,
        source: 'console_override'
      });
    };

    console.warn = (...args) => {
      originalConsoleWarn.apply(console, args);
      
      // Filter out React Router warnings and other non-critical warnings
      const warnStr = args.join(' ');
      const isRouterWarning = warnStr.includes('React Router') || warnStr.includes('startTransition');
      const isRLSWarning = warnStr.includes('Failed to log to debug system');
      
      if (isRouterWarning || isRLSWarning) {
        return; // Don't log these to debug system
      }
      
      logWarning(`Console Warning: ${warnStr}`, { 
        console_args: args,
        source: 'console_override'
      });
    };

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [logError, logCritical, logWarning]);

  return {
    log,
    logInfo,
    logWarning,
    logError,
    logCritical
  };
};