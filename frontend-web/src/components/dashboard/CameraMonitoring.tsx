import { useState } from "react";
import { Camera, Play, Pause, RotateCcw, ZoomIn, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface CameraFeedProps {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  hasAI: boolean;
  detections?: string[];
  lastUpdate: string;
}

const CameraFeed = ({ id, name, location, isOnline, hasAI, detections = [], lastUpdate }: CameraFeedProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(hasAI);

  return (
    <Card className="shadow-elegant border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className={`w-5 h-5 ${isOnline ? 'text-success' : 'text-muted-foreground'}`} />
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription>{location}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success pulse-gentle' : 'bg-destructive'}`} />
            <span className="text-xs text-muted-foreground">
              {isOnline ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mock Camera Feed */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-green-600/20 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">
                {isOnline ? (isPlaying ? 'Live Feed' : 'Paused') : 'Camera Offline'}
              </p>
            </div>
          </div>
          
          {/* AI Detection Overlays */}
          {isOnline && aiEnabled && detections.length > 0 && (
            <div className="absolute top-2 left-2 space-y-1">
              {detections.map((detection, index) => (
                <Badge key={index} className="bg-warning text-warning-foreground">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {detection}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Camera Controls Overlay */}
          {isOnline && (
            <div className="absolute bottom-2 left-2 flex space-x-2">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-xs"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              <Button size="sm" variant="secondary" className="text-xs">
                <ZoomIn className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="secondary" className="text-xs">
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* AI Detection Control */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`ai-${id}`} className="text-sm font-medium">
            AI Pest Detection
          </Label>
          <Switch 
            id={`ai-${id}`}
            checked={aiEnabled} 
            onCheckedChange={setAiEnabled}
            disabled={!isOnline}
          />
        </div>

        {/* Status Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last update: {lastUpdate}</span>
          {aiEnabled && isOnline && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-success" />
              <span>AI Active</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const CameraMonitoring = () => {
  const cameras = [
    {
      id: "cam-01",
      name: "North Corner",
      location: "Section A - Tomatoes",
      isOnline: true,
      hasAI: true,
      detections: ["Aphids detected"],
      lastUpdate: "2 min ago"
    },
    {
      id: "cam-02", 
      name: "South Wall",
      location: "Section B - Peppers",
      isOnline: true,
      hasAI: true,
      detections: [],
      lastUpdate: "1 min ago"
    },
    {
      id: "cam-03",
      name: "Center Aisle",
      location: "Main Walkway",
      isOnline: false,
      hasAI: false,
      detections: [],
      lastUpdate: "15 min ago"
    },
    {
      id: "cam-04",
      name: "East Wing",
      location: "Section C - Lettuce",
      isOnline: true,
      hasAI: true,
      detections: ["Leaf spots detected"],
      lastUpdate: "30 sec ago"
    }
  ];

  const onlineCameras = cameras.filter(cam => cam.isOnline).length;
  const totalDetections = cameras.reduce((sum, cam) => sum + cam.detections.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Camera Monitoring</h2>
          <p className="text-muted-foreground">AI-powered pest and disease detection</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{onlineCameras}</div>
            <div className="text-xs text-muted-foreground">Cameras Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{totalDetections}</div>
            <div className="text-xs text-muted-foreground">Active Detections</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cameras.map((camera) => (
          <CameraFeed key={camera.id} {...camera} />
        ))}
      </div>
    </div>
  );
};