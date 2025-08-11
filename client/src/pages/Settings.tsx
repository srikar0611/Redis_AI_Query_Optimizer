import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings as SettingsIcon, Bell, Database, Shield, User, LogOut, Save, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    // AI Settings
    aiAnalysisEnabled: true,
    autoOptimize: false,
    optimizationThreshold: 1000,
    geminiModel: "gemini-2.5-flash",
    
    // Alert Settings
    emailAlerts: true,
    slackAlerts: false,
    alertThreshold: 2000,
    maxAlertsPerHour: 5,
    
    // Performance Settings
    queryLogRetention: 30,
    metricsRetention: 90,
    realTimeUpdates: true,
    dataRefreshInterval: 5000,
    
    // Redis Settings
    redisEnabled: true,
    cacheExpiration: 3600,
    fallbackToMemory: true,
    
    // Security Settings
    sessionTimeout: 30,
    requireAuth: false,
    auditLogging: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await apiRequest('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      setIsDirty(false);
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Settings</h1>
          <p className="text-muted-foreground">Configure your Redis AI Query Optimizer preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <Badge variant="secondary" data-testid="unsaved-changes">Unsaved Changes</Badge>
          )}
          <Button onClick={handleSave} disabled={!isDirty} data-testid="btn-save-settings">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* AI & Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            AI & Optimization
          </CardTitle>
          <CardDescription>Configure AI-powered query analysis and optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable AI Analysis</Label>
                  <p className="text-sm text-muted-foreground">Use Gemini AI for query optimization</p>
                </div>
                <Switch
                  checked={settings.aiAnalysisEnabled}
                  onCheckedChange={(checked) => handleSettingChange('aiAnalysisEnabled', checked)}
                  data-testid="switch-ai-analysis"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-optimize Queries</Label>
                  <p className="text-sm text-muted-foreground">Automatically apply safe optimizations</p>
                </div>
                <Switch
                  checked={settings.autoOptimize}
                  onCheckedChange={(checked) => handleSettingChange('autoOptimize', checked)}
                  disabled={!settings.aiAnalysisEnabled}
                  data-testid="switch-auto-optimize"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="optimization-threshold">Optimization Threshold (ms)</Label>
                <Input
                  id="optimization-threshold"
                  type="number"
                  value={settings.optimizationThreshold}
                  onChange={(e) => handleSettingChange('optimizationThreshold', parseInt(e.target.value))}
                  disabled={!settings.aiAnalysisEnabled}
                  data-testid="input-optimization-threshold"
                />
                <p className="text-sm text-muted-foreground">Analyze queries slower than this threshold</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gemini-model">Gemini Model</Label>
                <Select
                  value={settings.geminiModel}
                  onValueChange={(value) => handleSettingChange('geminiModel', value)}
                  disabled={!settings.aiAnalysisEnabled}
                >
                  <SelectTrigger data-testid="select-gemini-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</SelectItem>
                    <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications & Alerts
          </CardTitle>
          <CardDescription>Configure how you receive performance alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch
                  checked={settings.emailAlerts}
                  onCheckedChange={(checked) => handleSettingChange('emailAlerts', checked)}
                  data-testid="switch-email-alerts"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send alerts to Slack channel</p>
                </div>
                <Switch
                  checked={settings.slackAlerts}
                  onCheckedChange={(checked) => handleSettingChange('slackAlerts', checked)}
                  data-testid="switch-slack-alerts"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alert-threshold">Alert Threshold (ms)</Label>
                <Input
                  id="alert-threshold"
                  type="number"
                  value={settings.alertThreshold}
                  onChange={(e) => handleSettingChange('alertThreshold', parseInt(e.target.value))}
                  data-testid="input-alert-threshold"
                />
                <p className="text-sm text-muted-foreground">Trigger alerts for queries slower than this</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-alerts">Max Alerts per Hour</Label>
                <Input
                  id="max-alerts"
                  type="number"
                  value={settings.maxAlertsPerHour}
                  onChange={(e) => handleSettingChange('maxAlertsPerHour', parseInt(e.target.value))}
                  data-testid="input-max-alerts"
                />
                <p className="text-sm text-muted-foreground">Prevent alert spam</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Performance & Data
          </CardTitle>
          <CardDescription>Configure data retention and update intervals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query-retention">Query Log Retention (days)</Label>
                <Input
                  id="query-retention"
                  type="number"
                  value={settings.queryLogRetention}
                  onChange={(e) => handleSettingChange('queryLogRetention', parseInt(e.target.value))}
                  data-testid="input-query-retention"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metrics-retention">Metrics Retention (days)</Label>
                <Input
                  id="metrics-retention"
                  type="number"
                  value={settings.metricsRetention}
                  onChange={(e) => handleSettingChange('metricsRetention', parseInt(e.target.value))}
                  data-testid="input-metrics-retention"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Real-time Updates</Label>
                  <p className="text-sm text-muted-foreground">Enable live dashboard updates</p>
                </div>
                <Switch
                  checked={settings.realTimeUpdates}
                  onCheckedChange={(checked) => handleSettingChange('realTimeUpdates', checked)}
                  data-testid="switch-realtime-updates"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Refresh Interval (ms)</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  value={settings.dataRefreshInterval}
                  onChange={(e) => handleSettingChange('dataRefreshInterval', parseInt(e.target.value))}
                  disabled={!settings.realTimeUpdates}
                  data-testid="input-refresh-interval"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redis Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Redis Configuration
          </CardTitle>
          <CardDescription>Configure caching and Redis settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Redis Caching</Label>
                  <p className="text-sm text-muted-foreground">Use Redis for optimization caching</p>
                </div>
                <Switch
                  checked={settings.redisEnabled}
                  onCheckedChange={(checked) => handleSettingChange('redisEnabled', checked)}
                  data-testid="switch-redis-enabled"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Memory Fallback</Label>
                  <p className="text-sm text-muted-foreground">Use memory when Redis unavailable</p>
                </div>
                <Switch
                  checked={settings.fallbackToMemory}
                  onCheckedChange={(checked) => handleSettingChange('fallbackToMemory', checked)}
                  data-testid="switch-memory-fallback"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cache-expiration">Cache Expiration (seconds)</Label>
                <Input
                  id="cache-expiration"
                  type="number"
                  value={settings.cacheExpiration}
                  onChange={(e) => handleSettingChange('cacheExpiration', parseInt(e.target.value))}
                  disabled={!settings.redisEnabled}
                  data-testid="input-cache-expiration"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Authentication
          </CardTitle>
          <CardDescription>Manage security and access control settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  data-testid="input-session-timeout"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Authentication</Label>
                  <p className="text-sm text-muted-foreground">Force login for dashboard access</p>
                </div>
                <Switch
                  checked={settings.requireAuth}
                  onCheckedChange={(checked) => handleSettingChange('requireAuth', checked)}
                  data-testid="switch-require-auth"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Log all configuration changes</p>
                </div>
                <Switch
                  checked={settings.auditLogging}
                  onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                  data-testid="switch-audit-logging"
                />
              </div>

              <Button 
                variant="destructive" 
                onClick={handleLogout} 
                className="w-full"
                data-testid="btn-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Some settings require a system restart to take full effect. Changes to Redis configuration 
          and authentication settings will be applied after the next restart.
        </AlertDescription>
      </Alert>
    </div>
  );
}