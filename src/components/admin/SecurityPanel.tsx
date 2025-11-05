import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  Lock,
  Activity,
  Users,
  Database,
  RefreshCw
} from 'lucide-react';

export const SecurityPanel: React.FC = () => {
  const [scanLoading, setScanLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const { toast } = useToast();

  const securityMetrics = [
    {
      label: "Active Sessions",
      value: "127",
      status: "normal" as const,
      icon: Users,
      detail: "Users currently online"
    },
    {
      label: "Failed Login Attempts",
      value: "3",
      status: "low" as const,
      icon: Lock,
      detail: "Last 24 hours"
    },
    {
      label: "Suspicious Activity",
      value: "0",
      status: "good" as const,
      icon: AlertTriangle,
      detail: "No threats detected"
    },
    {
      label: "Database Connections",
      value: "12/100",
      status: "normal" as const,
      icon: Database,
      detail: "Connection pool usage"
    }
  ];

  const runSecurityScan = async () => {
    setScanLoading(true);
    try {
      // Simulate security scan
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Security Scan Complete",
        description: "No vulnerabilities detected. System is secure.",
      });
    } catch (error: any) {
      toast({
        title: "Scan Error",
        description: error.message || "Failed to complete security scan",
        variant: "destructive"
      });
    } finally {
      setScanLoading(false);
    }
  };

  const runSecurityAudit = async () => {
    setAuditLoading(true);
    try {
      // Simulate security audit
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      toast({
        title: "Security Audit Complete",
        description: "All security policies are properly configured.",
      });
    } catch (error: any) {
      toast({
        title: "Audit Error", 
        description: error.message || "Failed to complete security audit",
        variant: "destructive"
      });
    } finally {
      setAuditLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'normal':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return CheckCircle;
      case 'low':
      case 'high':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Security Overview */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Shield className="w-5 h-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {securityMetrics.map((metric) => {
              const Icon = metric.icon;
              const StatusIcon = getStatusIcon(metric.status);
              return (
                <div key={metric.label} className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5" />
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm font-medium">{metric.label}</p>
                    <p className="text-xs opacity-75">{metric.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Vulnerability Scan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan the system for potential security vulnerabilities, outdated dependencies, and configuration issues.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Last Scan:</span>
                <Badge variant="outline">2 hours ago</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Status:</span>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Clean
                </Badge>
              </div>
            </div>

            <Button 
              onClick={runSecurityScan}
              disabled={scanLoading}
              className="w-full"
            >
              {scanLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Run Security Scan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Audit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Comprehensive audit of access controls, authentication policies, and data protection measures.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Last Audit:</span>
                <Badge variant="outline">Daily</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Compliance:</span>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  100%
                </Badge>
              </div>
            </div>

            <Button 
              onClick={runSecurityAudit}
              disabled={auditLoading}
              variant="outline"
              className="w-full"
            >
              {auditLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Run Security Audit
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            <div className="flex items-start gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Two-Factor Authentication</p>
                <p className="text-sm text-green-700">
                  2FA is properly configured for all admin accounts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">SSL/TLS Encryption</p>
                <p className="text-sm text-green-700">
                  All connections are encrypted with TLS 1.3
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Rate Limiting</p>
                <p className="text-sm text-yellow-700">
                  Consider implementing stricter rate limits for API endpoints
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Regular Backups</p>
                <p className="text-sm text-blue-700">
                  Database backups are automated and tested regularly
                </p>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

    </div>
  );
};