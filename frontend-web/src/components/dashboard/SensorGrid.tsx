import { Thermometer, Droplets, Sun, Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { useMqtt } from "../../hooks/useMqtt"; //

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
          <span className="text-3xl font-bold text-foreground">{value}</span>
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

export const SensorGrid = () => {
  const { data } = useMqtt(); // Access real-time ESP32 data

  // Dynamic Logic for status and descriptions
  const getTempStatus = (t: number) => (t > 30 || t < 18 ? "warning" : "optimal");
  const getMoistureStatus = (m: number) => (m < 30 ? "critical" : m < 50 ? "warning" : "optimal");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
      <SensorCard
        title="Temperature"
        value={data.temp.toFixed(1)} // From greenhouse/temperature
        unit="°C"
        status={getTempStatus(data.temp)}
        icon={<Thermometer size={18} />}
        description={data.temp > 30 ? "High temp detected - fans active" : "Optimal growing climate"}
        progress={Math.min((data.temp / 40) * 100, 100)}
      />
      
      <SensorCard
        title="Humidity"
        value={data.humidity.toFixed(1)} // From greenhouse/humidity
        unit="%"
        status={data.humidity > 75 ? "warning" : "optimal"}
        icon={<Droplets size={18} />}
        description="Air moisture levels"
        progress={data.humidity}
      />
      
      <SensorCard
        title="Soil Moisture"
        value={data.soilMoisture} // From greenhouse/soilMoisturePercent
        unit="%"
        status={getMoistureStatus(data.soilMoisture)}
        icon={<Gauge size={18} />}
        description={data.soilMoisture < 30 ? "Irrigation required" : "Soil is well-hydrated"}
        progress={data.soilMoisture}
      />
      
      <SensorCard
        title="Light Intensity"
        value="850" // Placeholder until ESP32 sends PAR light data
        unit="PAR"
        status="optimal"
        icon={<Sun size={18} />}
        description="Daily solar exposure"
        progress={92}
      />
    </div>
  );
};