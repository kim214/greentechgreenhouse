import { Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { CropRow } from "../../lib/farmApi";
import { cn } from "../../lib/utils";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function CropStatus({ crop }: { crop: CropRow | null }) {
  if (!crop) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Leaf className="h-5 w-5 text-primary" />
            Crop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No crop is assigned to this house yet.</p>
        </CardContent>
      </Card>
    );
  }

  const stressed = crop.health_status === "stressed";
  const unknown = crop.health_status === "unknown";

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg font-display">
          <span className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            {crop.name}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight",
              stressed
                ? "bg-destructive/10 text-destructive"
                : unknown
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary"
            )}
          >
            {crop.health_status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Variety" value={crop.variety || "—"} />
        <Info label="Growth stage" value={crop.growth_stage} />
        <Info label="Planted" value={formatDate(crop.planted_at)} />
        <Info label="Expected harvest" value={formatDate(crop.expected_harvest)} />
        <Info
          label="Estimated yield"
          value={crop.estimated_yield_kg != null ? `${crop.estimated_yield_kg} kg` : "—"}
        />
        <Info label="Environment" value={stressed ? "Needs attention" : unknown ? "No recent data" : "On target"} />
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium capitalize text-foreground">{value}</div>
    </div>
  );
}
