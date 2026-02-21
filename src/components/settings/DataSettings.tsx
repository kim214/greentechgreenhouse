import { useState } from "react";
import { Download, Upload, Trash2, Archive, Database, FileText, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export const DataSettings = () => {
  const { toast } = useToast();
  const [dataRetention, setDataRetention] = useState({
    sensors: "1-year",
    alerts: "6-months", 
    images: "3-months",
    logs: "1-month"
  });
  
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("weekly");
  const [exportFormat, setExportFormat] = useState("csv");
  const [includeImages, setIncludeImages] = useState(false);

  const storageData = {
    used: 2.4,
    total: 10,
    breakdown: {
      sensors: 1.2,
      images: 0.8,
      logs: 0.3,
      backups: 0.1
    }
  };

  const handleExportData = (dataType: string) => {
    toast({
      title: "Export Started",
      description: `${dataType} data export has been initiated. You'll receive a download link shortly.`,
    });
  };

  const handleDeleteData = (dataType: string) => {
    toast({
      title: "Data Deletion",
      description: `${dataType} deletion would require confirmation in a real implementation.`,
      variant: "destructive"
    });
  };

  const handleBackupNow = () => {
    toast({
      title: "Backup Started", 
      description: "Manual backup has been initiated and will complete in the background.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Management</h2>
          <p className="text-muted-foreground">Manage data retention, exports, and backups</p>
        </div>
      </div>

      {/* Storage Overview */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Storage Usage</span>
          </CardTitle>
          <CardDescription>Current data storage consumption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used Storage</span>
              <span>{storageData.used} GB of {storageData.total} GB</span>
            </div>
            <Progress value={(storageData.used / storageData.total) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-primary">{storageData.breakdown.sensors} GB</div>
              <div className="text-xs text-muted-foreground">Sensor Data</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-accent">{storageData.breakdown.images} GB</div>
              <div className="text-xs text-muted-foreground">Camera Images</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-warning">{storageData.breakdown.logs} GB</div>
              <div className="text-xs text-muted-foreground">System Logs</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-success">{storageData.breakdown.backups} GB</div>
              <div className="text-xs text-muted-foreground">Backups</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Archive className="w-5 h-5" />
            <span>Data Retention Policies</span>
          </CardTitle>
          <CardDescription>Configure how long different types of data are stored</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Sensor Data Retention</Label>
              <Select 
                value={dataRetention.sensors} 
                onValueChange={(value) => setDataRetention(prev => ({ ...prev, sensors: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                  <SelectItem value="2-years">2 Years</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alert History</Label>
              <Select 
                value={dataRetention.alerts} 
                onValueChange={(value) => setDataRetention(prev => ({ ...prev, alerts: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Camera Images</Label>
              <Select 
                value={dataRetention.images} 
                onValueChange={(value) => setDataRetention(prev => ({ ...prev, images: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>System Logs</Label>
              <Select 
                value={dataRetention.logs} 
                onValueChange={(value) => setDataRetention(prev => ({ ...prev, logs: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Data Export</span>
          </CardTitle>
          <CardDescription>Export your data for analysis or backup purposes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Include Images</Label>
                <p className="text-sm text-muted-foreground">Include camera images in export</p>
              </div>
              <Switch checked={includeImages} onCheckedChange={setIncludeImages} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => handleExportData("Sensor Data")} className="transition-smooth">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Sensor Data
            </Button>
            <Button variant="outline" onClick={() => handleExportData("Alert History")} className="transition-smooth">
              <FileText className="w-4 h-4 mr-2" />
              Export Alert History
            </Button>
            <Button variant="outline" onClick={() => handleExportData("System Logs")} className="transition-smooth">
              <Database className="w-4 h-4 mr-2" />
              Export System Logs
            </Button>
            <Button variant="outline" onClick={() => handleExportData("All Data")} className="transition-smooth">
              <Archive className="w-4 h-4 mr-2" />
              Export All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Archive className="w-5 h-5" />
            <span>Backup Configuration</span>
          </CardTitle>
          <CardDescription>Automated backup settings for data protection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">Enable scheduled automatic backups</p>
            </div>
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>

          {autoBackup && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Last Backup</span>
                  <span className="text-sm text-muted-foreground">2 days ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Backup</span>
                  <span className="text-sm text-muted-foreground">In 5 days</span>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleBackupNow} className="transition-smooth">
            <Upload className="w-4 h-4 mr-2" />
            Backup Now
          </Button>
        </CardContent>
      </Card>

      {/* Data Cleanup */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5" />
            <span>Data Cleanup</span>
          </CardTitle>
          <CardDescription>Remove old or unnecessary data to free up storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => handleDeleteData("Old Sensor Data")} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clean Old Sensor Data
            </Button>
            <Button variant="outline" onClick={() => handleDeleteData("Expired Images")} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Expired Images
            </Button>
            <Button variant="outline" onClick={() => handleDeleteData("System Logs")} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear System Logs
            </Button>
            <Button variant="outline" onClick={() => handleDeleteData("All Archived Data")} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Archived Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};