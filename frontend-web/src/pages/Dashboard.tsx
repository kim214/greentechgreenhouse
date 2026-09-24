import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Droplets,
  Wind,
  Settings,
  Camera,
  Bell,
  Activity,
  Wifi,
  WifiOff,
  User,
  Zap,
  Thermometer,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { cn } from "../lib/utils";
import { SensorGrid } from "../components/dashboard/SensorGrid";
import { ControlPanel } from "../components/dashboard/ControlPanel";
import { CameraMonitoring } from "../components/dashboard/CameraMonitoring";
import { AlertCenter } from "../components/dashboard/AlertCenter";
import { Analytics } from "../components/dashboard/Analytics";
import { CropStatus } from "../components/dashboard/CropStatus";
import { DeviceStatus } from "../components/dashboard/DeviceStatus";
import { AutomationFeed } from "../components/dashboard/AutomationFeed";
import { useMqtt } from "../hooks/useMqtt";
import { useFarmDashboard } from "../hooks/useFarmDashboard";
import { formatRelativeTime } from "../lib/farmApi";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { DropdownMenuItem } from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import { LivePulse } from "../components/dashboard/LivePulse";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { AppShell } from "../components/layout/AppShell";
import { PageEmpty, PageError, PageLoading } from "../components/layout/PageState";
import { RegisterGreenhouseDialog } from "../components/dashboard/RegisterGreenhouseDialog";

export default function Dashboard() {
  const mqtt = useMqtt();
  const { data: mqttData, isConnected, sendCommand } = mqtt;
  const { houses, selectedId, setSelectedId, addHouse, snapshot, climate, loading, error, reload } =
    useFarmDashboard(mqtt);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateTime, setDateTime] = useState(new Date());
  const { isAdmin } = useCurrentProfile();
  const userName = localStorage.getItem("fullName") || "User";

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "controls", label: "Controls", icon: Droplets },
    { id: "cameras", label: "Live Sentry", icon: Camera },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "alerts", label: "Alert Center", icon: Bell },
  ];

  const quickActions = [
    { label: "Controls", icon: Zap, action: () => setActiveTab("controls") },
    { label: "Alerts", icon: Bell, action: () => setActiveTab("alerts") },
  ];

  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  useEffect(() => {
    if (activeTab === "alerts") return;
    const farmUnread = (snapshot?.alerts ?? []).filter((a) => !a.is_read && !a.is_resolved).length;
    setUnreadAlertsCount(farmUnread);
  }, [snapshot?.alerts, activeTab]);

  const extraNav = (
    <>
      {isAdmin && (
        <Link to="/admin" className="block">
          <span className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground">
            <Shield size={18} aria-hidden />
            Admin
          </span>
        </Link>
      )}
      <Link to="/settings" className="block">
        <span className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground">
          <Settings size={18} aria-hidden />
          Settings
        </span>
      </Link>
    </>
  );

  return (
    <AppShell
      title={menuItems.find((i) => i.id === activeTab)?.label ?? "Overview"}
      subtitle={
        snapshot
          ? `${snapshot.greenhouse.code} · ${snapshot.greenhouse.location ?? snapshot.greenhouse.name}`
          : "GreenTech OS"
      }
      navItems={menuItems}
      activeId={activeTab}
      onNav={setActiveTab}
      extraNav={extraNav}
      userName={userName}
      userCaption="GreenTech Account"
      headerExtra={
        <>
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-foreground">
              {dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-xs text-muted-foreground">
              {dateTime.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
          {houses.length > 0 && selectedId && (
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-[160px] rounded-xl sm:w-[220px]" aria-label="Select greenhouse">
                <SelectValue placeholder="Select house" />
              </SelectTrigger>
              <SelectContent>
                {houses.map((house) => (
                  <SelectItem key={house.id} value={house.id}>
                    {house.code} · {house.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!isAdmin && <RegisterGreenhouseDialog onSubmit={addHouse} disabled={loading} />}
          <Button
            variant="outline"
            size="icon"
            className="relative rounded-xl"
            aria-label={unreadAlertsCount > 0 ? `${unreadAlertsCount} unread alerts` : "Alerts"}
            onClick={() => setActiveTab("alerts")}
          >
            <Bell className="h-4 w-4" />
            {unreadAlertsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] font-bold"
              >
                {unreadAlertsCount}
              </Badge>
            )}
          </Button>
        </>
      }
      userMenu={
        <>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="gap-2 cursor-pointer">
                <Shield className="h-4 w-4" />
                Admin portal
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to="/settings" className="gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              Profile & Settings
            </Link>
          </DropdownMenuItem>
        </>
      }
    >
          <div className="space-y-6">
            {loading && !snapshot && <PageLoading label="Loading greenhouse…" />}
            {error && !snapshot && !loading && (
              <PageError description={error} onRetry={reload} />
            )}
            {!loading && !error && !snapshot && !climate.hasClimate && (
              <PageEmpty
                title="No house data yet"
                description="Add a greenhouse to start monitoring. Live controller readings appear on the open house when the ESP32 is connected."
              />
            )}
            {activeTab === "overview" && (snapshot || climate.hasClimate) && (
              <>
                {/* Connection Status */}
                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                    isConnected || snapshot?.greenhouse.status === "online"
                      ? "border-primary/20 bg-primary/5"
                      : "border-muted bg-muted/30"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {isConnected || snapshot?.greenhouse.status === "online" ? (
                      <Wifi className="h-5 w-5 text-primary" />
                    ) : (
                      <WifiOff className="h-5 w-5 animate-pulse text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      isConnected || snapshot?.greenhouse.status === "online"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}>
                      {isConnected
                        ? "Live — ESP32 connected"
                        : snapshot
                          ? `${snapshot.greenhouse.name} · ${snapshot.greenhouse.status}${
                              snapshot.latestReading
                                ? ` · updated ${formatRelativeTime(snapshot.latestReading.created_at)}`
                                : ""
                            }`
                          : "Connecting to ESP32…"}
                    </span>
                    <LivePulse
                      label="Streaming"
                      active={isConnected || snapshot?.greenhouse.status === "online"}
                    />
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/settings" className="gap-2 text-xs">
                      Connection settings
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                {/* Hero Stats */}
                <div className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-lg md:p-8">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatItem
                      label="Temperature"
                      value={climate.hasClimate ? `${climate.temp.toFixed(1)}°C` : "—"}
                      status={!climate.hasClimate ? "—" : climate.temp > 30 || climate.temp < 18 ? "Warning" : "Optimal"}
                      icon={<Thermometer size={16} />}
                      isWarning={climate.hasClimate && (climate.temp > 30 || climate.temp < 18)}
                    />
                    <StatItem
                      label="Humidity"
                      value={climate.hasClimate ? `${climate.humidity.toFixed(0)}%` : "—"}
                      status={!climate.hasClimate ? "—" : climate.humidity > 75 ? "High" : "Normal"}
                      icon={<Wind size={16} />}
                      isWarning={climate.hasClimate && climate.humidity > 75}
                    />
                    <StatItem
                      label="Soil Moisture"
                      value={climate.hasClimate ? `${climate.soilMoisture}%` : "—"}
                      status={
                        !climate.hasClimate
                          ? "—"
                          : climate.soilMoisture < 30
                            ? "Critical"
                            : climate.soilMoisture < 50
                              ? "Low"
                              : "Optimal"
                      }
                      icon={<Droplets size={16} />}
                      isWarning={climate.hasClimate && climate.soilMoisture < 50}
                    />
                    <StatItem
                      label="Mode"
                      value={climate.mode}
                      status={
                        climate.pumpState && climate.fanState
                          ? "Irrigation + ventilation"
                          : climate.pumpState
                            ? "Irrigation running"
                            : climate.fanState
                              ? "Ventilation open"
                              : "Idle"
                      }
                      icon={<Activity size={16} />}
                    />
                  </div>
                </div>

                {(climate.pumpState || climate.fanState) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {climate.pumpState && (
                      <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
                        <Droplets className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Automatic irrigation running</p>
                          <p className="text-xs text-muted-foreground">
                            Pump is open · soil {climate.hasClimate ? `${climate.soilMoisture}%` : "—"}
                          </p>
                        </div>
                      </div>
                    )}
                    {climate.fanState && (
                      <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
                        <Wind className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Automatic ventilation open</p>
                          <p className="text-xs text-muted-foreground">
                            Fans are running · {climate.hasClimate ? `${climate.temp.toFixed(1)}°C` : "—"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {quickActions.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="flex items-center justify-between rounded-2xl border border-border/50 bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{item.label}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>

                {snapshot && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <CropStatus crop={snapshot.crop} />
                    <DeviceStatus
                      devices={snapshot.devices}
                      sensors={snapshot.sensors}
                      houseStatus={snapshot.greenhouse.status}
                      irrigating={climate.pumpState}
                      ventilating={climate.fanState}
                    />
                  </div>
                )}

                {/* Sensor Grid */}
                <div>
                  <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                    Live Sensors
                  </h2>
                  <SensorGrid climate={climate} />
                </div>

                {snapshot && (
                  <AutomationFeed
                    events={snapshot.automationEvents}
                    activity={snapshot.activity}
                  />
                )}
              </>
            )}
            {activeTab === "controls" && (
              <ControlPanel
                data={climate}
                isConnected={isConnected}
                sendCommand={sendCommand}
                automationEvents={snapshot?.automationEvents}
                activity={snapshot?.activity}
              />
            )}
            {activeTab === "cameras" && (
              <CameraMonitoring
                greenhouse={snapshot?.greenhouse}
                cropName={snapshot?.crop?.name}
                irrigating={climate.pumpState}
                ventilating={climate.fanState}
              />
            )}
            {activeTab === "analytics" && (
              <Analytics
                climate={climate}
                isMqttConnected={isConnected}
                readings={snapshot?.readings}
                irrigationEvents={snapshot?.irrigationEvents}
                ventilationEvents={snapshot?.ventilationEvents}
                automationEvents={snapshot?.automationEvents}
                crop={snapshot?.crop}
                devices={snapshot?.devices}
                greenhouseStatus={snapshot?.greenhouse.status}
              />
            )}
            {activeTab === "alerts" && (
              <AlertCenter
                onUnreadChange={setUnreadAlertsCount}
                greenhouseAlerts={snapshot?.alerts}
                mqttData={mqttData}
                isMqttConnected={isConnected}
                hasFarmData={!!snapshot}
              />
            )}
          </div>
    </AppShell>
  );
}

function StatItem({
  label,
  value,
  status,
  isWarning = false,
  icon,
}: {
  label: string;
  value: string;
  status: string;
  icon: React.ReactNode;
  isWarning?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold tracking-tight tabular-nums text-foreground transition-all duration-700 sm:text-3xl">
        {value}
      </div>
      <div
        className={cn(
          "w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight",
          isWarning ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        )}
      >
        {status}
      </div>
    </div>
  );
}
