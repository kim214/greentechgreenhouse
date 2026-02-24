import { Wifi, WifiOff, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMqtt } from "@/hooks/useMqtt";
import { MQTT_CONFIG } from "@/lib/mqtt";
import { cn } from "@/lib/utils";

export const ConnectionSettings = () => {
  const { isConnected, connectionError } = useMqtt();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Connection</h2>
        <p className="text-muted-foreground">MQTT broker and ESP32 connection settings</p>
      </div>

      {/* Connection Status */}
      <Card className="overflow-hidden border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-primary" />
            ) : (
              <WifiOff className="h-5 w-5 text-muted-foreground animate-pulse" />
            )}
            Status
          </CardTitle>
          <CardDescription>
            {isConnected
              ? "Dashboard is connected to the MQTT broker and receiving ESP32 sensor data."
              : connectionError
                ? "Connection failed. See the error below and check your .env (VITE_MQTT_URL, credentials)."
                : "Connecting to MQTT broker. Ensure the broker is running and the URL is correct."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
              isConnected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {isConnected ? (
              <Wifi className="h-5 w-5" />
            ) : (
              <WifiOff className="h-5 w-5 animate-pulse" />
            )}
            {isConnected ? "Connected" : "Disconnected"}
          </div>
          {connectionError && !isConnected && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p className="font-medium">Connection error</p>
              <p className="mt-1 break-all">{connectionError}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Try: use ws:// instead of wss:// if your broker has no TLS; ensure port 9001 is open; leave username/password empty in .env if the broker has no auth.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MQTT Broker Config */}
      <Card className="overflow-hidden border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle>MQTT Broker</CardTitle>
          <CardDescription>
            Configure the broker URL and credentials. ESP32 and dashboard must use the same broker.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mqtt-url">Broker URL (WebSocket)</Label>
            <Input
              id="mqtt-url"
              value={MQTT_CONFIG.url}
              readOnly
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              WebSocket URL for browser connection (e.g. wss://broker-ip:9001)
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mqtt-username">Username</Label>
              <Input
                id="mqtt-username"
                value={MQTT_CONFIG.username}
                readOnly
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mqtt-password">Password</Label>
              <Input
                id="mqtt-password"
                type="password"
                value={MQTT_CONFIG.password ? "••••••••" : ""}
                readOnly
                className="font-mono"
              />
            </div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Configure via .env</p>
                <p>
                  Set VITE_MQTT_URL, VITE_MQTT_USERNAME, and VITE_MQTT_PASSWORD in .env and restart the app.
                </p>
                <p className="text-xs">
                  ESP32 uses tcp://broker-ip:1883 — same broker, different protocol.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
