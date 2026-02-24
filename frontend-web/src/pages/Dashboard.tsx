import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  LayoutDashboard,
  Droplets,
  Wind,
  Settings,
  LogOut,
  Camera,
  Bell,
  Activity,
  Wifi,
  WifiOff,
  ChevronDown,
  User,
  Zap,
  Thermometer,
  Gauge,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { cn } from "../lib/utils";
import { SensorGrid } from "../components/dashboard/SensorGrid";
import { ControlPanel } from "../components/dashboard/ControlPanel";
import { CameraMonitoring } from "../components/dashboard/CameraMonitoring";
import { AlertCenter } from "../components/dashboard/AlertCenter";
import { Analytics } from "../components/dashboard/Analytics";
import { useMqtt } from "../hooks/useMqtt";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import { ThemeToggle } from "../components/theme/ThemeToggle";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: mqttData, isConnected } = useMqtt();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateTime, setDateTime] = useState(new Date());
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

  return (
    <div className="flex min-h-screen bg-background text-foreground dark-glow-bg">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border/40 bg-card/80 backdrop-blur-xl">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 px-6 py-6 transition-opacity hover:opacity-90"
        >
          <img
            src="/greentech-logo.png"
            alt="GreenTech"
            className="h-7 w-7 object-contain"
          />
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            GreenTech
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}

          <Link to="/settings" className="block">
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Settings size={18} />
              Settings
            </button>
          </Link>
        </nav>

        {/* Footer */}
        <div className="border-t border-border/40 px-3 py-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              localStorage.removeItem("userLoggedIn");
              localStorage.removeItem("fullName");
              localStorage.removeItem("userId");
              navigate("/");
            }}
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-background/95 px-8 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {menuItems.find((i) => i.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              GreenTech OS · Zone A
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Date & Time */}
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-foreground">
                {dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              <div className="text-xs text-muted-foreground">
                {dateTime.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>

            {/* Theme: Light / Dark (Grow) */}
            <ThemeToggle />

            {/* Alerts */}
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-xl"
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

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 font-semibold text-primary">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
                    {userName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs font-normal text-muted-foreground">GreenTech Account</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => {
                    localStorage.removeItem("userLoggedIn");
                    localStorage.removeItem("fullName");
                    localStorage.removeItem("userId");
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <div className="space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Connection Status */}
                <div
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3",
                    isConnected
                      ? "border-primary/20 bg-primary/5"
                      : "border-muted bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <Wifi className="h-5 w-5 text-primary" />
                    ) : (
                      <WifiOff className="h-5 w-5 animate-pulse text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      isConnected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {isConnected ? "Live — ESP32 connected" : "Connecting to ESP32…"}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/settings" className="gap-2 text-xs">
                      Connection settings
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                {/* Hero Stats */}
                <div className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-lg">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatItem
                      label="Temperature"
                      value={`${mqttData.temp.toFixed(1)}°C`}
                      status={mqttData.temp > 30 || mqttData.temp < 18 ? "Warning" : "Optimal"}
                      icon={<Thermometer size={16} />}
                      isWarning={mqttData.temp > 30 || mqttData.temp < 18}
                    />
                    <StatItem
                      label="Humidity"
                      value={`${mqttData.humidity.toFixed(0)}%`}
                      status={mqttData.humidity > 75 ? "High" : "Normal"}
                      icon={<Wind size={16} />}
                      isWarning={mqttData.humidity > 75}
                    />
                    <StatItem
                      label="Soil Moisture"
                      value={`${mqttData.soilMoisture}%`}
                      status={
                        mqttData.soilMoisture < 30
                          ? "Critical"
                          : mqttData.soilMoisture < 50
                            ? "Low"
                            : "Optimal"
                      }
                      icon={<Droplets size={16} />}
                      isWarning={mqttData.soilMoisture < 50}
                    />
                    <StatItem
                      label="Mode"
                      value={mqttData.mode}
                      status={mqttData.fanState || mqttData.pumpState ? "Active" : "Idle"}
                      icon={<Activity size={16} />}
                    />
                  </div>
                </div>

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

                {/* Sensor Grid */}
                <div>
                  <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                    Live Sensors
                  </h2>
                  <SensorGrid />
                </div>
              </>
            )}
            {activeTab === "controls" && <ControlPanel />}
            {activeTab === "cameras" && <CameraMonitoring />}
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "alerts" && <AlertCenter onUnreadChange={setUnreadAlertsCount} />}
          </div>
        </div>
      </main>
    </div>
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
      <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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
