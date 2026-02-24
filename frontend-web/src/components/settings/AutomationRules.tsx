import { useState } from "react";
import { Plus, Play, Pause, Edit, Trash2, Clock, Thermometer, Droplets, Sun, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { useToast } from "../../components/ui/use-toast";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: {
    type: "sensor" | "time" | "manual";
    sensor?: string;
    condition?: "above" | "below" | "equals";
    value?: number;
    time?: string;
  };
  action: {
    type: "irrigation" | "ventilation" | "lighting" | "heating" | "notification";
    duration?: number;
    intensity?: number;
  };
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  lastTriggered?: string;
  triggerCount: number;
}

const RuleCard = ({ rule, onToggle, onEdit, onDelete }: {
  rule: AutomationRule;
  onToggle: (ruleId: string, active: boolean) => void;
  onEdit: (rule: AutomationRule) => void;
  onDelete: (ruleId: string) => void;
}) => {
  const getTriggerIcon = () => {
    if (rule.trigger.type === "time") return <Clock className="w-4 h-4" />;
    if (rule.trigger.sensor === "temperature") return <Thermometer className="w-4 h-4" />;
    if (rule.trigger.sensor === "humidity") return <Droplets className="w-4 h-4" />;
    if (rule.trigger.sensor === "light") return <Sun className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getActionIcon = () => {
    switch (rule.action.type) {
      case "irrigation": return <Droplets className="w-4 h-4" />;
      case "ventilation": return <Zap className="w-4 h-4" />;
      case "lighting": return <Sun className="w-4 h-4" />;
      case "heating": return <Thermometer className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <Card className="shadow-elegant border-0 transition-smooth hover:shadow-primary/20 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
              {rule.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </div>
            <div>
              <CardTitle className="text-lg">{rule.name}</CardTitle>
              <CardDescription>{rule.description}</CardDescription>
            </div>
          </div>
          <Switch 
            checked={rule.isActive} 
            onCheckedChange={(checked) => onToggle(rule.id, checked)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm">
              {getTriggerIcon()}
              <span className="text-muted-foreground">Trigger:</span>
              <Badge variant="outline" className="text-xs">
                {rule.trigger.type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm">
              {getActionIcon()}
              <span className="text-muted-foreground">Action:</span>
              <Badge variant="outline" className="text-xs">
                {rule.action.type}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Last Triggered:</span>
            <p className="font-medium">{rule.lastTriggered || "Never"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Trigger Count:</span>
            <p className="font-medium">{rule.triggerCount}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(rule)} className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(rule.id)} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const AutomationRules = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: "rule-01",
      name: "Auto Irrigation - Low Soil",
      description: "Activate irrigation when soil moisture drops below 30%",
      isActive: true,
      trigger: {
        type: "sensor",
        sensor: "soil_moisture",
        condition: "below",
        value: 30
      },
      action: {
        type: "irrigation",
        duration: 600,
        intensity: 75
      },
      lastTriggered: "2 hours ago",
      triggerCount: 24
    },
    {
      id: "rule-02", 
      name: "Evening Light Schedule",
      description: "Turn on grow lights at sunset for 6 hours",
      isActive: true,
      trigger: {
        type: "time",
        time: "18:00"
      },
      action: {
        type: "lighting",
        duration: 21600,
        intensity: 80
      },
      schedule: {
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        startTime: "18:00",
        endTime: "00:00"
      },
      lastTriggered: "Yesterday",
      triggerCount: 15
    },
    {
      id: "rule-03",
      name: "Temperature Control",
      description: "Activate ventilation when temperature exceeds 26°C",
      isActive: false,
      trigger: {
        type: "sensor",
        sensor: "temperature", 
        condition: "above",
        value: 26
      },
      action: {
        type: "ventilation",
        duration: 1800,
        intensity: 60
      },
      lastTriggered: "3 days ago",
      triggerCount: 8
    }
  ]);

  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleToggleRule = (ruleId: string, active: boolean) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: active } : rule
    ));
    
    toast({
      title: active ? "Rule Activated" : "Rule Deactivated",
      description: `Automation rule has been ${active ? "enabled" : "disabled"}.`,
    });
  };

  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: "Rule Deleted",
      description: "Automation rule has been removed.",
    });
  };

  const handleCreateRule = () => {
    setIsCreating(true);
    setEditingRule({
      id: `rule-${Date.now()}`,
      name: "",
      description: "",
      isActive: false,
      trigger: { type: "sensor" },
      action: { type: "irrigation" },
      triggerCount: 0
    });
  };

  const handleSaveRule = () => {
    if (editingRule) {
      if (isCreating) {
        setRules(prev => [...prev, editingRule]);
        toast({
          title: "Rule Created",
          description: "New automation rule has been added.",
        });
      } else {
        setRules(prev => prev.map(rule => 
          rule.id === editingRule.id ? editingRule : rule
        ));
        toast({
          title: "Rule Updated", 
          description: "Automation rule has been saved.",
        });
      }
      
      setEditingRule(null);
      setIsCreating(false);
    }
  };

  const activeRules = rules.filter(rule => rule.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Automation Rules</h2>
          <p className="text-muted-foreground">Create and manage intelligent automation for your greenhouse</p>
        </div>
        <Button onClick={handleCreateRule} className="transition-smooth">
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Rule Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-elegant border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{rules.length}</div>
              <div className="text-sm text-muted-foreground">Total Rules</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-elegant border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{activeRules}</div>
              <div className="text-sm text-muted-foreground">Active Rules</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-elegant border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{rules.reduce((sum, rule) => sum + rule.triggerCount, 0)}</div>
              <div className="text-sm text-muted-foreground">Total Triggers</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onToggle={handleToggleRule}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
          />
        ))}
      </div>

      {/* Rule Editor Dialog */}
      <Dialog open={!!editingRule} onOpenChange={() => { setEditingRule(null); setIsCreating(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Create" : "Edit"} Automation Rule</DialogTitle>
            <DialogDescription>
              Configure triggers and actions for intelligent automation
            </DialogDescription>
          </DialogHeader>
          
          {editingRule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter rule name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-description">Description</Label>
                <Input
                  id="rule-description"
                  value={editingRule.description}
                  onChange={(e) => setEditingRule(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Describe what this rule does"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select 
                    value={editingRule.trigger.type} 
                    onValueChange={(value: "sensor" | "time" | "manual") => 
                      setEditingRule(prev => prev ? { 
                        ...prev, 
                        trigger: { ...prev.trigger, type: value } 
                      } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sensor">Sensor Reading</SelectItem>
                      <SelectItem value="time">Time Schedule</SelectItem>
                      <SelectItem value="manual">Manual Trigger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select 
                    value={editingRule.action.type} 
                    onValueChange={(value: "irrigation" | "ventilation" | "lighting" | "heating" | "notification") => 
                      setEditingRule(prev => prev ? { 
                        ...prev, 
                        action: { ...prev.action, type: value } 
                      } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="irrigation">Irrigation</SelectItem>
                      <SelectItem value="ventilation">Ventilation</SelectItem>
                      <SelectItem value="lighting">Lighting</SelectItem>
                      <SelectItem value="heating">Heating</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingRule.trigger.type === "sensor" && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label>Sensor</Label>
                    <Select 
                      value={editingRule.trigger.sensor} 
                      onValueChange={(value) => 
                        setEditingRule(prev => prev ? { 
                          ...prev, 
                          trigger: { ...prev.trigger, sensor: value } 
                        } : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temperature">Temperature</SelectItem>
                        <SelectItem value="humidity">Humidity</SelectItem>
                        <SelectItem value="soil_moisture">Soil Moisture</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select 
                      value={editingRule.trigger.condition} 
                      onValueChange={(value: "above" | "below" | "equals") => 
                        setEditingRule(prev => prev ? { 
                          ...prev, 
                          trigger: { ...prev.trigger, condition: value } 
                        } : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={editingRule.trigger.value || ""}
                      onChange={(e) => setEditingRule(prev => prev ? { 
                        ...prev, 
                        trigger: { ...prev.trigger, value: Number(e.target.value) } 
                      } : null)}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => { setEditingRule(null); setIsCreating(false); }} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveRule} className="flex-1">
                  {isCreating ? "Create Rule" : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};