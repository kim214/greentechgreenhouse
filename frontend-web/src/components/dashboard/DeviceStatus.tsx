import { Cpu, Droplets, Fan, Radio, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatRelativeTime, type DeviceRow, type SensorRow } from "../../lib/farmApi";
import { cn } from "../../lib/utils";

const ICONS = {
  controller: Cpu,
  pump: Droplets,
  fan: Fan,
  sensor_hub: Radio,
};

export function DeviceStatus({
  devices,
  sensors,
  houseStatus,
  irrigating = false,
  ventilating = false,
}: {
  devices: DeviceRow[];
  sensors: SensorRow[];
  houseStatus?: string;
  irrigating?: boolean;
  ventilating?: boolean;
}) {
  const onlineCount = devices.filter((d) => d.is_online).length;
  const sensorOffline = sensors.filter((s) => !s.is_online);

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg font-display">
          <span>Devices</span>
          <span className="text-xs font-medium text-muted-foreground">
            {onlineCount}/{devices.length} online
            {houseStatus ? ` · House ${houseStatus}` : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {devices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No devices registered for this house.</p>
        ) : (
          devices.map((device) => {
            const Icon = ICONS[device.type] ?? Cpu;
            return (
              <div
                key={device.id}
                className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      device.is_online ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{device.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {device.code} · {device.power_status} · {formatRelativeTime(device.last_heartbeat)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {device.is_online ? (
                    <Wifi className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {device.type === "pump" && irrigating
                    ? "Running"
                    : device.type === "fan" && ventilating
                      ? "Running"
                      : device.is_online
                        ? "Online"
                        : "Offline"}
                </div>
              </div>
            );
          })
        )}
        {sensorOffline.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Sensor {sensorOffline.map((s) => s.code).join(", ")} offline
          </p>
        )}
      </CardContent>
    </Card>
  );
}
