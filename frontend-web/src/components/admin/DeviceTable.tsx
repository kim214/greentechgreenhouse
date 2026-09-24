import { useState } from "react";
import type { AdminDeviceRow } from "../../lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { StatusBadge, TableFilter, matchesQuery } from "./adminUi";

export function DeviceTable({ rows }: { rows: AdminDeviceRow[] }) {
  const [query, setQuery] = useState("");
  const visible = rows.filter((row) =>
    matchesQuery(query, row.code, row.type, row.name, row.greenhouseCode, row.greenhouseName, row.powerStatus)
  );

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg">Devices</CardTitle>
        <TableFilter value={query} onChange={setQuery} placeholder="Search device ID, type, house…" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Greenhouse</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last heartbeat</TableHead>
              <TableHead>Power</TableHead>
              <TableHead>Sensor health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  No devices match this search.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.code}</div>
                    <div className="text-xs text-muted-foreground">{row.name}</div>
                  </TableCell>
                  <TableCell className="capitalize">{row.type.replace("_", " ")}</TableCell>
                  <TableCell>
                    {row.greenhouseCode}
                    {row.greenhouseName !== "—" ? ` · ${row.greenhouseName}` : ""}
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={row.isOnline ? "Online" : "Offline"} tone={row.isOnline ? "ok" : "bad"} />
                  </TableCell>
                  <TableCell>{row.lastHeartbeat}</TableCell>
                  <TableCell className="capitalize">{row.powerStatus}</TableCell>
                  <TableCell>{row.sensorHealth}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
