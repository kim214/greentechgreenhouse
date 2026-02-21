import { useState } from "react";
import { Droplets, Fan, Sun, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { useMqtt } from "../../hooks/useMqtt";
import { cn } from "../../lib/utils";

// ── SUB-COMPONENT: INDIVIDUAL SYSTEM CARD ──
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
  title, description, icon, isActive, onToggle, 
  hasManualControl, intensity, onIntensityChange, 
  autoMode, onAutoModeChange 
}: ControlSystemProps) => (
  <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "p-2 rounded-xl transition-colors",
            isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
          <div>
            <CardTitle className="text-base font-display">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
        <Switch checked={isActive} onCheckedChange={onToggle} />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Auto-Optimization</Label>
        <Switch checked={autoMode} onCheckedChange={onAutoModeChange} disabled={!isActive} />
      </div>
      
      {hasManualControl && !autoMode && isActive && (
        <div className="space-y-3 pt-2">
          <div className="flex justify-between text-xs font-medium">
            <Label>Intensity</Label>
            <span className="text-primary">{intensity}%</span>
          </div>
          <Slider value={[intensity || 0]} onValueChange={onIntensityChange} max={100} step={1} />
        </div>
      )}
      
      <div className={cn(
        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest w-fit",
        isActive ? (autoMode ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-500") : "bg-muted text-muted-foreground"
      )}>
        Status: {!isActive ? 'Offline' : autoMode ? 'GreenTech AI Active' : 'Manual Override'}
      </div>
    </CardContent>
  </Card>
);

// ── MAIN COMPONENT ──
export const ControlPanel = () => {
  const { sendCommand } = useMqtt();
  const { toast } = useToast();
  
  const [systems, setSystems] = useState({
    irrigation: { active: true, auto: true, intensity: 75 },
    ventilation: { active: true, auto: true, intensity: 60 },
    lighting: { active: false, auto: false, intensity: 85 },
    heating: { active: true, auto: true, intensity: 40 }
  });

  const updateSystem = (systemKey: keyof typeof systems, updates: Partial<typeof systems['irrigation']>) => {
    const updatedSystem = { ...systems[systemKey], ...updates };
    
    setSystems(prev => ({ ...prev, [systemKey]: updatedSystem }));

    // MQTT BROADCAST: Matching ESP32 Logic
    if (updates.auto !== undefined) {
      sendCommand("greenhouse/mode", updates.auto ? "AUTO" : "MANUAL");
    }

    if (systemKey === 'irrigation' && updates.active !== undefined) {
      sendCommand("greenhouse/irrigation", updates.active ? "ON" : "OFF");
    }

    if (systemKey === 'ventilation' && updates.active !== undefined) {
      sendCommand("greenhouse/ventilation", updates.active ? "OPEN" : "CLOSE");
    }

    toast({
      title: "Command Synchronized",
      description: `${systemKey} updated on GreenTech OS.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">GreenTech Autonomy</h2>
        <Button variant="destructive" size="sm" className="rounded-full px-6 uppercase text-[10px] font-bold tracking-widest" onClick={() => {
            sendCommand("greenhouse/mode", "MANUAL");
            sendCommand("greenhouse/irrigation", "OFF");
            sendCommand("greenhouse/ventilation", "CLOSE");
        }}>
          <Zap className="w-3 h-3 mr-2" /> Emergency Stop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ControlSystem
          title="Irrigation"
          description="Soil-moisture feedback loop"
          icon={<Droplets size={18} />}
          isActive={systems.irrigation.active}
          onToggle={(active) => updateSystem('irrigation', { active })}
          hasManualControl={true}
          intensity={systems.irrigation.intensity}
          onIntensityChange={(val) => updateSystem('irrigation', { intensity: val[0] })}
          autoMode={systems.irrigation.auto}
          onAutoModeChange={(auto) => updateSystem('irrigation', { auto })}
        />

        <ControlSystem
          title="Ventilation"
          description="CO2 and temperature regulation"
          icon={<Fan size={18} />}
          isActive={systems.ventilation.active}
          onToggle={(active) => updateSystem('ventilation', { active })}
          hasManualControl={true}
          intensity={systems.ventilation.intensity}
          onIntensityChange={(val) => updateSystem('ventilation', { intensity: val[0] })}
          autoMode={systems.ventilation.auto}
          onAutoModeChange={(auto) => updateSystem('ventilation', { auto })}
        />

        <ControlSystem
          title="Sentry Lighting"
          description="Supplemental PAR light spectrum"
          icon={<Sun size={18} />}
          isActive={systems.lighting.active}
          onToggle={(active) => updateSystem('lighting', { active })}
          hasManualControl={true}
          intensity={systems.lighting.intensity}
          onIntensityChange={(val) => updateSystem('lighting', { intensity: val[0] })}
          autoMode={systems.lighting.auto}
          onAutoModeChange={(auto) => updateSystem('lighting', { auto })}
        />

        <ControlSystem
          title="Climate Heating"
          description="Thermal consistency management"
          icon={<Zap size={18} />}
          isActive={systems.heating.active}
          onToggle={(active) => updateSystem('heating', { active })}
          hasManualControl={true}
          intensity={systems.heating.intensity}
          onIntensityChange={(val) => updateSystem('heating', { intensity: val[0] })}
          autoMode={systems.heating.auto}
          onAutoModeChange={(auto) => updateSystem('heating', { auto })}
        />
      </div>
    </div>
  );
};