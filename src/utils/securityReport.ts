/**
 * Comprehensive Security Audit Report for Short Talez
 * Generated: ${new Date().toISOString()}
 */

export interface SecurityIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  status: 'fixed' | 'mitigated' | 'requires_attention';
  recommendations?: string[];
}

export interface SecurityReport {
  summary: {
    totalIssues: number;
    fixed: number;
    mitigated: number;
    requiresAttention: number;
    overallScore: number;
  };
  issues: SecurityIssue[];
}

export const generateSecurityReport = (): SecurityReport => {
  const issues: SecurityIssue[] = [
    {
      id: 'xss-innerHTML',
      severity: 'high',
      category: 'Cross-Site Scripting (XSS)',
      title: 'XSS Vulnerability in Debug Logger',
      description: 'innerHTML usage with unsanitized user input could lead to XSS attacks',
      status: 'fixed',
      recommendations: [
        'Replace innerHTML with safe DOM manipulation',
        'Use textContent for user-generated content',
        'Implement Content Security Policy (CSP)'
      ]
    },
    {
      id: 'database-single-calls',
      severity: 'medium',
      category: 'Database Security',
      title: 'Potential Database Errors with .single()',
      description: 'Using .single() can cause errors when no data is returned',
      status: 'fixed',
      recommendations: [
        'Replace .single() with .maybeSingle()',
        'Add proper error handling for empty results'
      ]
    },
    {
      id: 'function-search-path',
      severity: 'medium',
      category: 'Database Security',
      title: 'Database Functions Missing Search Path',
      description: 'Some database functions lack proper search_path settings',
      status: 'fixed',
      recommendations: [
        'Set search_path = public for all security definer functions',
        'Review function permissions and access controls'
      ]
    },
    {
      id: 'input-validation',
      severity: 'high',
      category: 'Input Validation',
      title: 'Missing Input Sanitization',
      description: 'User input not properly sanitized before database storage',
      status: 'fixed',
      recommendations: [
        'Implement comprehensive input sanitization',
        'Add XSS protection for all user inputs',
        'Validate file uploads'
      ]
    },
    {
      id: 'rate-limiting',
      severity: 'medium',
      category: 'API Security',
      title: 'Missing Rate Limiting',
      description: 'No rate limiting on critical operations like post creation',
      status: 'fixed',
      recommendations: [
        'Implement client-side and server-side rate limiting',
        'Add progressive delays for repeated attempts',
        'Monitor for abuse patterns'
      ]
    },
    {
      id: 'authentication-validation',
      severity: 'high',
      category: 'Authentication',
      title: 'Insufficient Authentication Validation',
      description: 'Operations performed without proper authentication validation',
      status: 'fixed',
      recommendations: [
        'Validate authentication state before critical operations',
        'Implement session management',
        'Add multi-factor authentication support'
      ]
    },
    {
      id: 'extension-in-public',
      severity: 'low',
      category: 'Database Configuration',
      title: 'Extensions in Public Schema',
      description: 'Some extensions are installed in the public schema',
      status: 'requires_attention',
      recommendations: [
        'Move extensions to dedicated schema',
        'Review extension permissions',
        'Follow Supabase best practices'
      ]
    },
    {
      id: 'auth-otp-expiry',
      severity: 'medium',
      category: 'Authentication Configuration',
      title: 'OTP Expiry Too Long',
      description: 'OTP expiry exceeds recommended security threshold',
      status: 'requires_attention',
      recommendations: [
        'Reduce OTP expiry time to maximum 10 minutes',
        'Configure in Supabase Auth settings',
        'Implement automatic cleanup of expired OTPs'
      ]
    },
    {
      id: 'password-protection',
      severity: 'medium',
      category: 'Authentication Configuration',
      title: 'Leaked Password Protection Disabled',
      description: 'Password breach detection is currently disabled',
      status: 'requires_attention',
      recommendations: [
        'Enable leaked password protection in Supabase Auth',
        'Implement password strength requirements',
        'Add password history checking'
      ]
    },
    {
      id: 'postgres-version',
      severity: 'low',
      category: 'Infrastructure',
      title: 'Postgres Version Outdated',
      description: 'Current Postgres version has available security patches',
      status: 'requires_attention',
      recommendations: [
        'Upgrade Postgres database through Supabase dashboard',
        'Schedule regular database updates',
        'Monitor security advisories'
      ]
    }
  ];

  const fixed = issues.filter(i => i.status === 'fixed').length;
  const mitigated = issues.filter(i => i.status === 'mitigated').length;
  const requiresAttention = issues.filter(i => i.status === 'requires_attention').length;
  
  // Calculate overall security score (0-100)
  const totalIssues = issues.length;
  const weightedScore = issues.reduce((score, issue) => {
    const baseScore = issue.status === 'fixed' ? 100 : issue.status === 'mitigated' ? 75 : 0;
    const severityMultiplier = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      critical: 2
    }[issue.severity];
    
    return score + (baseScore * severityMultiplier);
  }, 0);
  
  const maxPossibleScore = issues.reduce((max, issue) => {
    const severityMultiplier = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      critical: 2
    }[issue.severity];
    
    return max + (100 * severityMultiplier);
  }, 0);
  
  const overallScore = Math.round((weightedScore / maxPossibleScore) * 100);

  return {
    summary: {
      totalIssues,
      fixed,
      mitigated,
      requiresAttention,
      overallScore
    },
    issues
  };
};

export const getSecurityRecommendations = (): string[] => [
  '🔒 **Immediate Actions Required:**',
  '• Enable leaked password protection in Supabase Auth settings',
  '• Reduce OTP expiry time to 10 minutes maximum',
  '• Schedule Postgres database upgrade through Supabase dashboard',
  '',
  '🛡️ **Security Enhancements Implemented:**',
  '• Fixed XSS vulnerability in debug logger with safe DOM manipulation',
  '• Enhanced input sanitization across all user inputs',
  '• Added comprehensive rate limiting (5 posts per 5 minutes)',
  '• Implemented authentication validation for all critical operations',
  '• Fixed database function security with proper search_path settings',
  '• Replaced .single() calls with .maybeSingle() to prevent errors',
  '',
  '📊 **Security Monitoring:**',
  '• Security events are now logged for analysis',
  '• Rate limiting prevents abuse and DDoS attempts',
  '• File uploads are validated for type and size',
  '• All user inputs are sanitized before storage',
  '',
  '🔧 **Ongoing Maintenance:**',
  '• Regular security scans should be performed',
  '• Monitor security event logs for suspicious activity',
  '• Keep database and dependencies updated',
  '• Review and update security policies quarterly'
];

export default generateSecurityReport;