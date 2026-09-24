import { cn } from "../../lib/utils";

export function LivePulse({ label, active }: { label: string; active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span
        className={cn(
          "relative flex h-2 w-2",
          active ? "text-primary" : "text-muted-foreground"
        )}
      >
        {active && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            active ? "bg-primary" : "bg-muted-foreground/50"
          )}
        />
      </span>
      <span className={active ? "text-primary" : "text-muted-foreground"}>{label}</span>
    </span>
  );
}
