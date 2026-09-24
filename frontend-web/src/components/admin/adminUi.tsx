import { cn } from "../../lib/utils";
import { Input } from "../ui/input";

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "ok" | "warn" | "bad" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight",
        tone === "ok" && "bg-primary/10 text-primary",
        tone === "warn" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        tone === "bad" && "bg-destructive/10 text-destructive",
        tone === "neutral" && "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

export function accountTone(status: string): "ok" | "warn" | "bad" | "neutral" {
  if (status === "active" || status === "online") return "ok";
  if (status === "maintenance" || status === "inactive") return "warn";
  if (status === "offline") return "bad";
  return "neutral";
}

export function severityTone(severity: string): "ok" | "warn" | "bad" | "neutral" {
  if (severity === "critical" || severity === "high") return "bad";
  if (severity === "medium") return "warn";
  return "neutral";
}

export function matchesQuery(query: string, ...values: Array<string | number | null | undefined>) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return values.some((v) => String(v ?? "").toLowerCase().includes(q));
}

export function TableFilter({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="max-w-sm rounded-xl"
    />
  );
}
