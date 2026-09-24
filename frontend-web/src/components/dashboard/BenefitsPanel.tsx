import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import type { BenefitMetrics } from "../../lib/benefitMetrics";

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function BenefitsPanel({
  metrics,
  title = "Operational benefits",
}: {
  metrics: BenefitMetrics;
  title?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Calculated from the last {metrics.windowDays} days of readings and irrigation history
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Water comparison</CardTitle>
          <CardDescription>
            Timer-style watering (two cycles/day at this house’s average cycle size) vs recorded
            smart irrigation
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Timer estimate</div>
            <div className="text-2xl font-bold tabular-nums">{Math.round(metrics.conventionalWaterLitres)} L</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Smart irrigation</div>
            <div className="text-2xl font-bold tabular-nums">{Math.round(metrics.smartWaterLitres)} L</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Water saved</div>
            <div className="text-2xl font-bold tabular-nums">{Math.round(metrics.waterSavedLitres)} L</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Saving</div>
            <div className="text-2xl font-bold tabular-nums">{metrics.waterSavedPct.toFixed(1)}%</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Irrigation frequency"
          value={`${metrics.irrigationPerDay.toFixed(2)} / day`}
          detail={`${metrics.irrigationCount} cycles in window`}
        />
        <Metric
          label="Automation efficiency"
          value={`${metrics.automationEfficiency}`}
          detail={`${metrics.autoSharePct.toFixed(0)}% auto actuations · / 100`}
        />
        <Metric
          label="Estimated yield"
          value={metrics.yieldKg != null ? `${metrics.yieldKg} kg` : "—"}
          detail={`Crop performance ${metrics.cropPerformance}/100`}
        />
        <Metric
          label="Crop performance"
          value={`${metrics.cropPerformance}`}
          detail="Health status plus time in preferred climate"
        />
        <Metric
          label="House uptime"
          value={`${metrics.uptimePct}%`}
          detail="Reading coverage and device heartbeats"
        />
        <Metric
          label="Resource utilization"
          value={`${metrics.resourceUtilization}%`}
          detail="Climate quality vs actuator load"
        />
        <Metric
          label="Environmental stability"
          value={`${metrics.environmentalStability}`}
          detail={`${metrics.inRangePct}% of readings in preferred bands`}
        />
        <Metric
          label="Climate in range"
          value={`${metrics.inRangePct}%`}
          detail="Temperature, humidity, and soil together"
        />
      </div>
    </div>
  );
}
