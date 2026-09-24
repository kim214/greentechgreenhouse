import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatRelativeTime, type ActivityRow, type AutomationEventRow } from "../../lib/farmApi";

function labelEvent(type: string) {
  return type.replace(/_/g, " ");
}

export function AutomationFeed({
  events,
  activity,
}: {
  events: AutomationEventRow[];
  activity: ActivityRow[];
}) {
  const lines =
    events.length > 0
      ? events.map((ev) => ({
          id: `auto-${ev.id}`,
          title: labelEvent(ev.event_type),
          detail: ev.reason,
          time: ev.occurred_at,
        }))
      : activity.map((row) => ({
          id: `act-${row.id}`,
          title: row.message,
          detail: null as string | null,
          time: row.occurred_at,
        }));

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <Activity className="h-5 w-5 text-primary" />
          Recent automation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">No automation events for this house yet.</p>
        ) : (
          <ul className="space-y-3">
            {lines.slice(0, 8).map((line) => (
              <li key={line.id} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium capitalize text-foreground">{line.title}</p>
                  {line.detail && <p className="text-xs text-muted-foreground">{line.detail}</p>}
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatRelativeTime(line.time)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
