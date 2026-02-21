import { useState } from "react";
import { 
  Leaf, LayoutDashboard, Droplets, Wind, 
  Settings, LogOut, Camera, Bell, Activity 
} from "lucide-react";
import { cn } from "../lib/utils";
import { SensorGrid } from "../components/dashboard/SensorGrid";
import { ControlPanel } from "../components/dashboard/ControlPanel";
import { CameraMonitoring } from "../components/dashboard/CameraMonitoring";
import { AlertCenter } from "../components/dashboard/AlertCenter";
import { Button } from "../components/ui/button";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "controls", label: "Controls", icon: Droplets },
    { id: "cameras", label: "Live Sentry", icon: Camera },
    { id: "alerts", label: "Alert Center", icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── SIDEBAR ── */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-card/60 backdrop-blur-xl">
        <div className="flex h-full flex-col px-4 py-6">
          {/* Logo - Matches Landing.tsx Branding */}
          <div className="mb-10 flex items-center gap-2.5 px-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold tracking-wide text-foreground">
              GreenTech
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5">
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
          </nav>

          {/* Footer Actions */}
          <div className="mt-auto border-t border-border/40 pt-6">
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="ml-64 flex-1 p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              GreenTech OS: Monitoring Greenhouse Zone A
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
                <Bell size={18} className="text-muted-foreground" />
             </div>
             <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
                IJ
             </div>
          </div>
        </header>

        {/* Dynamic Content based on Sidebar Selection */}
        <div className="space-y-6 animate-in fade-in duration-500">
          {activeTab === "overview" && (
            <>
              {/* Hero Stats Card - Theme Reflected from Landing.tsx */}
              <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 shadow-xl">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                  <StatItem label="Temperature" value="24.5°C" status="Optimal" icon={<Activity size={14}/>} />
                  <StatItem label="Humidity" value="68%" status="Normal" icon={<Wind size={14}/>} />
                  <StatItem label="Soil Moisture" value="45%" status="Critical" isWarning icon={<Droplets size={14}/>} />
                  <StatItem label="Sentry Battery" value="98%" status="Charging" icon={<Leaf size={14}/>} />
                </div>
              </div>
              <SensorGrid />
            </>
          )}
          {activeTab === "controls" && <ControlPanel />}
          {activeTab === "cameras" && <CameraMonitoring />}
          {activeTab === "alerts" && <AlertCenter />}
        </div>
      </main>
    </div>
  );
}

// Reusable Stat Sub-component
function StatItem({ label, value, status, isWarning = false, icon }: any) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground font-medium">
        {icon} {label}
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className={cn(
        "text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full w-fit",
        isWarning ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
      )}>
        {status}
      </div>
    </div>
  );
}