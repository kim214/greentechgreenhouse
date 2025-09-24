import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SensorGrid } from "@/components/dashboard/SensorGrid";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { CameraMonitoring } from "@/components/dashboard/CameraMonitoring";
import { AlertCenter } from "@/components/dashboard/AlertCenter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { toast } = useToast();
  const [activeAlerts] = useState(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      <DashboardHeader alertCount={activeAlerts} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Stats Overview */}
        <div className="gradient-hero rounded-2xl p-8 text-white shadow-elegant">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">24.5°C</div>
              <div className="text-white/80">Temperature</div>
              <div className="text-sm text-white/60 mt-1">Optimal</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">68%</div>
              <div className="text-white/80">Humidity</div>
              <div className="text-sm text-white/60 mt-1">Normal</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">45%</div>
              <div className="text-white/80">Soil Moisture</div>
              <div className="text-sm text-warning-foreground font-medium mt-1">Low</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">850</div>
              <div className="text-white/80">Light (PAR)</div>
              <div className="text-sm text-white/60 mt-1">Good</div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card shadow-elegant">
            <TabsTrigger value="overview" className="transition-smooth">Overview</TabsTrigger>
            <TabsTrigger value="controls" className="transition-smooth">Controls</TabsTrigger>
            <TabsTrigger value="cameras" className="transition-smooth">Cameras</TabsTrigger>
            <TabsTrigger value="alerts" className="transition-smooth">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SensorGrid />
            
            <Card className="shadow-elegant border-0">
              <CardHeader>
                <CardTitle className="text-primary">System Status</CardTitle>
                <CardDescription>
                  All systems operational. Last updated 2 minutes ago.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full status-online pulse-gentle"></div>
                    <span className="font-medium">Irrigation System</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full status-online pulse-gentle"></div>
                    <span className="font-medium">Ventilation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full status-warning pulse-gentle"></div>
                    <span className="font-medium">Lighting Control</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls">
            <ControlPanel />
          </TabsContent>

          <TabsContent value="cameras">
            <CameraMonitoring />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertCenter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;