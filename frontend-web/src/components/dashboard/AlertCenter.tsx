import { useState, useMemo, useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle, Clock, X, Bell, BellOff } from "lucide-react";
import { useMqtt } from "@/hooks/useMqtt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  getUserId,
  fetchAlerts,
  createAlert,
  updateAlert,
  type AlertRecord,
} from "@/lib/api";

type AlertSeverity = "low" | "medium" | "high" | "critical";
type AlertCategory =
  | "sensor"
  | "system"
  | "irrigation"
  | "climate"
  | "maintenance"
  | "analytics";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
  isFromApi?: boolean;
  apiId?: number;
}

const AlertCard = ({
  alert,
  onResolve,
  onDismiss,
}: {
  alert: Alert;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
}) => {
  const severityColors: Record<AlertSeverity, string> = {
    low: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-200",
    medium:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-200",
    high: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/50 dark:border-orange-800 dark:text-orange-200",
    critical:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-200",
  };

  const severityIcons: Record<AlertSeverity, React.ReactNode> = {
    low: <Clock className="w-4 h-4" />,
    medium: <Bell className="w-4 h-4" />,
    high: <AlertTriangle className="w-4 h-4" />,
    critical: <AlertTriangle className="w-4 h-4" />,
  };

  const categoryLabels: Record<AlertCategory, string> = {
    sensor: "Sensor",
    system: "System",
    irrigation: "Irrigation",
    climate: "Climate",
    maintenance: "Maintenance",
    analytics: "Analytics",
  };

  return (
    <Card
      className={`shadow-elegant border-0 transition-smooth ${!alert.isRead ? "ring-2 ring-primary/20" : ""}`}
    >
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
            <Button size="sm" onClick={() => onResolve(alert.id)} className="transition-smooth">
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function formatTimestamp(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return d.toLocaleDateString();
  } catch {
    return createdAt;
  }
}

function recordToAlert(r: AlertRecord): Alert {
  return {
    id: `api-${r.id}`,
    apiId: r.id,
    title: r.title,
    description: r.description,
    severity: r.severity,
    category: r.category,
    timestamp: formatTimestamp(r.created_at),
    isRead: r.isRead,
    isResolved: r.isResolved,
    isFromApi: true,
  };
}

// Throttle: don't create the same alert type within this many ms
const MQTT_ALERT_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

export const AlertCenter = ({ onUnreadChange }: { onUnreadChange?: (count: number) => void }) => {
  const { toast } = useToast();
  const { data, isConnected } = useMqtt();
  const userId = getUserId();
  const [apiAlerts, setApiAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dismissedMqttIds, setDismissedMqttIds] = useState<Set<string>>(new Set());
  const lastPostedRef = useRef<Record<string, number>>({});

  // Fetch alerts from API
  const loadAlerts = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const list = await fetchAlerts(userId);
      setApiAlerts(list);
    } catch {
      setApiAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const t = setInterval(loadAlerts, 30_000);
    return () => clearInterval(t);
  }, [userId]);

  // MQTT-based alerts (live only; optionally POST to API)
  const mqttAlerts = useMemo((): Alert[] => {
    const out: Alert[] = [];
    const now = "Just now";

    if (data.soilMoisture < 30) {
      out.push({
        id: "mqtt-soil",
        title: "Low Soil Moisture — Irrigation Needed",
        description: `Soil moisture at ${data.soilMoisture}%. Turn on irrigation or enable AUTO mode.`,
        severity: "critical",
        category: "irrigation",
        timestamp: now,
        isRead: false,
        isResolved: false,
      });
    } else if (data.soilMoisture < 50) {
      out.push({
        id: "mqtt-soil-warn",
        title: "Soil Moisture Low",
        description: `Soil moisture at ${data.soilMoisture}%. Monitor and consider irrigation.`,
        severity: "high",
        category: "sensor",
        timestamp: now,
        isRead: false,
        isResolved: false,
      });
    }

    if (data.temp > 30) {
      out.push({
        id: "mqtt-temp",
        title: "High Temperature",
        description: `Temperature at ${data.temp.toFixed(1)}°C. Ventilation recommended.`,
        severity: "high",
        category: "climate",
        timestamp: now,
        isRead: false,
        isResolved: false,
      });
    }

    if (data.humidity > 75) {
      out.push({
        id: "mqtt-humidity",
        title: "High Humidity",
        description: `Humidity at ${data.humidity.toFixed(0)}%. Ventilation may help.`,
        severity: "medium",
        category: "climate",
        timestamp: now,
        isRead: false,
        isResolved: false,
      });
    }

    if (!isConnected) {
      out.push({
        id: "mqtt-connection",
        title: "ESP32 Disconnected",
        description: "Live sensor data is not available. Check MQTT connection.",
        severity: "medium",
        category: "system",
        timestamp: now,
        isRead: false,
        isResolved: false,
      });
    }

    return out;
  }, [data.temp, data.humidity, data.soilMoisture, isConnected]);

  // Persist MQTT-triggered alerts to API (throttled)
  useEffect(() => {
    if (!userId || mqttAlerts.length === 0) return;
    const keyMap: Record<string, string> = {
      "mqtt-soil": "soil-critical",
      "mqtt-soil-warn": "soil-warn",
      "mqtt-temp": "temp-high",
      "mqtt-humidity": "humidity-high",
      "mqtt-connection": "connection-lost",
    };
    const now = Date.now();
    for (const a of mqttAlerts) {
      const key = keyMap[a.id];
      if (!key || now - (lastPostedRef.current[key] ?? 0) < MQTT_ALERT_THROTTLE_MS) continue;
      lastPostedRef.current[key] = now;
      createAlert(userId, {
        title: a.title,
        description: a.description,
        severity: a.severity,
        category: a.category,
      })
        .then(() => loadAlerts())
        .catch(() => {});
    }
  }, [userId, mqttAlerts]);

  const visibleMqtt = mqttAlerts.filter((a) => !dismissedMqttIds.has(a.id));
  const alerts: Alert[] = useMemo(() => {
    const fromApi = apiAlerts.map(recordToAlert);
    return [...visibleMqtt, ...fromApi];
  }, [apiAlerts, visibleMqtt]);

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" && !a.isResolved
  ).length;

  useEffect(() => {
    onUnreadChange?.(unreadCount);
  }, [unreadCount, onUnreadChange]);

  const handleResolve = async (alertId: string) => {
    if (alertId.startsWith("mqtt-")) {
      setDismissedMqttIds((prev) => new Set([...prev, alertId]));
      toast({ title: "Alert resolved", description: "The alert has been marked as resolved." });
      return;
    }
    const apiId = alerts.find((a) => a.id === alertId)?.apiId;
    if (apiId != null && userId) {
      try {
        await updateAlert(userId, apiId, { is_resolved: true, is_read: true });
        await loadAlerts();
        toast({ title: "Alert resolved", description: "The alert has been marked as resolved." });
      } catch {
        toast({ title: "Error", description: "Could not update alert.", variant: "destructive" });
      }
    }
  };

  const handleDismiss = async (alertId: string) => {
    if (alertId.startsWith("mqtt-")) {
      setDismissedMqttIds((prev) => new Set([...prev, alertId]));
      toast({ title: "Alert dismissed", description: "The alert has been removed from your list." });
      return;
    }
    const apiId = alerts.find((a) => a.id === alertId)?.apiId;
    if (apiId != null && userId) {
      try {
        await updateAlert(userId, apiId, { is_resolved: true, is_read: true });
        await loadAlerts();
        toast({ title: "Alert dismissed", description: "The alert has been removed from your list." });
      } catch {
        toast({ title: "Error", description: "Could not update alert.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alert Center</h2>
          <p className="text-muted-foreground">Real-time alerts from sensors and system</p>
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

      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="text-lg">Notification Settings</CardTitle>
          <CardDescription>Configure how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {notificationsEnabled ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
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

      <div className="space-y-4">
        {loading ? (
          <Card className="shadow-elegant border-0">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading alerts…</p>
            </CardContent>
          </Card>
        ) : alerts.length === 0 ? (
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
