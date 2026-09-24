import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { type MonthPoint } from "../../../lib/financeMetrics";
import type { ForecastMode, TimelineRange } from "../../../lib/financeTypes";
import { useMoney } from "../../../hooks/useFinanceCurrency";

const COLORS = ["#2f8f5b", "#3d7ea6", "#c4922a", "#6b7280", "#1f6b4a", "#8a5a3b", "#4b5563"];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] overflow-x-auto">{children}</CardContent>
    </Card>
  );
}

export function FinanceTimeline({
  series,
  forecast,
  months,
  onMonths,
  mode,
  onMode,
  onMonth,
}: {
  series: MonthPoint[];
  forecast: Array<{ key: string; label: string; projected: number; low: number; high: number }>;
  months: TimelineRange;
  onMonths: (n: TimelineRange) => void;
  mode: ForecastMode;
  onMode: (m: ForecastMode) => void;
  onMonth: (key: string) => void;
}) {
  const { money, moneyCompact } = useMoney();
  const merged = [
    ...series.map((s) => ({
      ...s,
      showCollected: mode === "forecast" ? null : s.collected,
      showProjected: mode === "actual" ? null : s.projected,
    })),
    ...(mode === "actual"
      ? []
      : forecast.map((f) => ({
          key: f.key,
          label: f.label,
          collected: 0,
          showCollected: null as number | null,
          showProjected: f.projected,
          projected: f.projected,
          projectedLow: f.low,
          projectedHigh: f.high,
          transactions: 0,
          average: 0,
          mom: null as number | null,
          verified: 0,
        }))),
  ];

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg">Revenue performance</CardTitle>
        <div className="flex flex-wrap gap-2">
          {([6, 12, 18] as const).map((n) => (
            <Button key={n} size="sm" variant={months === n ? "default" : "outline"} onClick={() => onMonths(n)}>
              {n}M
            </Button>
          ))}
          {(["actual", "forecast", "both"] as const).map((m) => (
            <Button key={m} size="sm" variant={mode === m ? "secondary" : "ghost"} onClick={() => onMode(m)}>
              {m === "both" ? "Actual + forecast" : m === "actual" ? "Actual" : "Forecast"}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={merged}
            onClick={(e) => {
              const label = (e as { activeLabel?: string })?.activeLabel;
              const row = merged.find((r) => r.label === label);
              if (row?.key) onMonth(row.key);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={merged.length > 12 ? 1 : 0} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => moneyCompact(Number(v))} />
            <Tooltip
              formatter={(value: number, name: string) => [money(value), name]}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as MonthPoint;
                return (
                  <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
                    <div className="font-medium">{row.label}</div>
                    <div>Recorded: {money(row.collected)}</div>
                    <div>Projected: {money(row.projected)}</div>
                    <div>Transactions: {row.transactions}</div>
                    <div>Average: {money(row.average)}</div>
                    <div>MoM: {row.mom == null ? "—" : `${row.mom}%`}</div>
                  </div>
                );
              }}
            />
            <Legend />
            {mode !== "forecast" && (
              <Area
                type="monotone"
                dataKey="showCollected"
                name="Recorded receipts"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.14)"
                strokeWidth={2}
                connectNulls
              />
            )}
            {mode !== "actual" && (
              <Line
                type="monotone"
                dataKey="showProjected"
                name="Projected"
                stroke="#8a8f7a"
                strokeDasharray="5 4"
                dot={false}
                strokeWidth={2}
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function FinanceAnalyticsCharts({
  series,
  sources,
  statuses,
  split,
  onSource,
  onStatus,
  onMonth,
}: {
  series: MonthPoint[];
  sources: Array<{ source: string; label: string; revenue: number; share: number }>;
  statuses: Array<{ status: string; count: number; amount: number }>;
  split: { newCustomers: number; returningCustomers: number; newRevenue: number; returningRevenue: number; activePaying: number };
  onSource: (source: string) => void;
  onStatus: (status: string) => void;
  onMonth: (key: string) => void;
}) {
  const { money, moneyCompact } = useMoney();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Monthly recorded receipts">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} onClick={(e) => e?.activeLabel && pickMonth(series, String(e.activeLabel), onMonth)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => moneyCompact(Number(v))} />
            <Tooltip formatter={(v: number) => money(v)} />
            <Bar dataKey="collected" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Month-over-month growth">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Line type="monotone" dataKey="mom" stroke="#3d7ea6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Successful transactions">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} onClick={(e) => e?.activeLabel && pickMonth(series, String(e.activeLabel), onMonth)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="transactions" fill="#3d7ea6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Average transaction value">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => moneyCompact(Number(v))} />
            <Tooltip formatter={(v: number) => money(v)} />
            <Line type="monotone" dataKey="average" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Recorded receipts by source">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sources}
              dataKey="revenue"
              nameKey="label"
              innerRadius={52}
              outerRadius={86}
              onClick={(_, i) => sources[i] && onSource(sources[i].source)}
            >
              {sources.map((s, i) => (
                <Cell key={s.source} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => money(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Payment status">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statuses} onClick={(e) => e?.activeLabel && onStatus(String(e.activeLabel))}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="status" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip formatter={(v: number, name) => (name === "amount" ? money(v) : v)} />
            <Bar dataKey="count" fill="#6b7280" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <Card className="border-border/50 bg-card shadow-sm lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">Customer revenue distribution</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Active paying" value={String(split.activePaying)} />
          <Stat label="New customers" value={String(split.newCustomers)} />
          <Stat label="Returning customers" value={String(split.returningCustomers)} />
          <Stat label="New-customer receipts" value={money(split.newRevenue)} />
          <Stat label="Returning-customer receipts" value={money(split.returningRevenue)} />
        </CardContent>
      </Card>
    </div>
  );
}

function pickMonth(series: MonthPoint[], label: string, onMonth: (key: string) => void) {
  const row = series.find((s) => s.label === label);
  if (row) onMonth(row.key);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 px-3 py-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
