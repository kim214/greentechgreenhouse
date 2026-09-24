import { ArrowDownRight, ArrowUpRight, Banknote, Clock } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../../ui/card";
import { formatRelativeTime } from "../../../lib/farmApi";
import { type MonthPoint } from "../../../lib/financeMetrics";
import { useMoney } from "../../../hooks/useFinanceCurrency";
import { cn } from "../../../lib/utils";

type Metrics = {
  recordedCollected: number;
  verifiedCollected: number;
  pendingAmount: number;
  refundAmount: number;
  outstanding: number;
  recurring: number;
  transactions: number;
  successful: number;
  verifiedCount: number;
  pending: number;
  failed: number;
  refunds: number;
  payingCustomers: number;
  averageTx: number;
  averageMonthly: number;
  growth: number;
  verifiedGrowth: number;
  lastPaymentAt: string | null;
};

function Trend({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", up ? "text-primary" : "text-destructive")}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function FinanceKpis({
  metrics,
  month,
  quarter,
  year,
  spark,
  fetchedAt,
  sourceCount,
}: {
  metrics: Metrics;
  month: number;
  quarter: number;
  year: number;
  spark: MonthPoint[];
  fetchedAt: string | null;
  sourceCount: number;
}) {
  const { money, currency } = useMoney();
  const tiles = [
    { label: "This month", value: money(month) },
    { label: "This quarter", value: money(quarter) },
    { label: "This year", value: money(year) },
    { label: "Average monthly", value: money(metrics.averageMonthly) },
    { label: "Average transaction", value: money(metrics.averageTx) },
    { label: "Transactions", value: String(metrics.transactions) },
    { label: "Successful", value: String(metrics.successful) },
    { label: "Pending", value: `${metrics.pending} · ${money(metrics.pendingAmount)}` },
    { label: "Failed", value: String(metrics.failed) },
    { label: "Refunds", value: `${metrics.refunds} · ${money(metrics.refundAmount)}` },
    { label: "Outstanding", value: money(metrics.outstanding) },
    { label: "Recurring receipts", value: money(metrics.recurring) },
    { label: "Paying customers", value: String(metrics.payingCustomers) },
    { label: "Growth vs prior period", value: `${metrics.growth >= 0 ? "+" : ""}${metrics.growth.toFixed(1)}%` },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[1.4fr_1fr] lg:p-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Total revenue collected
            </p>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {money(metrics.recordedCollected)}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {currency} · successful payments · {metrics.successful} transaction
              {metrics.successful === 1 ? "" : "s"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <Trend value={metrics.growth} />
              <span className="text-muted-foreground">vs previous period</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Successful transactions</div>
                <div className="text-lg font-semibold tabular-nums">{metrics.successful}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Outstanding</div>
                <div className="text-lg font-semibold tabular-nums">{money(metrics.outstanding)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Average transaction</div>
                <div className="text-lg font-semibold tabular-nums">{money(metrics.averageTx)}</div>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Last payment {formatRelativeTime(metrics.lastPaymentAt)} · Updated {formatRelativeTime(fetchedAt)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sum of successful ledger payments in the selected period. Pending, failed, refunded, and projected amounts are excluded.
              {sourceCount > 0 ? ` ${sourceCount} revenue sources in the current filter.` : ""}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Banknote className="h-3.5 w-3.5 text-primary" />
              Recent collected revenue
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spark} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <Area type="monotone" dataKey="collected" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.12)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label} className="border-border/50 bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{tile.label}</div>
              <div className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{tile.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
