import { useState } from "react";
import type { AdminFarmerRow } from "../../lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { StatusBadge, TableFilter, accountTone, matchesQuery } from "./adminUi";

export function FarmerTable({ rows }: { rows: AdminFarmerRow[] }) {
  const [query, setQuery] = useState("");
  const visible = rows.filter((row) =>
    matchesQuery(query, row.name, row.location, row.greenhouseCode, row.cropName, row.status)
  );

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg">Farmers</CardTitle>
        <TableFilter value={query} onChange={setQuery} placeholder="Search farmers, houses, crops…" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farmer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Greenhouse</TableHead>
              <TableHead>Crop</TableHead>
              <TableHead>Devices</TableHead>
              <TableHead>Last activity</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground">
                  No farmers match this search.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>
                    <StatusBadge label={row.status} tone={accountTone(row.status)} />
                  </TableCell>
                  <TableCell>
                    {row.greenhouseCode}
                    {row.greenhouseName !== "—" ? ` · ${row.greenhouseName}` : ""}
                  </TableCell>
                  <TableCell>{row.cropName}</TableCell>
                  <TableCell>
                    {row.devicesTotal > 0 ? `${row.devicesOnline}/${row.devicesTotal}` : "—"}
                  </TableCell>
                  <TableCell>{row.lastActivity}</TableCell>
                  <TableCell>
                    {new Date(row.registeredAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
