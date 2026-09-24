import { useState } from "react";
import type { AdminGreenhouseRow } from "../../lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { StatusBadge, TableFilter, accountTone, matchesQuery } from "./adminUi";

export function GreenhouseTable({ rows }: { rows: AdminGreenhouseRow[] }) {
  const [query, setQuery] = useState("");
  const visible = rows.filter((row) =>
    matchesQuery(query, row.code, row.name, row.ownerName, row.location, row.cropName, row.status, row.mode)
  );

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg">Greenhouses</CardTitle>
        <TableFilter value={query} onChange={setQuery} placeholder="Search houses, owners, crops…" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Crop</TableHead>
              <TableHead>Temp</TableHead>
              <TableHead>Humidity</TableHead>
              <TableHead>Soil</TableHead>
              <TableHead>Devices</TableHead>
              <TableHead>Automation</TableHead>
              <TableHead>Last activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-muted-foreground">
                  No greenhouses match this search.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.code}</div>
                    <div className="text-xs text-muted-foreground">{row.name}</div>
                  </TableCell>
                  <TableCell>{row.ownerName}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.cropName}</TableCell>
                  <TableCell>{row.temp != null ? `${row.temp.toFixed(1)}°C` : "—"}</TableCell>
                  <TableCell>{row.humidity != null ? `${Math.round(row.humidity)}%` : "—"}</TableCell>
                  <TableCell>{row.soil != null ? `${Math.round(row.soil)}%` : "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <StatusBadge label={row.status} tone={accountTone(row.status)} />
                      <span className="text-xs text-muted-foreground">
                        {row.devicesTotal > 0 ? `${row.devicesOnline}/${row.devicesTotal}` : "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{row.mode}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {row.irrigating && <StatusBadge label="Irrigation running" tone="ok" />}
                      {row.ventilating && <StatusBadge label="Ventilation open" tone="warn" />}
                      {!row.irrigating && !row.ventilating && (
                        <span className="text-xs text-muted-foreground">Idle</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{row.lastActivity}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
