import { useState } from "react";
import { Save, Key, Shield, Users, Eye, EyeOff, Copy, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  status: "active" | "revoked";
}

interface UserPermission {
  id: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  permissions: string[];
  lastLogin?: string;
  status: "active" | "pending" | "suspended";
}

export const SecuritySettings = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("4-hours");
  const [auditLogging, setAuditLogging] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(true);
  const [apiAccess, setApiAccess] = useState(true);
  
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "key-1",
      name: "Mobile App API",
      key: "gt_ak_1234567890abcdef",
      permissions: ["read:sensors", "read:cameras", "write:controls"],
      createdAt: "2024-01-15",
      lastUsed: "2 hours ago",
      status: "active"
    },
    {
      id: "key-2", 
      name: "External Monitoring",
      key: "gt_ak_fedcba0987654321",
      permissions: ["read:sensors", "read:alerts"],
      createdAt: "2024-01-10",
      lastUsed: "1 day ago",
      status: "active"
    }
  ]);

  const [users, setUsers] = useState<UserPermission[]>([
    {
      id: "user-1",
      email: "admin@greenhouse.com",
      role: "admin",
      permissions: ["*"],
      lastLogin: "2 hours ago",
      status: "active"
    },
    {
      id: "user-2",
      email: "operator@greenhouse.com", 
      role: "operator",
      permissions: ["read:*", "write:controls", "write:settings"],
      lastLogin: "1 day ago",
      status: "active"
    },
    {
      id: "user-3",
      email: "viewer@greenhouse.com",
      role: "viewer", 
      permissions: ["read:sensors", "read:cameras", "read:alerts"],
      lastLogin: "3 days ago",
      status: "pending"
    }
  ]);

  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [newApiKeyDialog, setNewApiKeyDialog] = useState(false);

  const handleSave = () => {
    toast({
      title: "Security Settings Saved",
      description: "All security configurations have been updated successfully.",
    });
  };

  const handleGenerateApiKey = () => {
    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name: "New API Key",
      key: `gt_ak_${Math.random().toString(36).substring(2, 18)}`,
      permissions: ["read:sensors"],
      createdAt: new Date().toISOString().split('T')[0],
      status: "active"
    };
    
    setApiKeys(prev => [...prev, newKey]);
    setNewApiKeyDialog(false);
    
    toast({
      title: "API Key Generated",
      description: "New API key has been created. Make sure to copy it now as it won't be shown again.",
    });
  };

  const handleRevokeApiKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, status: "revoked" as const } : key
    ));
    
    toast({
      title: "API Key Revoked",
      description: "The API key has been revoked and can no longer be used.",
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied to Clipboard",
      description: "API key has been copied to your clipboard.",
    });
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 12) + "..." + key.substring(key.length - 4);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Security & Access Control</h2>
          <p className="text-muted-foreground">Manage authentication, permissions, and API access</p>
        </div>
        <Button onClick={handleSave} className="transition-smooth">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Authentication Settings */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Authentication & Security</span>
          </CardTitle>
          <CardDescription>Configure login security and session management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require 2FA for all user logins</p>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
          </div>

          <div className="space-y-2">
            <Label>Session Timeout</Label>
            <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30-minutes">30 Minutes</SelectItem>
                <SelectItem value="1-hour">1 Hour</SelectItem>
                <SelectItem value="4-hours">4 Hours</SelectItem>
                <SelectItem value="8-hours">8 Hours</SelectItem>
                <SelectItem value="24-hours">24 Hours</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Audit Logging</Label>
              <p className="text-sm text-muted-foreground">Log all user actions and system changes</p>
            </div>
            <Switch checked={auditLogging} onCheckedChange={setAuditLogging} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">IP Address Whitelist</Label>
              <p className="text-sm text-muted-foreground">Restrict access to approved IP addresses</p>
            </div>
            <Switch checked={ipWhitelist} onCheckedChange={setIpWhitelist} />
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </CardTitle>
          <CardDescription>Manage user access and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{user.email}</span>
                    <Badge variant={user.status === "active" ? "default" : user.status === "pending" ? "secondary" : "destructive"}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Role: {user.role}</span>
                    {user.lastLogin && <span>Last login: {user.lastLogin}</span>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  {user.status === "active" && (
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </CardContent>
      </Card>

      {/* API Keys Management */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>API Keys</span>
            </div>
            <div className="flex items-center space-x-2">
              <Label className="text-sm">API Access</Label>
              <Switch checked={apiAccess} onCheckedChange={setApiAccess} />
            </div>
          </CardTitle>
          <CardDescription>Manage API keys for external integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{apiKey.name}</span>
                      <Badge variant={apiKey.status === "active" ? "default" : "destructive"}>
                        {apiKey.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground font-mono">
                        {showApiKey === apiKey.id ? apiKey.key : maskApiKey(apiKey.key)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                      >
                        {showApiKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyKey(apiKey.key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    {apiKey.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeApiKey(apiKey.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex space-x-4">
                    <span>Created: {apiKey.createdAt}</span>
                    {apiKey.lastUsed && <span>Last used: {apiKey.lastUsed}</span>}
                  </div>
                  <div className="flex space-x-1">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Dialog open={newApiKeyDialog} onOpenChange={setNewApiKeyDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Generate New API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key for external integrations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Key Name</Label>
                  <Input placeholder="Enter a descriptive name" />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <Select defaultValue="read-only">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read-only">Read Only</SelectItem>
                      <SelectItem value="read-write">Read & Write</SelectItem>
                      <SelectItem value="admin">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setNewApiKeyDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateApiKey} className="flex-1">
                    Generate Key
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Monitor authentication and access events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
              <span>User login: admin@greenhouse.com</span>
              <span className="text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
              <span>API key used: Mobile App API</span>
              <span className="text-muted-foreground">3 hours ago</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
              <span>Failed login attempt</span>
              <span className="text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};