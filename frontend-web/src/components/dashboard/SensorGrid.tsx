import { Thermometer, Droplets, Sun, Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

interface SensorCardProps {
  title: string;
  value: string;
  unit: string;
  status: "optimal" | "warning" | "critical";
  icon: React.ReactNode;
  description: string;
  progress?: number;
  trend?: "up" | "down" | "stable";
}

const SensorCard = ({ title, value, unit, status, icon, description, progress }: SensorCardProps) => {
  const statusColors = {
    optimal: "text-success",
    warning: "text-warning", 
    critical: "text-destructive"
  };

  const statusBgColors = {
    optimal: "bg-success/10",
    warning: "bg-warning/10",
    critical: "bg-destructive/10"
  };

  return (
    <Card className="shadow-elegant border-0 transition-smooth hover:shadow-primary/20 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${statusBgColors[status]}`}>
              <div className={statusColors[status]}>
                {icon}
              </div>
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusBgColors[status]} ${statusColors[status]}`}>
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
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress}% of optimal range</p>
          </div>
        )}
        
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export const SensorGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SensorCard
        title="Temperature"
        value="24.5"
        unit="°C"
        status="optimal"
        icon={<Thermometer className="w-5 h-5" />}
        description="Perfect growing temperature"
        progress={85}
      />
      
      <SensorCard
        title="Humidity"
        value="68"
        unit="%"
        status="optimal"
        icon={<Droplets className="w-5 h-5" />}
        description="Ideal moisture levels"
        progress={78}
      />
      
      <SensorCard
        title="Soil Moisture"
        value="45"
        unit="%"
        status="warning"
        icon={<Gauge className="w-5 h-5" />}
        description="Below optimal - irrigation needed"
        progress={45}
      />
      
      <SensorCard
        title="Light Intensity"
        value="850"
        unit="PAR"
        status="optimal"
        icon={<Sun className="w-5 h-5" />}
        description="Excellent photosynthetic light"
        progress={92}
      />
    </div>
  );
};