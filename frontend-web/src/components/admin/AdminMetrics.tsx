import {
  Activity,
  AlertTriangle,
  Droplets,
  Radio,
  Sprout,
  Users,
  Warehouse,
  WifiOff,
  Wind,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { AdminMetrics as Metrics } from "../../lib/adminApi";

const items = (m: Metrics) => [
  { label: "Farmers", value: m.totalFarmers, detail: `${m.activeFarmers} active`, icon: Users },
  { label: "Offline farmers", value: m.offlineFarmers, detail: "Not recently active", icon: WifiOff },
  { label: "Greenhouses", value: m.totalGreenhouses, detail: `${m.onlineGreenhouses} online`, icon: Warehouse },
  { label: "Offline houses", value: m.offlineGreenhouses, detail: "Includes maintenance", icon: Warehouse },
  { label: "Devices online", value: m.connectedDevices, detail: `${m.offlineDevices} offline`, icon: Radio },
  { label: "Active alerts", value: m.activeAlerts, detail: "Unresolved", icon: AlertTriangle },
  { label: "Irrigation running", value: m.irrigationActive, detail: "Automatic cycles open", icon: Droplets },
  { label: "Ventilation open", value: m.ventilationActive, detail: "Automatic vents open", icon: Wind },
  { label: "Activity (24h)", value: m.activity24h, detail: "Platform events", icon: Activity },
];

export function AdminMetrics({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items(metrics).map((item) => (
        <Card key={item.label} className="border-border/50 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            <item.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{item.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </CardContent>
        </Card>
      ))}
      <Card className="border-border/50 bg-card shadow-sm sm:col-span-2 xl:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sprout className="h-4 w-4 text-primary" />
            Platform snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {metrics.onlineGreenhouses} of {metrics.totalGreenhouses} houses are online, with{" "}
          {metrics.connectedDevices} devices reporting, {metrics.irrigationActive} irrigation
          cycle{metrics.irrigationActive === 1 ? "" : "s"} running, and {metrics.ventilationActive}{" "}
          ventilation cycle{metrics.ventilationActive === 1 ? "" : "s"} open.
        </CardContent>
      </Card>
    </div>
  );
}
