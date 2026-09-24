import { Thermometer, Droplets, Sun, Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import type { FarmClimate } from "../../hooks/useFarmDashboard";

interface SensorCardProps {
  title: string;
  value: string | number;
  unit: string;
  status: "optimal" | "warning" | "critical";
  icon: React.ReactNode;
  description: string;
  progress?: number;
}

const SensorCard = ({ title, value, unit, status, icon, description, progress }: SensorCardProps) => {
  const statusColors = {
    optimal: "text-green-500",
    warning: "text-orange-500", 
    critical: "text-red-500"
  };

  const statusBgColors = {
    optimal: "bg-green-500/10",
    warning: "bg-orange-500/10",
    critical: "bg-red-500/10"
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${statusBgColors[status]}`}>
              <div className={statusColors[status]}>
                {icon}
              </div>
            </div>
            <CardTitle className="text-base font-display">{title}</CardTitle>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBgColors[status]} ${statusColors[status]}`}>
            {status}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold tabular-nums text-foreground transition-all duration-700">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        
        {progress !== undefined && (
          <div className="space-y-2">
            <Progress value={progress} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{progress}% of optimal range</p>
          </div>
        )}
        
        <CardDescription className="text-xs leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export const SensorGrid = ({ climate }: { climate: FarmClimate }) => {
  const getTempStatus = (t: number) => (t > 30 || t < 18 ? "warning" : "optimal");
  const getMoistureStatus = (m: number) => (m < 30 ? "critical" : m < 50 ? "warning" : "optimal");
  const hasData = climate.hasClimate;
  const lightValue = climate.lightPar;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
      <SensorCard
        title="Temperature"
        value={hasData ? climate.temp.toFixed(1) : "—"}
        unit="°C"
        status={hasData ? getTempStatus(climate.temp) : "optimal"}
        icon={<Thermometer size={18} />}
        description={hasData ? (climate.temp > 30 ? "High temp — fans active" : "Optimal growing climate") : "Waiting for sensor data"}
        progress={hasData ? Math.min((climate.temp / 40) * 100, 100) : 0}
      />
      
      <SensorCard
        title="Humidity"
        value={hasData ? climate.humidity.toFixed(1) : "—"}
        unit="%"
        status={hasData ? (climate.humidity > 75 ? "warning" : "optimal") : "optimal"}
        icon={<Droplets size={18} />}
        description="Air moisture levels"
        progress={hasData ? climate.humidity : 0}
      />
      
      <SensorCard
        title="Soil Moisture"
        value={hasData ? climate.soilMoisture : "—"}
        unit="%"
        status={hasData ? getMoistureStatus(climate.soilMoisture) : "optimal"}
        icon={<Gauge size={18} />}
        description={hasData ? (climate.soilMoisture < 30 ? "Irrigation required" : "Soil is well-hydrated") : "Waiting for sensor data"}
        progress={hasData ? climate.soilMoisture : 0}
      />
      
      <SensorCard
        title="Light Intensity"
        value={lightValue > 0 ? lightValue : "—"}
        unit="PAR"
        status={lightValue > 0 ? "optimal" : "warning"}
        icon={<Sun size={18} />}
        description={lightValue > 0 ? "Current solar exposure" : "Night or light sensor offline"}
        progress={lightValue > 0 ? Math.min((lightValue / 1100) * 100, 100) : 0}
      />
    </div>
  );
};