import { useState } from "react";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { StatusBadge } from "../adminUi";
import {
  METHOD_LABEL,
  SOURCE_LABEL,
  STATUS_LABEL,
  type DatePreset,
  type FinanceCustomer,
  type FinancePayment,
  type PaymentStatus,
  type RevenueSource,
} from "../../../lib/financeTypes";
import { type CustomerRevenueRow, type DateRange } from "../../../lib/financeMetrics";
import { useMoney } from "../../../hooks/useFinanceCurrency";
import { formatRelativeTime } from "../../../lib/farmApi";
import { cn } from "../../../lib/utils";
import {
  downloadReceipt,
  exportReconciliationCsv,
  exportRevenueCsv,
  exportSummaryPdf,
  exportTransactionsCsv,
  openInvoice,
  openReceipt,
} from "../../../lib/financeExport";

const PRESETS: Array<{ id: DatePreset; label: string }> = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "this_quarter", label: "This quarter" },
  { id: "this_year", label: "This year" },
  { id: "last_year", label: "Last year" },
  { id: "6m", label: "6 months" },
  { id: "12m", label: "12 months" },
  { id: "18m", label: "18 months" },
  { id: "custom", label: "Custom" },
];

export function FinanceFilters({
  preset,
  onPreset,
  custom,
  onCustom,
  source,
  onSource,
  status,
  onStatus,
  sources,
  customers,
  customerId,
  onCustomer,
  monthKey,
  onClearMonth,
  onRefresh,
}: {
  preset: DatePreset;
  onPreset: (p: DatePreset) => void;
  custom?: DateRange;
  onCustom: (r: DateRange) => void;
  source: RevenueSource | "all";
  onSource: (s: RevenueSource | "all") => void;
  status: string;
  onStatus: (s: string) => void;
  sources: RevenueSource[];
  customers: FinanceCustomer[];
  customerId: string;
  onCustomer: (id: string) => void;
  monthKey: string | null;
  onClearMonth: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.id} size="sm" variant={preset === p.id ? "default" : "outline"} onClick={() => onPreset(p.id)}>
            {p.label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={onRefresh} className="gap-1">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
      {preset === "custom" && (
        <div className="flex flex-wrap gap-3">
          <div>
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={custom ? format(custom.start, "yyyy-MM-dd") : ""}
              onChange={(e) =>
                onCustom({
                  start: new Date(e.target.value),
                  end: custom?.end ?? new Date(),
                })
              }
            />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={custom ? format(custom.end, "yyyy-MM-dd") : ""}
              onChange={(e) =>
                onCustom({
                  start: custom?.start ?? new Date(),
                  end: new Date(e.target.value),
                })
              }
            />
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={source === "all" ? "secondary" : "ghost"} onClick={() => onSource("all")}>
          All sources
        </Button>
        {sources.map((s) => (
          <Button key={s} size="sm" variant={source === s ? "secondary" : "ghost"} onClick={() => onSource(s)}>
            {SOURCE_LABEL[s]}
          </Button>
        ))}
        {(["all", "successful", "pending", "failed", "refunded"] as const).map((s) => (
          <Button key={s} size="sm" variant={status === s ? "outline" : "ghost"} onClick={() => onStatus(s)}>
            {s === "all" ? "All statuses" : STATUS_LABEL[s as PaymentStatus]}
          </Button>
        ))}
        <select
          value={customerId}
          onChange={(e) => onCustomer(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter by customer"
        >
          <option value="all">All customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {monthKey && (
          <Button size="sm" variant="secondary" onClick={onClearMonth}>
            Month {monthKey} ×
          </Button>
        )}
      </div>
    </div>
  );
}

export function FinanceSourceTable({
  rows,
  onSelect,
}: {
  rows: Array<{
    source: RevenueSource;
    label: string;
    transactions: number;
    customers: number;
    revenue: number;
    share: number;
    average: number;
    growth: number | null;
  }>;
  onSelect: (source: RevenueSource) => void;
}) {
  const { money } = useMoney();
  const [sort, setSort] = useState<keyof (typeof rows)[number]>("revenue");
  const ordered = [...rows].sort((a, b) => {
    const av = a[sort];
    const bv = b[sort];
    if (typeof av === "number" && typeof bv === "number") return bv - av;
    return String(av).localeCompare(String(bv));
  });
  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-lg">Revenue sources</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {(["label", "transactions", "customers", "revenue", "share", "average", "growth"] as const).map((col) => (
                <TableHead key={col}>
                  <button type="button" onClick={() => setSort(col)} className="font-medium capitalize">
                    {col === "label" ? "Source" : col === "share" ? "% of total" : col === "average" ? "Average" : col}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.map((row) => (
              <TableRow key={row.source} className="cursor-pointer" onClick={() => onSelect(row.source)}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell>{row.transactions}</TableCell>
                <TableCell>{row.customers}</TableCell>
                <TableCell className="tabular-nums">{money(row.revenue)}</TableCell>
                <TableCell>{row.share}%</TableCell>
                <TableCell className="tabular-nums">{money(row.average)}</TableCell>
                <TableCell>{row.growth == null ? "—" : `${row.growth}%`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function FinanceCustomerTable({
  rows,
  selectedId,
  onSelect,
  collected,
}: {
  rows: CustomerRevenueRow[];
  selectedId: string;
  onSelect: (customerId: string) => void;
  collected: number;
}) {
  const { money } = useMoney();
  const [sort, setSort] = useState<keyof CustomerRevenueRow>("revenue");
  const ordered = [...rows].sort((a, b) => {
    const av = a[sort];
    const bv = b[sort];
    if (typeof av === "number" && typeof bv === "number") return bv - av;
    return String(av).localeCompare(String(bv));
  });
  const sum = Math.round(rows.reduce((s, r) => s + r.revenue, 0) * 100) / 100;
  const tx = rows.reduce((s, r) => s + r.transactions, 0);
  const matches = Math.abs(sum - collected) < 0.02;

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="font-display text-lg">Revenue by customer</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Click a customer to show only their collected total. Each row lists the services that make up that amount.
          </p>
        </div>
        {selectedId !== "all" && (
          <Button size="sm" variant="outline" onClick={() => onSelect("all")}>
            All customers
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                {(["name", "transactions", "revenue", "share", "average"] as const).map((col) => (
                  <TableHead key={col}>
                    <button type="button" onClick={() => setSort(col)} className="font-medium capitalize">
                      {col === "name" ? "Customer" : col === "share" ? "% of total" : col}
                    </button>
                  </TableHead>
                ))}
                <TableHead>Made up of</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordered.map((row) => (
                <TableRow
                  key={row.customerId}
                  className={cn("cursor-pointer", selectedId === row.customerId && "bg-primary/5")}
                  onClick={() => onSelect(selectedId === row.customerId ? "all" : row.customerId)}
                >
                  <TableCell>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs capitalize text-muted-foreground">
                      {row.customerType}
                      {row.location ? ` · ${row.location}` : ""}
                    </div>
                  </TableCell>
                  <TableCell>{row.transactions}</TableCell>
                  <TableCell className="tabular-nums font-medium">{money(row.revenue)}</TableCell>
                  <TableCell>
                    <div className="tabular-nums">{row.share}%</div>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, row.share)}%` }} />
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{money(row.average)}</TableCell>
                  <TableCell>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {row.sources.map((s) => (
                        <li key={s.source}>
                          {s.label}: <span className="tabular-nums text-foreground">{money(s.amount)}</span> ({s.share}%)
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/40 font-medium">
                <TableCell>All customers</TableCell>
                <TableCell>{tx}</TableCell>
                <TableCell className="tabular-nums">{money(sum)}</TableCell>
                <TableCell>100%</TableCell>
                <TableCell />
                <TableCell className="text-xs text-muted-foreground">
                  {matches ? "Equals total revenue collected" : `Difference vs headline: ${money(Math.abs(sum - collected))}`}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 md:hidden">
          {ordered.map((row) => (
            <button
              key={row.customerId}
              type="button"
              onClick={() => onSelect(selectedId === row.customerId ? "all" : row.customerId)}
              className={cn(
                "w-full rounded-xl border border-border/50 p-3 text-left",
                selectedId === row.customerId && "border-primary bg-primary/5"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{row.name}</span>
                <span className="tabular-nums">{money(row.revenue)}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {row.transactions} payments · {row.share}% of collected
              </div>
              <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                {row.sources.map((s) => (
                  <li key={s.source}>
                    {s.label}: {money(s.amount)}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-muted-foreground">Last payment {formatRelativeTime(row.lastPaymentAt)}</p>
            </button>
          ))}
          <div className="rounded-xl border border-border/50 bg-muted/40 p-3 text-sm font-medium">
            All customers · {money(sum)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinanceInsights({ lines }: { lines: string[] }) {
  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-lg">Financial insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {lines.map((line) => (
            <li key={line} className="rounded-lg border border-border/50 px-3 py-2 text-sm text-foreground">
              {line}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function FinanceForecastPanel({
  months3,
  months6,
  months12,
}: {
  months3: number;
  months6: number;
  months12: number;
}) {
  const { money } = useMoney();
  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-lg">Revenue forecast</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-dashed border-border px-3 py-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Next 3 months</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">{money(months3)}</div>
          <p className="text-xs text-muted-foreground">Projected, not collected</p>
        </div>
        <div className="rounded-lg border border-dashed border-border px-3 py-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Next 6 months</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">{money(months6)}</div>
          <p className="text-xs text-muted-foreground">Projected, not collected</p>
        </div>
        <div className="rounded-lg border border-dashed border-border px-3 py-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Next 12 months</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">{money(months12)}</div>
          <p className="text-xs text-muted-foreground">Projected, not collected</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinanceExports({
  payments,
  monthly,
  range,
  recorded,
  verified,
  tx,
  pending,
  failed,
  refunds,
  outstanding,
  sources,
}: {
  payments: FinancePayment[];
  monthly: Array<{ label: string; collected: number; verified: number; transactions: number; average: number }>;
  range: DateRange;
  recorded: number;
  verified: number;
  tx: number;
  pending: number;
  failed: number;
  refunds: number;
  outstanding: number;
  sources: Array<{ label: string; revenue: number; share: number }>;
}) {
  const { money, currency } = useMoney();
  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-lg">Reports</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => void exportTransactionsCsv(payments, false, money, currency)}>
          Transaction CSV
        </Button>
        <Button variant="outline" onClick={() => void exportTransactionsCsv(payments, true, money, currency)}>
          Verified payments CSV
        </Button>
        <Button variant="outline" onClick={() => void exportRevenueCsv(monthly, money)}>
          Monthly revenue CSV
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            void exportSummaryPdf({
              range,
              recorded,
              verified,
              tx,
              pending,
              failed,
              refunds,
              outstanding,
              sources,
              money,
              currency,
            })
          }
        >
          Financial summary
        </Button>
        <Button variant="outline" onClick={() => void exportReconciliationCsv(payments, money, currency)}>
          Payment reconciliation
        </Button>
      </CardContent>
    </Card>
  );
}

export function FinanceDetail({
  payment,
  onClose,
}: {
  payment: FinancePayment | null;
  onClose: () => void;
}) {
  const { money, currency } = useMoney();
  if (!payment) return null;
  const verified = payment.data_origin === "verified";
  const stages = [
    { label: "Payment initiated", done: true },
    { label: "Payment received", done: payment.status !== "initiated" && payment.status !== "failed" },
    { label: "Payment verified", done: verified && payment.status === "successful" },
    { label: "Order confirmed", done: payment.status === "successful" },
  ];
  return (
    <Dialog open={!!payment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transaction {payment.transaction_id}</DialogTitle>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Field k="Payment reference" v={payment.payment_reference} />
          <Field k="Customer" v={payment.customer?.name ?? "—"} />
          <Field k="Contact" v={payment.customer?.email ?? payment.customer?.phone ?? "—"} />
          <Field k="Service" v={payment.product_name} />
          <Field k="Amount" v={money(payment.amount)} />
          <Field k="Display currency" v={currency} />
          <Field k="Ledger currency" v={payment.currency} />
          <Field k="Method" v={METHOD_LABEL[payment.payment_method]} />
          <Field k="Provider" v={payment.provider ?? "—"} />
          <Field k="Provider reference" v={payment.provider_reference ?? "Not returned by processor"} />
          <Field k="Status" v={STATUS_LABEL[payment.status]} />
          <Field k="Payment date" v={payment.payment_date ?? "—"} />
          <Field k="Invoice" v={payment.invoice?.invoice_number ?? "—"} />
          <Field k="Receipt" v={payment.receipt_number ?? "—"} />
          <Field k="Order" v={payment.order_id ?? "—"} />
          <Field k="System verification" v={verified ? "Provider-verified" : "Ledger recorded"} />
        </dl>
        {payment.failure_reason && <p className="text-sm text-destructive">{payment.failure_reason}</p>}
        <div className="mt-4 space-y-2">
          {stages.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              <StatusBadge label={s.done ? "Done" : "Open"} tone={s.done ? "ok" : "neutral"} />
              {s.label}
            </div>
          ))}
        </div>
        {payment.status === "successful" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => openReceipt(payment, money)}>
              Receipt
            </Button>
            <Button size="sm" variant="outline" onClick={() => openInvoice(payment, money)}>
              Invoice
            </Button>
            <Button size="sm" variant="outline" onClick={() => downloadReceipt(payment, money)}>
              Download receipt
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </>
  );
}
