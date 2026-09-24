import { useState } from "react";
import type { AdminActivityRow } from "../../lib/adminApi";
import { formatRelativeTime } from "../../lib/farmApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TableFilter, matchesQuery } from "./adminUi";

export function ActivityTable({ rows }: { rows: AdminActivityRow[] }) {
  const [query, setQuery] = useState("");
  const visible = rows.filter((row) => matchesQuery(query, row.message, row.greenhouseCode));

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg">Activity</CardTitle>
        <TableFilter value={query} onChange={setQuery} placeholder="Search activity…" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Greenhouse</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  No activity matches this search.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.message}</TableCell>
                  <TableCell>{row.greenhouseCode}</TableCell>
                  <TableCell>{formatRelativeTime(row.occurredAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
