import { useState } from "react";
import type { AdminAlertRow } from "../../lib/adminApi";
import { formatRelativeTime } from "../../lib/farmApi";
import { getUserId, updateAlert } from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { StatusBadge, TableFilter, matchesQuery, severityTone } from "./adminUi";

export function AdminAlerts({
  rows,
  onResolved,
}: {
  rows: AdminAlertRow[];
  onResolved: () => void;
}) {
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const visible = rows.filter((row) =>
    matchesQuery(query, row.title, row.greenhouseCode, row.farmerName, row.severity)
  );

  const resolve = async (id: number) => {
    const userId = getUserId() ?? "";
    setBusyId(id);
    try {
      await updateAlert(userId, id, { is_resolved: true, is_read: true });
      onResolved();
    } catch {
      /* keep row */
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg">Alerts</CardTitle>
        <TableFilter value={query} onChange={setQuery} placeholder="Search alerts, houses, farmers…" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alert</TableHead>
              <TableHead>Greenhouse</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  No alerts match this search.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.title}</div>
                    <div className="max-w-md text-xs text-muted-foreground">{row.description}</div>
                  </TableCell>
                  <TableCell>{row.greenhouseCode}</TableCell>
                  <TableCell>{row.farmerName}</TableCell>
                  <TableCell>
                    <StatusBadge label={row.severity} tone={severityTone(row.severity)} />
                  </TableCell>
                  <TableCell>{formatRelativeTime(row.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={row.isResolved ? "Resolved" : "Open"}
                      tone={row.isResolved ? "ok" : "warn"}
                    />
                  </TableCell>
                  <TableCell>
                    {!row.isResolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        disabled={busyId === row.id}
                        onClick={() => void resolve(row.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
