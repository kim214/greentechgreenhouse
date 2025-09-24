import { Bell, Leaf, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  alertCount?: number;
}

export const DashboardHeader = ({ alertCount = 0 }: DashboardHeaderProps) => {
  return (
    <header className="border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">GreenTech</h1>
              <p className="text-sm text-muted-foreground">Smart Greenhouse Control</p>
            </div>
          </div>

          {/* Current Time & Date */}
          <div className="hidden md:block text-center">
            <div className="text-lg font-semibold text-foreground">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button variant="outline" size="icon" className="relative transition-smooth">
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center"
                >
                  {alertCount}
                </Badge>
              )}
            </Button>

            {/* Settings */}
            <Button variant="outline" size="icon" className="transition-smooth">
              <Settings className="w-4 h-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="transition-smooth">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};