import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Banknote,
  LayoutDashboard,
  Radio,
  Settings,
  Sprout,
  Users,
  Warehouse,
} from "lucide-react";
import { DropdownMenuItem } from "../components/ui/dropdown-menu";
import { LivePulse } from "../components/dashboard/LivePulse";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useAdminPlatform } from "../hooks/useAdminPlatform";
import { AdminMetrics } from "../components/admin/AdminMetrics";
import { FarmerTable } from "../components/admin/FarmerTable";
import { GreenhouseTable } from "../components/admin/GreenhouseTable";
import { DeviceTable } from "../components/admin/DeviceTable";
import { AdminAlerts } from "../components/admin/AdminAlerts";
import { ActivityTable } from "../components/admin/ActivityTable";
import { BenefitsPanel } from "../components/dashboard/BenefitsPanel";
import { AppShell } from "../components/layout/AppShell";
import { PageError, PageLoading } from "../components/layout/PageState";
import { FinanceDashboard } from "../components/admin/finance/FinanceDashboard";

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "revenue", label: "Revenue", icon: Banknote },
  { id: "farmers", label: "Farmers", icon: Users },
  { id: "greenhouses", label: "Greenhouses", icon: Warehouse },
  { id: "devices", label: "Devices", icon: Radio },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "activity", label: "Activity", icon: Activity },
];

export default function Admin() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, isAdmin } = useCurrentProfile();
  const { data, loading, error, reload } = useAdminPlatform(isAdmin);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateTime, setDateTime] = useState(new Date());
  const userName = profile?.full_name || localStorage.getItem("fullName") || "Admin";

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!profileLoading && !isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [profileLoading, isAdmin, navigate]);

  if (profileLoading || (!isAdmin && !profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <PageLoading label={profileLoading ? "Checking access…" : "Redirecting…"} />
      </div>
    );
  }

  const extraNav = (
    <>
      <Link to="/dashboard" className="block">
        <span className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground">
          <Sprout size={18} aria-hidden />
          Operations
        </span>
      </Link>
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
        <div className="flex flex-wrap items-center gap-3">
          <span>{activeTab === "revenue" ? "Financial operations" : "Platform operations"}</span>
          <LivePulse label="Live" active={!loading} />
        </div>
      }
      navItems={menuItems}
      activeId={activeTab}
      onNav={setActiveTab}
      extraNav={extraNav}
      userName={userName}
      userCaption="Administrator"
      headerExtra={
        <div className="hidden text-right sm:block">
          <div className="text-sm font-medium text-foreground">
            {dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="text-xs text-muted-foreground">
            {dateTime.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      }
      userMenu={
        <>
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="cursor-pointer gap-2">
              <Sprout className="h-4 w-4" />
              Operations
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="cursor-pointer gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </>
      }
    >
      {activeTab === "revenue" ? (
        <FinanceDashboard enabled={isAdmin} />
      ) : loading ? (
        <PageLoading label="Loading platform data…" />
      ) : error ? (
        <PageError description={error} onRetry={() => void reload()} />
      ) : (
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <AdminMetrics metrics={data.metrics} />
              <BenefitsPanel metrics={data.benefits} title="Fleet benefits" />
            </div>
          )}
          {activeTab === "farmers" && <FarmerTable rows={data.farmers} />}
          {activeTab === "greenhouses" && <GreenhouseTable rows={data.greenhouses} />}
          {activeTab === "devices" && <DeviceTable rows={data.devices} />}
          {activeTab === "alerts" && <AdminAlerts rows={data.alerts} onResolved={() => void reload()} />}
          {activeTab === "activity" && <ActivityTable rows={data.activity} />}
        </div>
      )}
    </AppShell>
  );
}
