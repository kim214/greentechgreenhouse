import { useState } from "react";
import { Droplets, Fan, Sun, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ControlSystemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  hasManualControl?: boolean;
  intensity?: number;
  onIntensityChange?: (value: number[]) => void;
  autoMode?: boolean;
  onAutoModeChange?: (auto: boolean) => void;
}

const ControlSystem = ({ 
  title, 
  description, 
  icon, 
  isActive, 
  onToggle, 
  hasManualControl = false,
  intensity = 50,
  onIntensityChange,
  autoMode = true,
  onAutoModeChange
}: ControlSystemProps) => {
  return (
    <Card className="shadow-elegant border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Switch 
            checked={isActive} 
            onCheckedChange={onToggle}
            className="transition-smooth"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor={`auto-${title}`} className="text-sm font-medium">
            Auto Mode
          </Label>
          <Switch 
            id={`auto-${title}`}
            checked={autoMode} 
            onCheckedChange={onAutoModeChange}
            disabled={!isActive}
          />
        </div>
        
        {hasManualControl && !autoMode && isActive && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Manual Control</Label>
            <div className="space-y-2">
              <Slider
                value={[intensity]}
                onValueChange={onIntensityChange || (() => {})}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-medium">{intensity}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}
        
        <div className={`px-3 py-2 rounded-lg text-sm ${
          isActive 
            ? autoMode 
              ? 'bg-success/10 text-success' 
              : 'bg-accent/10 text-accent'
            : 'bg-muted text-muted-foreground'
        }`}>
          Status: {!isActive ? 'Offline' : autoMode ? 'Auto' : 'Manual'}
        </div>
      </CardContent>
    </Card>
  );
};

export const ControlPanel = () => {
  const { toast } = useToast();
  const [systems, setSystems] = useState({
    irrigation: { active: true, auto: true, intensity: 75 },
    ventilation: { active: true, auto: true, intensity: 60 },
    lighting: { active: false, auto: false, intensity: 85 },
    heating: { active: true, auto: true, intensity: 40 }
  });

  const updateSystem = (systemKey: keyof typeof systems, updates: Partial<typeof systems.irrigation>) => {
    setSystems(prev => ({
      ...prev,
      [systemKey]: { ...prev[systemKey], ...updates }
    }));
    
    toast({
      title: "System Updated",
      description: `${systemKey.charAt(0).toUpperCase() + systemKey.slice(1)} system has been updated.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Control Panel</h2>
          <p className="text-muted-foreground">Manage your greenhouse systems</p>
        </div>
        <Button variant="outline" className="transition-smooth">
          <Zap className="w-4 h-4 mr-2" />
          Emergency Stop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ControlSystem
          title="Irrigation System"
          description="Automated watering based on soil moisture"
          icon={<Droplets className="w-5 h-5" />}
          isActive={systems.irrigation.active}
          onToggle={(active) => updateSystem('irrigation', { active })}
          hasManualControl={true}
          intensity={systems.irrigation.intensity}
          onIntensityChange={(value) => updateSystem('irrigation', { intensity: value[0] })}
          autoMode={systems.irrigation.auto}
          onAutoModeChange={(auto) => updateSystem('irrigation', { auto })}
        />

        <ControlSystem
          title="Ventilation"
          description="Climate control and air circulation"
          icon={<Fan className="w-5 h-5" />}
          isActive={systems.ventilation.active}
          onToggle={(active) => updateSystem('ventilation', { active })}
          hasManualControl={true}
          intensity={systems.ventilation.intensity}
          onIntensityChange={(value) => updateSystem('ventilation', { intensity: value[0] })}
          autoMode={systems.ventilation.auto}
          onAutoModeChange={(auto) => updateSystem('ventilation', { auto })}
        />

        <ControlSystem
          title="LED Grow Lights"
          description="Supplemental lighting control"
          icon={<Sun className="w-5 h-5" />}
          isActive={systems.lighting.active}
          onToggle={(active) => updateSystem('lighting', { active })}
          hasManualControl={true}
          intensity={systems.lighting.intensity}
          onIntensityChange={(value) => updateSystem('lighting', { intensity: value[0] })}
          autoMode={systems.lighting.auto}
          onAutoModeChange={(auto) => updateSystem('lighting', { auto })}
        />

        <ControlSystem
          title="Heating System"
          description="Temperature regulation"
          icon={<Zap className="w-5 h-5" />}
          isActive={systems.heating.active}
          onToggle={(active) => updateSystem('heating', { active })}
          hasManualControl={true}
          intensity={systems.heating.intensity}
          onIntensityChange={(value) => updateSystem('heating', { intensity: value[0] })}
          autoMode={systems.heating.auto}
          onAutoModeChange={(auto) => updateSystem('heating', { auto })}
        />
      </div>
    </div>
  );
};