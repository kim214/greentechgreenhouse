import { format, parseISO, startOfMonth, subMonths, addMonths, isWithinInterval } from "date-fns";
import type { FinanceInvoice, FinancePayment, RevenueSource } from "./financeTypes";
import { SOURCE_LABEL } from "./financeTypes";

export type DateRange = { start: Date; end: Date };

export const kes = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 2 }).format(n);

export const kesCompact = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);

const n = (v: unknown) => {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : 0;
};

export function isVerifiedCollected(p: FinancePayment) {
  return p.data_origin === "verified" && p.status === "successful";
}

export function isRecordedCollected(p: FinancePayment) {
  return p.status === "successful" && p.data_origin !== "forecast";
}

export function inRange(iso: string | null | undefined, range: DateRange) {
  if (!iso) return false;
  const d = parseISO(iso);
  if (Number.isNaN(d.getTime())) return false;
  return isWithinInterval(d, { start: range.start, end: range.end });
}

export function paymentStamp(p: FinancePayment) {
  return p.payment_date ?? p.created_at;
}

export type MonthPoint = {
  key: string;
  label: string;
  collected: number;
  verified: number;
  projected: number;
  projectedLow: number;
  projectedHigh: number;
  transactions: number;
  average: number;
  mom: number | null;
};

export function monthKeys(count: number, end = new Date()) {
  const keys: string[] = [];
  const cursor = startOfMonth(end);
  for (let i = count - 1; i >= 0; i--) keys.push(format(subMonths(cursor, i), "yyyy-MM"));
  return keys;
}

export function buildMonthSeries(payments: FinancePayment[], months: number, now = new Date()): MonthPoint[] {
  const keys = monthKeys(months, now);
  const collectedBy = new Map<string, { sum: number; count: number; verified: number }>();
  for (const key of keys) collectedBy.set(key, { sum: 0, count: 0, verified: 0 });

  for (const p of payments) {
    if (!isRecordedCollected(p)) continue;
    const key = format(parseISO(paymentStamp(p)), "yyyy-MM");
    const bucket = collectedBy.get(key);
    if (!bucket) continue;
    bucket.sum += n(p.amount);
    bucket.count += 1;
    if (isVerifiedCollected(p)) bucket.verified += n(p.amount);
  }

  const history = keys.map((key) => collectedBy.get(key)!);
  const recent = history.slice(-6).filter((b) => b.count > 0);
  const avg = recent.length ? recent.reduce((s, b) => s + b.sum, 0) / recent.length : 0;
  const prior = history.slice(-12, -6).filter((b) => b.count > 0);
  const priorAvg = prior.length ? prior.reduce((s, b) => s + b.sum, 0) / prior.length : avg * 0.82;
  const slope = priorAvg > 0 ? (avg - priorAvg) / Math.max(priorAvg, 1) : 0.08;
  const growth = Math.max(-0.04, Math.min(0.14, slope));

  return keys.map((key, i) => {
    const b = collectedBy.get(key)!;
    const prev = i > 0 ? collectedBy.get(keys[i - 1])! : null;
    const mom = prev && prev.sum > 0 ? ((b.sum - prev.sum) / prev.sum) * 100 : null;
    const projected = avg * Math.pow(1 + growth, i - (keys.length - 1));
    return {
      key,
      label: format(parseISO(`${key}-01`), "MMM yyyy"),
      collected: Math.round(b.sum * 100) / 100,
      verified: Math.round(b.verified * 100) / 100,
      projected: Math.round(Math.max(0, projected) * 100) / 100,
      projectedLow: Math.round(Math.max(0, projected * 0.86) * 100) / 100,
      projectedHigh: Math.round(projected * 1.12 * 100) / 100,
      transactions: b.count,
      average: b.count ? Math.round((b.sum / b.count) * 100) / 100 : 0,
      mom: mom == null ? null : Math.round(mom * 10) / 10,
    };
  });
}

export function buildForecast(series: MonthPoint[], months: number) {
  const hist = series.filter((p) => p.transactions > 0 || p.collected > 0);
  const last = hist.slice(-6);
  const base = last.length ? last.reduce((s, p) => s + p.collected, 0) / last.length : 0;
  const moms = last.map((p) => p.mom).filter((v): v is number => v != null);
  const g = moms.length ? moms.reduce((s, v) => s + v, 0) / moms.length / 100 : 0.045;
  const growth = Math.max(-0.03, Math.min(0.11, g));
  const lastDate = series.length ? parseISO(`${series[series.length - 1].key}-01`) : startOfMonth(new Date());
  return Array.from({ length: months }, (_, i) => {
    const d = addMonths(lastDate, i + 1);
    const mid = base * Math.pow(1 + growth, i + 1);
    return {
      key: format(d, "yyyy-MM"),
      label: format(d, "MMM yyyy"),
      projected: Math.round(mid * 100) / 100,
      low: Math.round(mid * (0.88 - i * 0.01) * 100) / 100,
      high: Math.round(mid * (1.1 + i * 0.015) * 100) / 100,
    };
  });
}

export function periodMetrics(payments: FinancePayment[], invoices: FinanceInvoice[], range: DateRange) {
  const inP = payments.filter((p) => inRange(paymentStamp(p), range));
  const recorded = inP.filter(isRecordedCollected);
  const verified = inP.filter(isVerifiedCollected);
  const pending = inP.filter((p) => p.status === "pending" || p.status === "initiated");
  const failed = inP.filter((p) => p.status === "failed");
  const refunds = inP.filter((p) => p.status === "refunded");
  const recordedSum = recorded.reduce((s, p) => s + n(p.amount), 0);
  const verifiedSum = verified.reduce((s, p) => s + n(p.amount), 0);
  const outstanding = invoices
    .filter((inv) => ["issued", "overdue"].includes(inv.status) && inRange(inv.issued_at, range) && inv.data_origin !== "forecast")
    .reduce((s, inv) => s + n(inv.amount), 0);
  const recurring = recorded.filter((p) => p.is_recurring);
  const paying = new Set(recorded.map((p) => p.customer_id));
  const spanMs = range.end.getTime() - range.start.getTime();
  const monthSpan = Math.max(1, spanMs / (30.44 * 24 * 3600 * 1000));

  const prevEnd = new Date(range.start.getTime() - 1);
  const prevStart = new Date(range.start.getTime() - spanMs);
  const prevRange = { start: prevStart, end: prevEnd };
  const prevRecorded = payments.filter((p) => isRecordedCollected(p) && inRange(paymentStamp(p), prevRange));
  const prevVerified = payments.filter((p) => isVerifiedCollected(p) && inRange(paymentStamp(p), prevRange));
  const prevSum = prevRecorded.reduce((s, p) => s + n(p.amount), 0);
  const prevVerifiedSum = prevVerified.reduce((s, p) => s + n(p.amount), 0);
  const growth = prevSum > 0 ? ((recordedSum - prevSum) / prevSum) * 100 : recordedSum > 0 ? 100 : 0;
  const verifiedGrowth =
    prevVerifiedSum > 0 ? ((verifiedSum - prevVerifiedSum) / prevVerifiedSum) * 100 : verifiedSum > 0 ? 100 : 0;

  const lastPay = [...recorded].sort((a, b) => paymentStamp(b).localeCompare(paymentStamp(a)))[0];

  return {
    recordedCollected: Math.round(recordedSum * 100) / 100,
    verifiedCollected: Math.round(verifiedSum * 100) / 100,
    pendingAmount: Math.round(pending.reduce((s, p) => s + n(p.amount), 0) * 100) / 100,
    failedAmount: Math.round(failed.reduce((s, p) => s + n(p.amount), 0) * 100) / 100,
    refundAmount: Math.round(refunds.reduce((s, p) => s + n(p.amount), 0) * 100) / 100,
    outstanding: Math.round(outstanding * 100) / 100,
    recurring: Math.round(recurring.reduce((s, p) => s + n(p.amount), 0) * 100) / 100,
    transactions: inP.length,
    successful: recorded.length,
    verifiedCount: verified.length,
    pending: pending.length,
    failed: failed.length,
    refunds: refunds.length,
    payingCustomers: paying.size,
    averageTx: recorded.length ? Math.round((recordedSum / recorded.length) * 100) / 100 : 0,
    averageMonthly: Math.round((recordedSum / monthSpan) * 100) / 100,
    growth: Math.round(growth * 10) / 10,
    verifiedGrowth: Math.round(verifiedGrowth * 10) / 10,
    successRate: inP.length ? Math.round((recorded.length / inP.length) * 1000) / 10 : 0,
    lastPaymentAt: lastPay ? paymentStamp(lastPay) : null,
    previousCollected: Math.round(prevSum * 100) / 100,
  };
}

export function sourceBreakdown(payments: FinancePayment[], range: DateRange) {
  const recorded = payments.filter((p) => isRecordedCollected(p) && inRange(paymentStamp(p), range));
  const total = recorded.reduce((s, p) => s + n(p.amount), 0);
  const map = new Map<RevenueSource, { revenue: number; count: number; customers: Set<string> }>();
  for (const p of recorded) {
    const row = map.get(p.revenue_source) ?? { revenue: 0, count: 0, customers: new Set<string>() };
    row.revenue += n(p.amount);
    row.count += 1;
    row.customers.add(p.customer_id);
    map.set(p.revenue_source, row);
  }
  const prevEnd = new Date(range.start.getTime() - 1);
  const prevStart = new Date(range.start.getTime() - (range.end.getTime() - range.start.getTime()));
  const prev = payments.filter((p) => isRecordedCollected(p) && inRange(paymentStamp(p), { start: prevStart, end: prevEnd }));
  return [...map.entries()]
    .map(([source, row]) => {
      const prevSum = prev.filter((p) => p.revenue_source === source).reduce((s, p) => s + n(p.amount), 0);
      return {
        source,
        label: SOURCE_LABEL[source],
        transactions: row.count,
        customers: row.customers.size,
        revenue: Math.round(row.revenue * 100) / 100,
        share: total > 0 ? Math.round((row.revenue / total) * 1000) / 10 : 0,
        average: row.count ? Math.round((row.revenue / row.count) * 100) / 100 : 0,
        growth: prevSum > 0 ? Math.round(((row.revenue - prevSum) / prevSum) * 1000) / 10 : null,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export type CustomerRevenueRow = {
  customerId: string;
  name: string;
  customerType: string;
  location: string | null;
  transactions: number;
  revenue: number;
  share: number;
  average: number;
  lastPaymentAt: string | null;
  sources: Array<{ source: RevenueSource; label: string; amount: number; share: number }>;
};

export function customerBreakdown(payments: FinancePayment[], range: DateRange): CustomerRevenueRow[] {
  const recorded = payments.filter((p) => isRecordedCollected(p) && inRange(paymentStamp(p), range));
  const total = recorded.reduce((s, p) => s + n(p.amount), 0);
  const map = new Map<
    string,
    {
      name: string;
      customerType: string;
      location: string | null;
      revenue: number;
      count: number;
      last: string | null;
      bySource: Map<RevenueSource, number>;
    }
  >();

  for (const p of recorded) {
    const row =
      map.get(p.customer_id) ??
      {
        name: p.customer?.name ?? "Unknown customer",
        customerType: p.customer?.customer_type ?? "—",
        location: p.customer?.location ?? null,
        revenue: 0,
        count: 0,
        last: null as string | null,
        bySource: new Map<RevenueSource, number>(),
      };
    row.revenue += n(p.amount);
    row.count += 1;
    const stamp = paymentStamp(p);
    if (!row.last || stamp > row.last) row.last = stamp;
    row.bySource.set(p.revenue_source, (row.bySource.get(p.revenue_source) ?? 0) + n(p.amount));
    map.set(p.customer_id, row);
  }

  return [...map.entries()]
    .map(([customerId, row]) => ({
      customerId,
      name: row.name,
      customerType: row.customerType,
      location: row.location,
      transactions: row.count,
      revenue: Math.round(row.revenue * 100) / 100,
      share: total > 0 ? Math.round((row.revenue / total) * 1000) / 10 : 0,
      average: row.count ? Math.round((row.revenue / row.count) * 100) / 100 : 0,
      lastPaymentAt: row.last,
      sources: [...row.bySource.entries()]
        .map(([source, amount]) => ({
          source,
          label: SOURCE_LABEL[source],
          amount: Math.round(amount * 100) / 100,
          share: row.revenue > 0 ? Math.round((amount / row.revenue) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.amount - a.amount),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function customerSplit(payments: FinancePayment[], range: DateRange) {
  const recorded = payments.filter((p) => isRecordedCollected(p) && inRange(paymentStamp(p), range));
  const firstByCustomer = new Map<string, string>();
  for (const p of [...payments].filter(isRecordedCollected).sort((a, b) => paymentStamp(a).localeCompare(paymentStamp(b)))) {
    if (!firstByCustomer.has(p.customer_id)) firstByCustomer.set(p.customer_id, paymentStamp(p));
  }
  let newRev = 0;
  let retRev = 0;
  let newCount = 0;
  let retCount = 0;
  const seen = new Set<string>();
  for (const p of recorded) {
    const first = firstByCustomer.get(p.customer_id);
    const isNew = first != null && inRange(first, range);
    if (isNew) {
      newRev += n(p.amount);
      if (!seen.has(p.customer_id)) newCount += 1;
    } else {
      retRev += n(p.amount);
      if (!seen.has(p.customer_id)) retCount += 1;
    }
    seen.add(p.customer_id);
  }
  return {
    newCustomers: newCount,
    returningCustomers: retCount,
    activePaying: seen.size,
    newRevenue: Math.round(newRev * 100) / 100,
    returningRevenue: Math.round(retRev * 100) / 100,
  };
}

export function statusBreakdown(payments: FinancePayment[], range: DateRange) {
  const inP = payments.filter((p) => inRange(paymentStamp(p), range) && p.data_origin !== "forecast");
  const groups = {
    successful: inP.filter((p) => p.status === "successful"),
    pending: inP.filter((p) => p.status === "pending" || p.status === "initiated"),
    failed: inP.filter((p) => p.status === "failed"),
    refunded: inP.filter((p) => p.status === "refunded"),
  };
  return (Object.keys(groups) as Array<keyof typeof groups>).map((status) => ({
    status,
    count: groups[status].length,
    amount: Math.round(groups[status].reduce((s, p) => s + n(p.amount), 0) * 100) / 100,
  }));
}

export function insights(opts: {
  metrics: ReturnType<typeof periodMetrics>;
  sources: ReturnType<typeof sourceBreakdown>;
  series: MonthPoint[];
  split: ReturnType<typeof customerSplit>;
  customers?: CustomerRevenueRow[];
  money?: (n: number) => string;
}) {
  const lines: string[] = [];
  const { metrics, sources, series, split, customers } = opts;
  const money = opts.money ?? kes;
  lines.push(
    `Total revenue collected is ${money(metrics.recordedCollected)} across ${metrics.successful} successful payment${metrics.successful === 1 ? "" : "s"}.`
  );
  if (metrics.verifiedCount > 0) {
    lines.push(
      `Of that, ${money(metrics.verifiedCollected)} is from ${metrics.verifiedCount} provider-confirmed payment${metrics.verifiedCount === 1 ? "" : "s"}.`
    );
  }
  if (metrics.previousCollected > 0) {
    lines.push(
      `Revenue ${metrics.growth >= 0 ? "increased" : "decreased"} ${Math.abs(metrics.growth).toFixed(1)}% compared with the previous period.`
    );
  }
  if (sources[0]) {
    lines.push(`${sources[0].label} contributed ${sources[0].share}% of collected revenue in the selected period.`);
  }
  lines.push(`Payment success rate is ${metrics.successRate}% across ${metrics.transactions} payment attempts.`);
  const filled = series.filter((s) => s.collected > 0);
  if (filled.length) {
    const hi = filled.reduce((a, b) => (b.collected > a.collected ? b : a));
    const lo = filled.reduce((a, b) => (b.collected < a.collected ? b : a));
    lines.push(`Highest recorded month is ${hi.label} at ${money(hi.collected)}; lowest is ${lo.label} at ${money(lo.collected)}.`);
  }
  if (customers && customers.length > 0) {
    const sum = Math.round(customers.reduce((s, c) => s + c.revenue, 0) * 100) / 100;
    lines.push(
      `${customers.length} paying customers contribute ${money(sum)}, matching collected revenue in this period.`
    );
    const top = customers[0];
    lines.push(
      `${top.name} is the largest account at ${money(top.revenue)} (${top.share}%), mainly from ${top.sources[0]?.label ?? "services"}.`
    );
  }
  if (split.activePaying > 0) {
    const arpc = metrics.recordedCollected / split.activePaying;
    lines.push(`Average revenue per paying customer is ${money(arpc)}.`);
  }
  if (metrics.outstanding > 0) {
    lines.push(`Outstanding issued invoices total ${money(metrics.outstanding)}.`);
  }
  const topShare = sources[0]?.share ?? 0;
  if (topShare >= 45) {
    lines.push(`Revenue is concentrated: the leading source accounts for ${topShare}% of recorded receipts.`);
  }
  return lines;
}

export function sparkline(series: MonthPoint[]) {
  return series.slice(-8).map((s) => ({ v: s.collected }));
}
