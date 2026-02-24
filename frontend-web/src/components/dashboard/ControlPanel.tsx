import { useState, useEffect } from "react";
import {
  Droplets,
  Fan,
  Wifi,
  WifiOff,
  Gauge,
  Thermometer,
  AlertTriangle,
  RefreshCw,
  Lock,
  Unlock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { useMqtt } from "../../hooks/useMqtt";
import { MQTT_TOPICS } from "../../lib/mqtt";
import { cn } from "../../lib/utils";

// Advanced gate-style control: Closed | Open with sliding pill
function GateControl({
  closed,
  onSetClosed,
  disabled,
  labels = { closed: "Closed", open: "Open" },
  iconClosed,
  iconOpen,
}: {
  closed: boolean;
  onSetClosed: (closed: boolean) => void;
  disabled?: boolean;
  labels?: { closed: string; open: string };
  iconClosed: React.ReactNode;
  iconOpen: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full overflow-hidden rounded-2xl border border-border bg-muted/40 p-1.5 transition-colors",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      {/* Sliding background pill */}
      <div
        className={cn(
          "absolute top-1.5 bottom-1.5 w-[calc(50%-3px)] rounded-xl bg-primary shadow-lg shadow-primary/25 transition-all duration-300 ease-out",
          closed ? "left-1.5" : "left-[calc(50%+1.5px)]"
        )}
      />
      <button
        type="button"
        onClick={() => onSetClosed(true)}
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center gap-2.5 py-3.5 text-sm font-semibold transition-colors rounded-xl",
          closed ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {iconClosed}
        <span>{labels.closed}</span>
      </button>
      <button
        type="button"
        onClick={() => onSetClosed(false)}
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center gap-2.5 py-3.5 text-sm font-semibold transition-colors rounded-xl",
          !closed ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {iconOpen}
        <span>{labels.open}</span>
      </button>
    </div>
  );
}

// ── MAIN CONTROL PANEL ──
export const ControlPanel = () => {
  const { data, sendCommand, isConnected } = useMqtt();
  const { toast } = useToast();

  // Local mode state — you choose. Syncs from MQTT on load, updates instantly on click
  const [isAutoMode, setIsAutoMode] = useState(true);
  useEffect(() => {
    setIsAutoMode(data.mode === "AUTO");
  }, [data.mode]);

  const pumpOn = data.pumpState;
  const fanOn = data.fanState;

  const setMode = (auto: boolean) => {
    setIsAutoMode(auto);
    sendCommand(MQTT_TOPICS.mode, auto ? "AUTO" : "MANUAL");
    if (!auto) {
      // When switching to Manual, set both to off so user starts from a clear state
      sendCommand(MQTT_TOPICS.irrigation, "OFF");
      sendCommand(MQTT_TOPICS.ventilation, "CLOSE");
    }
    toast({
      title: auto ? "Automatic mode" : "Manual mode",
      description: auto
        ? "Irrigation and ventilation now run on sensor data"
        : "You have full manual control. Open or close irrigation and ventilation below.",
    });
  };

  const setIrrigation = (on: boolean) => {
    sendCommand(MQTT_TOPICS.irrigation, on ? "ON" : "OFF");
    toast({
      title: on ? "Irrigation opened" : "Irrigation closed",
      description: "Command sent to ESP32",
    });
  };

  const setVentilation = (on: boolean) => {
    sendCommand(MQTT_TOPICS.ventilation, on ? "OPEN" : "CLOSE");
    toast({
      title: on ? "Ventilation opened" : "Ventilation closed",
      description: "Command sent to ESP32",
    });
  };

  const handleEmergencyStop = () => {
    sendCommand(MQTT_TOPICS.mode, "MANUAL");
    sendCommand(MQTT_TOPICS.irrigation, "OFF");
    sendCommand(MQTT_TOPICS.ventilation, "CLOSE");
    toast({
      title: "Emergency stop",
      description: "All systems switched to manual off",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Connection & Mode Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              isConnected
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isConnected ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4 animate-pulse" />
            )}
            {isConnected ? "ESP32 Live" : "Connecting…"}
          </div>

          <div className="flex rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setMode(true)}
              disabled={!isConnected}
              title="Choose automatic — systems run on sensor data"
              className={cn(
                "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                isAutoMode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                !isConnected && "cursor-not-allowed opacity-60"
              )}
            >
              <RefreshCw className="h-4 w-4" />
              Automatic
            </button>
            <button
              onClick={() => setMode(false)}
              disabled={!isConnected}
              title="Choose manual — you control irrigation and ventilation"
              className={cn(
                "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                !isAutoMode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                !isConnected && "cursor-not-allowed opacity-60"
              )}
            >
              <Gauge className="h-4 w-4" />
              Manual
            </button>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleEmergencyStop}
          disabled={!isConnected}
          className="gap-2 rounded-xl px-5 font-semibold"
        >
          <AlertTriangle className="h-4 w-4" />
          Emergency Stop
        </Button>
      </div>

      {/* Control Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Irrigation Card */}
        <Card className="overflow-hidden border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                    pumpOn ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-display">Irrigation</CardTitle>
                  <CardDescription className="text-xs">
                    {isAutoMode
                      ? "Auto: soil moisture < 30% triggers pump"
                      : "Manual — open or close water flow"}
                  </CardDescription>
                </div>
              </div>
              <div
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold uppercase",
                  pumpOn ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {pumpOn ? "Open" : "Closed"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAutoMode ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                <p className="mb-3 text-sm text-muted-foreground">
                  Soil moisture: <span className="font-semibold text-foreground">{data.soilMoisture}%</span>
                  {data.soilMoisture < 30 && (
                    <span className="ml-2 text-primary">— Pump active (auto)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Switch to Manual to open or close irrigation.
                </p>
              </div>
            ) : (
              <GateControl
                closed={!pumpOn}
                onSetClosed={(closed) => setIrrigation(!closed)}
                disabled={!isConnected}
                labels={{ closed: "Closed", open: "Open" }}
                iconClosed={<Lock className="h-4 w-4 shrink-0" />}
                iconOpen={<Unlock className="h-4 w-4 shrink-0" />}
              />
            )}
            {isAutoMode && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Thermometer className="h-3.5 w-3.5" />
                Auto mode — sensor-driven
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ventilation Card */}
        <Card className="overflow-hidden border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                    fanOn ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Fan className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-display">Ventilation</CardTitle>
                  <CardDescription className="text-xs">
                    {isAutoMode
                      ? "Auto: temp &gt; 30°C or humidity &gt; 60% triggers fan"
                      : "Manual — open or close vents"}
                  </CardDescription>
                </div>
              </div>
              <div
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold uppercase",
                  fanOn ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {fanOn ? "Open" : "Closed"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAutoMode ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                <p className="mb-3 text-sm text-muted-foreground">
                  Temp: <span className="font-semibold text-foreground">{data.temp.toFixed(1)}°C</span>
                  {" · "}
                  Humidity: <span className="font-semibold text-foreground">{data.humidity.toFixed(0)}%</span>
                  {((data.temp > 30) || (data.humidity > 60)) && (
                    <span className="ml-2 text-primary">— Fan active (auto)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Switch to Manual to open or close ventilation.
                </p>
              </div>
            ) : (
              <GateControl
                closed={!fanOn}
                onSetClosed={(closed) => setVentilation(!closed)}
                disabled={!isConnected}
                labels={{ closed: "Closed", open: "Open" }}
                iconClosed={<Lock className="h-4 w-4 shrink-0" />}
                iconOpen={<Unlock className="h-4 w-4 shrink-0" />}
              />
            )}
            {isAutoMode && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Thermometer className="h-3.5 w-3.5" />
                Auto mode — sensor-driven
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mode explanation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              You choose the mode
            </h3>
            <p className="text-xs text-muted-foreground">
              Click <strong>Automatic</strong> or <strong>Manual</strong> anytime to switch. 
              Automatic: sensor-driven. Manual: you control irrigation and ventilation directly.
            </p>
          </div>
          <p className="text-xs text-muted-foreground sm:text-right">
            All commands sent via MQTT to your ESP32
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
