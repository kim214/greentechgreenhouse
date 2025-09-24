import { useState } from "react";
import { Plus, Wifi, WifiOff, Settings, Trash2, Camera, Thermometer, Droplets, Sun, Gauge, Battery } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Device {
  id: string;
  name: string;
  type: "sensor" | "camera" | "controller";
  sensorType?: "temperature" | "humidity" | "soil_moisture" | "light";
  status: "online" | "offline" | "maintenance";
  location: string;
  lastSeen: string;
  batteryLevel?: number;
  firmware: string;
  ipAddress?: string;
}

const DeviceCard = ({ device, onEdit, onDelete }: { 
  device: Device; 
  onEdit: (device: Device) => void;
  onDelete: (deviceId: string) => void;
}) => {
  const getDeviceIcon = () => {
    if (device.type === "camera") return <Camera className="w-5 h-5" />;
    if (device.sensorType === "temperature") return <Thermometer className="w-5 h-5" />;
    if (device.sensorType === "humidity") return <Droplets className="w-5 h-5" />;
    if (device.sensorType === "soil_moisture") return <Gauge className="w-5 h-5" />;
    if (device.sensorType === "light") return <Sun className="w-5 h-5" />;
    return <Settings className="w-5 h-5" />;
  };

  const getStatusColor = () => {
    switch (device.status) {
      case "online": return "status-online";
      case "offline": return "status-offline";
      case "maintenance": return "status-warning";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="shadow-elegant border-0 transition-sm hover:shadow-primary/20 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${device.status === 'online' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
              {getDeviceIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">{device.name}</CardTitle>
              <CardDescription>{device.location}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {device.status === "online" ? 
              <Wifi className="w-4 h-4 text-success" /> : 
              <WifiOff className="w-4 h-4 text-destructive" />
            }
            <Badge className={`${getStatusColor()} text-xs`}>
              {device.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Type:</span>
            <p className="font-medium capitalize">{device.type}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Last Seen:</span>
            <p className="font-medium">{device.lastSeen}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Firmware:</span>
            <p className="font-medium">{device.firmware}</p>
          </div>
          {device.batteryLevel && (
            <div>
              <span className="text-muted-foreground">Battery:</span>
              <div className="flex items-center space-x-2">
                <Battery className="w-4 h-4" />
                <span className="font-medium">{device.batteryLevel}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(device)} className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(device.id)} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const DeviceManagement = () => {
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "temp-01",
      name: "Temperature Sensor A1",
      type: "sensor",
      sensorType: "temperature",
      status: "online",
      location: "Section A - North Corner",
      lastSeen: "2 min ago",
      batteryLevel: 85,
      firmware: "v2.1.3",
    },
    {
      id: "humid-01",
      name: "Humidity Sensor A1", 
      type: "sensor",
      sensorType: "humidity",
      status: "online",
      location: "Section A - Center",
      lastSeen: "1 min ago",
      batteryLevel: 92,
      firmware: "v2.1.3",
    },
    {
      id: "soil-01",
      name: "Soil Moisture Sensor B1",
      type: "sensor", 
      sensorType: "soil_moisture",
      status: "maintenance",
      location: "Section B - Row 3",
      lastSeen: "15 min ago",
      batteryLevel: 45,
      firmware: "v2.0.8",
    },
    {
      id: "cam-01",
      name: "Security Camera North",
      type: "camera",
      status: "online",
      location: "North Wall",
      lastSeen: "30 sec ago",
      firmware: "v1.4.2",
      ipAddress: "192.168.1.101"
    }
  ]);

  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const handleAddDevice = () => {
    toast({
      title: "Add Device",
      description: "Device discovery and pairing wizard would open here.",
    });
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    toast({
      title: "Device Removed",
      description: "Device has been removed from your system.",
    });
  };

  const handleSaveDevice = () => {
    if (editingDevice) {
      setDevices(prev => prev.map(d => d.id === editingDevice.id ? editingDevice : d));
      setEditingDevice(null);
      toast({
        title: "Device Updated",
        description: "Device configuration has been saved.",
      });
    }
  };

  const onlineDevices = devices.filter(d => d.status === "online").length;
  const maintenanceDevices = devices.filter(d => d.status === "maintenance").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Device Management</h2>
          <p className="text-muted-foreground">Monitor and configure your connected sensors and cameras</p>
        </div>
        <Button onClick={handleAddDevice} className="transition-smooth">
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Device Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-elegant border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{devices.length}</div>
              <div className="text-sm text-muted-foreground">Total Devices</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-elegant border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{onlineDevices}</div>
              <div className="text-sm text-muted-foreground">Online</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-elegant border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{maintenanceDevices}</div>
              <div className="text-sm text-muted-foreground">Maintenance</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-elegant border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{devices.filter(d => d.status === "offline").length}</div>
              <div className="text-sm text-muted-foreground">Offline</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <DeviceCard 
            key={device.id} 
            device={device} 
            onEdit={handleEditDevice}
            onDelete={handleDeleteDevice}
          />
        ))}
      </div>

      {/* Device Configuration Dialog */}
      <Dialog open={!!editingDevice} onOpenChange={() => setEditingDevice(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Device</DialogTitle>
            <DialogDescription>
              Update device settings and configuration
            </DialogDescription>
          </DialogHeader>
          
          {editingDevice && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  value={editingDevice.name}
                  onChange={(e) => setEditingDevice(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-location">Location</Label>
                <Input
                  id="device-location"
                  value={editingDevice.location}
                  onChange={(e) => setEditingDevice(prev => prev ? { ...prev, location: e.target.value } : null)}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={editingDevice.status} 
                  onValueChange={(value: "online" | "offline" | "maintenance") => 
                    setEditingDevice(prev => prev ? { ...prev, status: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingDevice(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveDevice} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};