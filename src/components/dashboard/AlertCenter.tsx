import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, X, Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "sensor" | "system" | "pest" | "maintenance";
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
}

const AlertCard = ({ alert, onResolve, onDismiss }: { 
  alert: Alert; 
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
}) => {
  const severityColors = {
    low: "bg-blue-50 border-blue-200 text-blue-800",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-800", 
    high: "bg-orange-50 border-orange-200 text-orange-800",
    critical: "bg-red-50 border-red-200 text-red-800"
  };

  const severityIcons = {
    low: <Clock className="w-4 h-4" />,
    medium: <Bell className="w-4 h-4" />,
    high: <AlertTriangle className="w-4 h-4" />,
    critical: <AlertTriangle className="w-4 h-4" />
  };

  const categoryLabels = {
    sensor: "Sensor",
    system: "System", 
    pest: "Pest Detection",
    maintenance: "Maintenance"
  };

  return (
    <Card className={`shadow-elegant border-0 transition-smooth ${!alert.isRead ? 'ring-2 ring-primary/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${severityColors[alert.severity]}`}>
              {severityIcons[alert.severity]}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className="text-lg">{alert.title}</CardTitle>
                {!alert.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary pulse-gentle" />
                )}
              </div>
              <CardDescription>{alert.description}</CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[alert.category]}
                </Badge>
                <Badge className={`text-xs ${severityColors[alert.severity]}`}>
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(alert.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
          {!alert.isResolved && (
            <Button 
              size="sm" 
              onClick={() => onResolve(alert.id)}
              className="transition-smooth"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const AlertCenter = () => {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      title: "Low Soil Moisture Detected",
      description: "Soil moisture in Section A has dropped to 45%. Irrigation recommended.",
      severity: "high",
      category: "sensor",
      timestamp: "2 minutes ago",
      isRead: false,
      isResolved: false
    },
    {
      id: "2", 
      title: "Pest Detection Alert",
      description: "Aphids detected on plants in North Corner camera. Immediate action recommended.",
      severity: "critical",
      category: "pest",
      timestamp: "5 minutes ago", 
      isRead: false,
      isResolved: false
    },
    {
      id: "3",
      title: "Ventilation System Maintenance",
      description: "Scheduled maintenance due for ventilation system in 3 days.",
      severity: "low",
      category: "maintenance", 
      timestamp: "1 hour ago",
      isRead: true,
      isResolved: false
    },
    {
      id: "4",
      title: "Temperature Spike Resolved",
      description: "Temperature returned to normal range. Ventilation system auto-activated.",
      severity: "medium",
      category: "system",
      timestamp: "2 hours ago",
      isRead: true, 
      isResolved: true
    }
  ]);

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isResolved: true, isRead: true }
        : alert
    ));
    
    toast({
      title: "Alert Resolved",
      description: "The alert has been marked as resolved.",
    });
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    toast({
      title: "Alert Dismissed", 
      description: "The alert has been removed from your list.",
    });
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.severity === "critical" && !alert.isResolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alert Center</h2>
          <p className="text-muted-foreground">Monitor and manage system notifications</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{unreadCount}</div>
            <div className="text-xs text-muted-foreground">Unread</div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="text-lg">Notification Settings</CardTitle>
          <CardDescription>Configure how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <Label htmlFor="notifications" className="font-medium">
                Push Notifications
              </Label>
            </div>
            <Switch 
              id="notifications"
              checked={notificationsEnabled} 
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card className="shadow-elegant border-0">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No active alerts at this time.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <AlertCard 
              key={alert.id} 
              alert={alert} 
              onResolve={handleResolve}
              onDismiss={handleDismiss}
            />
          ))
        )}
      </div>
    </div>
  );
};