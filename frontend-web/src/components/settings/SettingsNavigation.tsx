import {
  Settings,
  User,
  Cpu,
  Zap,
  Bell,
  Database,
  Shield,
  Wifi,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SettingsSection =
  | "connection"
  | "system"
  | "profile"
  | "devices"
  | "automation"
  | "notifications"
  | "data"
  | "security";

interface SettingsNavigationProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

const navigationItems = [
  {
    id: "connection" as SettingsSection,
    label: "Connection",
    description: "MQTT broker & ESP32",
    icon: Wifi,
  },
  {
    id: "system" as SettingsSection,
    label: "System Configuration",
    description: "Sensor thresholds & alerts",
    icon: Settings,
  },
  {
    id: "profile" as SettingsSection,
    label: "User Profile",
    description: "Account & personal settings",
    icon: User,
  },
  {
    id: "devices" as SettingsSection,
    label: "Device Management",
    description: "Sensors, cameras & hardware",
    icon: Cpu,
  },
  {
    id: "automation" as SettingsSection,
    label: "Automation Rules",
    description: "Custom schedules & triggers",
    icon: Zap,
  },
  {
    id: "notifications" as SettingsSection,
    label: "Notifications",
    description: "Alerts & communication",
    icon: Bell,
  },
  {
    id: "data" as SettingsSection,
    label: "Data Management",
    description: "Export & retention settings",
    icon: Database,
  },
  {
    id: "security" as SettingsSection,
    label: "Security & Access",
    description: "Permissions & API keys",
    icon: Shield,
  },
];

export const SettingsNavigation = ({ activeSection, onSectionChange }: SettingsNavigationProps) => {
  return (
    <Card className="shadow-elegant border-0">
      <CardContent className="p-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start h-auto p-3 transition-smooth ${
                  isActive ? "bg-primary/10 text-primary border-primary/20" : ""
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <div className="flex items-center w-full">
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-primary ml-2" />
                  )}
                </div>
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};