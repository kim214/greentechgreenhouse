import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsNavigation } from "@/components/settings/SettingsNavigation";
import { SystemConfiguration } from "@/components/settings/SystemConfiguration";
import { UserProfile } from "@/components/settings/UserProfile";
import { DeviceManagement } from "@/components/settings/DeviceManagement";
import { AutomationRules } from "@/components/settings/AutomationRules";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { DataSettings } from "@/components/settings/DataSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { Link } from "react-router-dom";

type SettingsSection = 
  | "system" 
  | "profile" 
  | "devices" 
  | "automation" 
  | "notifications" 
  | "data" 
  | "security";

const Settings = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>("system");

  const renderSettingsContent = () => {
    switch (activeSection) {
      case "system":
        return <SystemConfiguration />;
      case "profile":
        return <UserProfile />;
      case "devices":
        return <DeviceManagement />;
      case "automation":
        return <AutomationRules />;
      case "notifications":
        return <NotificationSettings />;
      case "data":
        return <DataSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <SystemConfiguration />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="transition-smooth">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Configure your greenhouse monitoring system</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <SettingsNavigation 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;