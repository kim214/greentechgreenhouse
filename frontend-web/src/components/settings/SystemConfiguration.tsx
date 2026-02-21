import { useState } from "react";
import { Save, RotateCcw, Thermometer, Droplets, Sun, Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ThresholdSettings {
  temperature: { min: number; max: number; critical: number };
  humidity: { min: number; max: number; critical: number };
  soilMoisture: { min: number; max: number; critical: number };
  lightIntensity: { min: number; max: number; critical: number };
}

export const SystemConfiguration = () => {
  const { toast } = useToast();
  const [autoMode, setAutoMode] = useState(true);
  const [emergencyShutdown, setEmergencyShutdown] = useState(false);
  const [dataLogging, setDataLogging] = useState(true);
  const [sensorUpdateInterval, setSensorUpdateInterval] = useState([30]);
  const [thresholds, setThresholds] = useState<ThresholdSettings>({
    temperature: { min: 18, max: 28, critical: 35 },
    humidity: { min: 40, max: 80, critical: 90 },
    soilMoisture: { min: 30, max: 70, critical: 20 },
    lightIntensity: { min: 200, max: 1000, critical: 50 }
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "System configuration has been updated successfully.",
    });
  };

  const handleReset = () => {
    setThresholds({
      temperature: { min: 18, max: 28, critical: 35 },
      humidity: { min: 40, max: 80, critical: 90 },
      soilMoisture: { min: 30, max: 70, critical: 20 },
      lightIntensity: { min: 200, max: 1000, critical: 50 }
    });
    setSensorUpdateInterval([30]);
    setAutoMode(true);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to default values.",
    });
  };

  const updateThreshold = (sensor: keyof ThresholdSettings, type: keyof ThresholdSettings['temperature'], value: number) => {
    setThresholds(prev => ({
      ...prev,
      [sensor]: { ...prev[sensor], [type]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">System Configuration</h2>
          <p className="text-muted-foreground">Configure sensor thresholds and system behavior</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset} className="transition-smooth">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="transition-smooth">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* General System Settings */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Core system behavior configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Automatic Mode</Label>
                <p className="text-sm text-muted-foreground">Enable AI-driven automation</p>
              </div>
              <Switch checked={autoMode} onCheckedChange={setAutoMode} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Data Logging</Label>
                <p className="text-sm text-muted-foreground">Record sensor data history</p>
              </div>
              <Switch checked={dataLogging} onCheckedChange={setDataLogging} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Emergency Shutdown</Label>
                <p className="text-sm text-muted-foreground">Enable safety shutdowns</p>
              </div>
              <Switch checked={emergencyShutdown} onCheckedChange={setEmergencyShutdown} />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Update Frequency</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Every 5 seconds</SelectItem>
                  <SelectItem value="15">Every 15 seconds</SelectItem>
                  <SelectItem value="30">Every 30 seconds</SelectItem>
                  <SelectItem value="60">Every minute</SelectItem>
                  <SelectItem value="300">Every 5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Sensor Update Interval: {sensorUpdateInterval[0]}s</Label>
            <Slider
              value={sensorUpdateInterval}
              onValueChange={setSensorUpdateInterval}
              max={300}
              min={5}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5s (Real-time)</span>
              <span>300s (Battery saving)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensor Thresholds */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle>Sensor Thresholds</CardTitle>
          <CardDescription>Configure alert and automation triggers for each sensor type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Temperature */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold">Temperature (°C)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temp-min">Minimum (Alert)</Label>
                <Input
                  id="temp-min"
                  type="number"
                  value={thresholds.temperature.min}
                  onChange={(e) => updateThreshold('temperature', 'min', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp-max">Maximum (Alert)</Label>
                <Input
                  id="temp-max"
                  type="number"
                  value={thresholds.temperature.max}
                  onChange={(e) => updateThreshold('temperature', 'max', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp-critical">Critical (Emergency)</Label>
                <Input
                  id="temp-critical"
                  type="number"
                  value={thresholds.temperature.critical}
                  onChange={(e) => updateThreshold('temperature', 'critical', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold">Humidity (%)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="humidity-min">Minimum (Alert)</Label>
                <Input
                  id="humidity-min"
                  type="number"
                  value={thresholds.humidity.min}
                  onChange={(e) => updateThreshold('humidity', 'min', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity-max">Maximum (Alert)</Label>
                <Input
                  id="humidity-max"
                  type="number"
                  value={thresholds.humidity.max}
                  onChange={(e) => updateThreshold('humidity', 'max', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity-critical">Critical (Emergency)</Label>
                <Input
                  id="humidity-critical"
                  type="number"
                  value={thresholds.humidity.critical}
                  onChange={(e) => updateThreshold('humidity', 'critical', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Soil Moisture */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold">Soil Moisture (%)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soil-min">Minimum (Alert)</Label>
                <Input
                  id="soil-min"
                  type="number"
                  value={thresholds.soilMoisture.min}
                  onChange={(e) => updateThreshold('soilMoisture', 'min', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soil-max">Maximum (Alert)</Label>
                <Input
                  id="soil-max"
                  type="number"
                  value={thresholds.soilMoisture.max}
                  onChange={(e) => updateThreshold('soilMoisture', 'max', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soil-critical">Critical (Emergency)</Label>
                <Input
                  id="soil-critical"
                  type="number"
                  value={thresholds.soilMoisture.critical}
                  onChange={(e) => updateThreshold('soilMoisture', 'critical', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Light Intensity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sun className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold">Light Intensity (PAR)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="light-min">Minimum (Alert)</Label>
                <Input
                  id="light-min"
                  type="number"
                  value={thresholds.lightIntensity.min}
                  onChange={(e) => updateThreshold('lightIntensity', 'min', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="light-max">Maximum (Alert)</Label>
                <Input
                  id="light-max"
                  type="number"
                  value={thresholds.lightIntensity.max}
                  onChange={(e) => updateThreshold('lightIntensity', 'max', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="light-critical">Critical (Emergency)</Label>
                <Input
                  id="light-critical"
                  type="number"
                  value={thresholds.lightIntensity.critical}
                  onChange={(e) => updateThreshold('lightIntensity', 'critical', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};