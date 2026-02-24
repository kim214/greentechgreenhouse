import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className={cn("rounded-xl", className)} aria-label="Theme">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "rounded-xl transition-all duration-300",
        "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode (Grow)"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300" />
      )}
    </Button>
  );
}
