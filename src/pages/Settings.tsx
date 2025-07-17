import { useState } from 'react';
import { Save, Download, Upload, Trash2, RefreshCw, Shield, Bell, Database, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  
  const [generalSettings, setGeneralSettings] = useState({
    organizationName: 'Nakuja Rocket Project',
    defaultCurrency: 'USD',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    lowStockThreshold: 10,
    autoApprovalLimit: 500
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    purchaseApprovals: true,
    inventoryUpdates: false,
    systemMaintenance: true,
    weeklyReports: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireTwoFactor: false,
    sessionTimeout: 24,
    passwordExpiry: 90,
    auditLogging: true,
    ipWhitelisting: false
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    csvImportFormat: 'standard',
    backupFrequency: 'daily',
    apiAccess: false,
    webhookUrl: '',
    slackNotifications: false
  });

  const handleSaveGeneral = () => {
    toast({ title: 'General settings saved successfully' });
  };

  const handleSaveNotifications = () => {
    toast({ title: 'Notification settings saved successfully' });
  };

  const handleSaveSecurity = () => {
    toast({ title: 'Security settings saved successfully' });
  };

  const handleSaveIntegrations = () => {
    toast({ title: 'Integration settings saved successfully' });
  };

  const handleExportData = () => {
    toast({ title: 'Data export initiated', description: 'You will receive an email when the export is ready' });
  };

  const handleImportData = () => {
    toast({ title: 'Data import initiated', description: 'Processing uploaded file...' });
  };

  const handleBackupNow = () => {
    toast({ title: 'Backup initiated', description: 'Creating system backup...' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure system preferences and manage your account</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic configuration for your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input
                    value={generalSettings.organizationName}
                    onChange={(e) => setGeneralSettings({...generalSettings, organizationName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select 
                    value={generalSettings.defaultCurrency} 
                    onValueChange={(value) => setGeneralSettings({...generalSettings, defaultCurrency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="KES">KES (KSh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select 
                    value={generalSettings.timezone} 
                    onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
                      <SelectItem value="UTC+3">East Africa Time (UTC+3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select 
                    value={generalSettings.dateFormat} 
                    onValueChange={(value) => setGeneralSettings({...generalSettings, dateFormat: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Low Stock Threshold</Label>
                  <Input
                    type="number"
                    value={generalSettings.lowStockThreshold}
                    onChange={(e) => setGeneralSettings({...generalSettings, lowStockThreshold: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auto-Approval Limit ($)</Label>
                  <Input
                    type="number"
                    value={generalSettings.autoApprovalLimit}
                    onChange={(e) => setGeneralSettings({...generalSettings, autoApprovalLimit: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <Button onClick={handleSaveGeneral}>
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when inventory items are running low</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lowStockAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowStockAlerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Purchase Approvals</Label>
                    <p className="text-sm text-muted-foreground">Notify when purchase requests need approval</p>
                  </div>
                  <Switch
                    checked={notificationSettings.purchaseApprovals}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, purchaseApprovals: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Inventory Updates</Label>
                    <p className="text-sm text-muted-foreground">Notify on inventory changes</p>
                  </div>
                  <Switch
                    checked={notificationSettings.inventoryUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, inventoryUpdates: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Maintenance</Label>
                    <p className="text-sm text-muted-foreground">Notify about system updates and maintenance</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemMaintenance}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemMaintenance: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                  />
                </div>
              </div>
              <Button onClick={handleSaveNotifications}>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enforce 2FA for all users</p>
                  </div>
                  <Switch
                    checked={securitySettings.requireTwoFactor}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireTwoFactor: checked})}
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (hours)</Label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password Expiry (days)</Label>
                    <Input
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all user actions for security audits</p>
                  </div>
                  <Switch
                    checked={securitySettings.auditLogging}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLogging: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Whitelisting</Label>
                    <p className="text-sm text-muted-foreground">Restrict access to approved IP addresses</p>
                  </div>
                  <Switch
                    checked={securitySettings.ipWhitelisting}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, ipWhitelisting: checked})}
                  />
                </div>
              </div>
              <Button onClick={handleSaveSecurity}>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Import, export, and backup your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleExportData} variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Export Data
                </Button>
                <Button onClick={handleImportData} variant="outline" className="h-20 flex-col">
                  <Upload className="h-6 w-6 mb-2" />
                  Import Data
                </Button>
                <Button onClick={handleBackupNow} variant="outline" className="h-20 flex-col">
                  <RefreshCw className="h-6 w-6 mb-2" />
                  Backup Now
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CSV Import Format</Label>
                    <Select 
                      value={integrationSettings.csvImportFormat} 
                      onValueChange={(value) => setIntegrationSettings({...integrationSettings, csvImportFormat: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="legacy">Legacy</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select 
                      value={integrationSettings.backupFrequency} 
                      onValueChange={(value) => setIntegrationSettings({...integrationSettings, backupFrequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Access</Label>
                    <p className="text-sm text-muted-foreground">Enable API for third-party integrations</p>
                  </div>
                  <Switch
                    checked={integrationSettings.apiAccess}
                    onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, apiAccess: checked})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    placeholder="https://your-webhook-url.com/endpoint"
                    value={integrationSettings.webhookUrl}
                    onChange={(e) => setIntegrationSettings({...integrationSettings, webhookUrl: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Slack Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications to Slack channels</p>
                  </div>
                  <Switch
                    checked={integrationSettings.slackNotifications}
                    onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, slackNotifications: checked})}
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveIntegrations}>
                <Save className="h-4 w-4 mr-2" />
                Save Integration Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-600 mb-2">Reset All Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    This will permanently delete all inventory, purchase requests, and BOM data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;