import { useState } from "react";
import { Save, Bell, Mail, MessageSquare, Smartphone, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface NotificationChannel {
  email: boolean;
  sms: boolean;
  push: boolean;
  webhook: boolean;
}

interface NotificationSettings {
  critical: NotificationChannel;
  warning: NotificationChannel;
  info: NotificationChannel;
  maintenance: NotificationChannel;
}

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [globalNotifications, setGlobalNotifications] = useState(true);
  const [quietHours, setQuietHours] = useState({
    enabled: true,
    startTime: "22:00",
    endTime: "07:00"
  });
  const [alertThreshold, setAlertThreshold] = useState([5]);
  const [batchNotifications, setBatchNotifications] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    critical: { email: true, sms: true, push: true, webhook: false },
    warning: { email: true, sms: false, push: true, webhook: false },
    info: { email: false, sms: false, push: true, webhook: false },
    maintenance: { email: true, sms: false, push: false, webhook: false }
  });

  const [contacts, setContacts] = useState([
    { id: "1", name: "Primary Phone", value: "+1 (555) 123-4567", type: "sms" },
    { id: "2", name: "Manager Email", value: "manager@greenhouse.com", type: "email" }
  ]);

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Notification preferences have been updated successfully.",
    });
  };

  const updateNotificationChannel = (
    level: keyof NotificationSettings, 
    channel: keyof NotificationChannel, 
    enabled: boolean
  ) => {
    setNotifications(prev => ({
      ...prev,
      [level]: { ...prev[level], [channel]: enabled }
    }));
  };

  const NotificationLevelCard = ({ 
    level, 
    title, 
    description, 
    icon,
    settings 
  }: {
    level: keyof NotificationSettings;
    title: string;
    description: string;
    icon: React.ReactNode;
    settings: NotificationChannel;
  }) => (
    <Card className="shadow-elegant border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm">Email</Label>
            </div>
            <Switch 
              checked={settings.email}
              onCheckedChange={(checked) => updateNotificationChannel(level, 'email', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm">SMS</Label>
            </div>
            <Switch 
              checked={settings.sms}
              onCheckedChange={(checked) => updateNotificationChannel(level, 'sms', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm">Push</Label>
            </div>
            <Switch 
              checked={settings.push}
              onCheckedChange={(checked) => updateNotificationChannel(level, 'push', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm">Webhook</Label>
            </div>
            <Switch 
              checked={settings.webhook}
              onCheckedChange={(checked) => updateNotificationChannel(level, 'webhook', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notification Settings</h2>
          <p className="text-muted-foreground">Configure how and when you receive alerts and updates</p>
        </div>
        <Button onClick={handleSave} className="transition-smooth">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Global Settings */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle>Global Notification Settings</CardTitle>
          <CardDescription>Master controls for all notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
            </div>
            <Switch 
              checked={globalNotifications} 
              onCheckedChange={setGlobalNotifications}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">Suppress non-critical notifications during specified hours</p>
              </div>
              <Switch 
                checked={quietHours.enabled} 
                onCheckedChange={(checked) => setQuietHours(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            
            {quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 pl-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={quietHours.startTime}
                    onChange={(e) => setQuietHours(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={quietHours.endTime}
                    onChange={(e) => setQuietHours(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Alert Threshold: {alertThreshold[0]} minutes</Label>
            <p className="text-sm text-muted-foreground">Minimum time between similar alerts</p>
            <Slider
              value={alertThreshold}
              onValueChange={setAlertThreshold}
              max={60}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 min</span>
              <span>60 min</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Batch Notifications</Label>
              <p className="text-sm text-muted-foreground">Group similar notifications together</p>
            </div>
            <Switch 
              checked={batchNotifications} 
              onCheckedChange={setBatchNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Levels */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Notification Levels</h3>
        
        <NotificationLevelCard
          level="critical"
          title="Critical Alerts"
          description="Emergency situations requiring immediate attention"
          icon={<AlertTriangle className="w-5 h-5" />}
          settings={notifications.critical}
        />
        
        <NotificationLevelCard
          level="warning"
          title="Warning Alerts"
          description="Important conditions that need monitoring"
          icon={<AlertTriangle className="w-5 h-5" />}
          settings={notifications.warning}
        />
        
        <NotificationLevelCard
          level="info"
          title="Informational"
          description="General system updates and status changes"
          icon={<Info className="w-5 h-5" />}
          settings={notifications.info}
        />
        
        <NotificationLevelCard
          level="maintenance"
          title="Maintenance Reminders"
          description="Scheduled maintenance and system health updates"
          icon={<CheckCircle className="w-5 h-5" />}
          settings={notifications.maintenance}
        />
      </div>

      {/* Contact Information */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Manage notification destinations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.value}</p>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            Add Contact
          </Button>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle>Webhook Integration</CardTitle>
          <CardDescription>Send notifications to external systems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-system.com/webhook"
            />
          </div>
          <Button variant="outline" size="sm">
            Test Webhook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};